/**
 * @fileoverview MediaPipe Hands Integration
 * @description Real-time hand tracking using MediaPipe Hands.
 *              Provides 21 landmarks per hand with 3D coordinates and visibility.
 *
 * This replaces the placeholder in record/learn pages with real tracking.
 *
 * Scientific basis:
 *   MediaPipe Hands detects 21 3D hand landmarks per hand using a palm
 *   detection model followed by a hand landmark model. The landmarks
 *   include x, y, z coordinates and a visibility score indicating
 *   occlusion confidence.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaPipeLandmark {
    x: number  // Normalized [0, 1] relative to image width
    y: number  // Normalized [0, 1] relative to image height
    z: number  // Relative depth (negative = closer to camera)
    visibility?: number  // Occlusion confidence [0, 1]
}

export interface HandDetection {
    landmarks: MediaPipeLandmark[]
    handedness: 'Left' | 'Right'
    confidence: number
}

export interface TrackingResult {
    /** Detected hands */
    hands: HandDetection[]
    /** Timestamp of detection */
    timestamp: number
    /** Processing time in ms */
    processingTimeMs: number
    /** Whether hand was detected */
    detected: boolean
    /** Overall confidence */
    overallConfidence: number
}

export interface HandTrackerConfig {
    /** Maximum hands to detect (1 or 2) */
    maxHands: number
    /** Model complexity (0=lite, 1=full) */
    modelComplexity: number
    /** Minimum detection confidence */
    minDetectionConfidence: number
    /** Minimum tracking confidence */
    minTrackingConfidence: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: HandTrackerConfig = {
    maxHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
}

/** MediaPipe hand landmark indices */
export const HAND_LANDMARKS = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_FINGER_MCP: 5,
    INDEX_FINGER_PIP: 6,
    INDEX_FINGER_DIP: 7,
    INDEX_FINGER_TIP: 8,
    MIDDLE_FINGER_MCP: 9,
    MIDDLE_FINGER_PIP: 10,
    MIDDLE_FINGER_DIP: 11,
    MIDDLE_FINGER_TIP: 12,
    RING_FINGER_MCP: 13,
    RING_FINGER_PIP: 14,
    RING_FINGER_DIP: 15,
    RING_FINGER_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20,
} as const

/** Fingertip indices for quick access */
export const FINGERTIP_INDICES = [
    HAND_LANDMARKS.THUMB_TIP,
    HAND_LANDMARKS.INDEX_FINGER_TIP,
    HAND_LANDMARKS.MIDDLE_FINGER_TIP,
    HAND_LANDMARKS.RING_FINGER_TIP,
    HAND_LANDMARKS.PINKY_TIP,
]

// ─────────────────────────────────────────────────────────────────────────────
// HandTracker Class
// ─────────────────────────────────────────────────────────────────────────────

export class HandTracker {
    private config: HandTrackerConfig
    private videoElement: HTMLVideoElement | null = null
    private canvasElement: HTMLCanvasElement | null = null
    private canvasCtx: CanvasRenderingContext2D | null = null
    private hands: unknown = null
    private camera: unknown = null
    private isRunning = false
    private onResults: ((result: TrackingResult) => void) | null = null

    constructor(config: Partial<HandTrackerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Initialize MediaPipe Hands
     */
    async initialize(
        videoElement: HTMLVideoElement,
        canvasElement: HTMLCanvasElement
    ): Promise<void> {
        this.videoElement = videoElement
        this.canvasElement = canvasElement
        this.canvasCtx = canvasElement.getContext('2d')

        // Dynamic import for MediaPipe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
        const MediaPipeHandsModule = await import('@mediapipe/hands') as any
        const HandsClass = MediaPipeHandsModule.Hands ?? MediaPipeHandsModule.default

        this.hands = new HandsClass({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            },
        })

        ;(this.hands as { setOptions: (config: Record<string, unknown>) => void }).setOptions({
            maxNumHands: this.config.maxHands,
            modelComplexity: this.config.modelComplexity,
            minDetectionConfidence: this.config.minDetectionConfidence,
            minTrackingConfidence: this.config.minTrackingConfidence,
        })

        ;(this.hands as { onResults: (callback: (results: unknown) => void) => void }).onResults(
            (results: unknown) => {
                this.handleResults(results as { multiHandLandmarks?: MediaPipeLandmark[][]; multiHandedness?: Array<{ label: string; score: number }>; image?: { width: number; height: number } })
            }
        )
    }

    /**
     * Start tracking
     */
    async start(onResults: (result: TrackingResult) => void): Promise<void> {
        if (!this.videoElement || !this.hands) {
            throw new Error('Tracker not initialized')
        }

        this.onResults = onResults
        this.isRunning = true

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user',
            },
        })

        this.videoElement.srcObject = stream
        await this.videoElement.play()

        // Start processing loop
        this.processFrame()
    }

    /**
     * Stop tracking
     */
    stop(): void {
        this.isRunning = false

        if (this.videoElement?.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            this.videoElement.srcObject = null
        }
    }

    /**
     * Process a single frame
     */
    private async processFrame(): Promise<void> {
        if (!this.isRunning || !this.videoElement || !this.hands) {
            return
        }

        const startTime = performance.now()

        try {
            await (this.hands as { send: (config: { image: HTMLVideoElement }) => Promise<void> }).send({ image: this.videoElement })
        } catch (error) {
            console.error('MediaPipe processing error:', error)
        }

        // Schedule next frame
        if (this.isRunning) {
            requestAnimationFrame(() => this.processFrame())
        }
    }

    /**
     * Handle MediaPipe results
     */
    private handleResults(results: {
        multiHandLandmarks?: MediaPipeLandmark[][]
        multiHandedness?: Array<{ label: string; score: number }>
        image?: { width: number; height: number }
    }): void {
        const processingTimeMs = performance.now()

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.onResults?.({
                hands: [],
                timestamp: Date.now(),
                processingTimeMs: 0,
                detected: false,
                overallConfidence: 0,
            })
            return
        }

        const hands: HandDetection[] = results.multiHandLandmarks.map((landmarks, i) => ({
            landmarks,
            handedness: (results.multiHandedness?.[i]?.label ?? 'Right') as 'Left' | 'Right',
            confidence: results.multiHandedness?.[i]?.score ?? 0,
        }))

        const overallConfidence = hands.reduce((sum, h) => sum + h.confidence, 0) / hands.length

        this.onResults?.({
            hands,
            timestamp: Date.now(),
            processingTimeMs: performance.now() - processingTimeMs,
            detected: true,
            overallConfidence,
        })
    }

    /**
     * Convert MediaPipe landmarks to our Landmark format
     */
    static toLandmarks(mediaPipeLandmarks: MediaPipeLandmark[]): Array<{
        x: number
        y: number
        z: number
        visibility: number
    }> {
        return mediaPipeLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility ?? 1.0,
        }))
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone Functions (for use without class instance)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate hand span (distance from wrist to middle finger tip)
 */
export function calculateHandSpan(landmarks: MediaPipeLandmark[]): number {
    const wrist = landmarks[HAND_LANDMARKS.WRIST]
    const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]

    if (!wrist || !middleTip) return 0

    const dx = middleTip.x - wrist.x
    const dy = middleTip.y - wrist.y
    const dz = middleTip.z - wrist.z

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate finger extension (how extended a finger is)
 */
export function calculateFingerExtension(
    landmarks: MediaPipeLandmark[],
    fingerTipIndex: number
): number {
    const tip = landmarks[fingerTipIndex]
    const pip = landmarks[fingerTipIndex - 2]

    if (!tip || !pip) return 0

    const dx = tip.x - pip.x
    const dy = tip.y - pip.y

    return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Detect pinch gesture (thumb tip close to index tip)
 */
export function detectPinch(landmarks: MediaPipeLandmark[]): boolean {
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
    const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]

    if (!thumbTip || !indexTip) return false

    const dx = thumbTip.x - indexTip.x
    const dy = thumbTip.y - indexTip.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance < 0.05 // 5% of image width
}

/**
 * Detect fist gesture (all fingertips close to palm)
 */
export function detectFist(landmarks: MediaPipeLandmark[]): boolean {
    const palmCenter = {
        x: (landmarks[HAND_LANDMARKS.WRIST].x + landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP].x) / 2,
        y: (landmarks[HAND_LANDMARKS.WRIST].y + landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP].y) / 2,
    }

    let allClose = true
    for (const tipIndex of FINGERTIP_INDICES) {
        const tip = landmarks[tipIndex]
        const dx = tip.x - palmCenter.x
        const dy = tip.y - palmCenter.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0.15) { // 15% threshold
            allClose = false
            break
        }
    }

    return allClose
}

/**
 * Detect open hand (all fingers extended)
 */
export function detectOpenHand(landmarks: MediaPipeLandmark[]): boolean {
    let allExtended = true

    for (const tipIndex of FINGERTIP_INDICES) {
        const extension = calculateFingerExtension(landmarks, tipIndex)
        if (extension < 0.08) { // 8% threshold
            allExtended = false
            break
        }
    }

    return allExtended
}

/**
 * Calculate palm orientation (angle of palm normal relative to camera)
 */
export function calculatePalmOrientation(landmarks: MediaPipeLandmark[]): {
    pitch: number
    yaw: number
    roll: number
} {
    const wrist = landmarks[HAND_LANDMARKS.WRIST]
    const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP]
    const pinkyMcp = landmarks[HAND_LANDMARKS.PINKY_MCP]
    const middleMcp = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP]

    // Palm normal (cross product of wrist->index and wrist->pinky)
    const v1 = { x: indexMcp.x - wrist.x, y: indexMcp.y - wrist.y, z: indexMcp.z - wrist.z }
    const v2 = { x: pinkyMcp.x - wrist.x, y: pinkyMcp.y - wrist.y, z: pinkyMcp.z - wrist.z }

    const normal = {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x,
    }

    // Calculate angles
    const pitch = Math.atan2(normal.y, normal.z) * (180 / Math.PI)
    const yaw = Math.atan2(normal.x, normal.z) * (180 / Math.PI)
    const roll = Math.atan2(
        middleMcp.y - wrist.y,
        middleMcp.x - wrist.x
    ) * (180 / Math.PI)

    return { pitch, yaw, roll }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton for quick use
// ─────────────────────────────────────────────────────────────────────────────

export const handTracker = new HandTracker()
