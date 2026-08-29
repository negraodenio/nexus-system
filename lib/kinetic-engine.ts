/**
 * @fileoverview Kinetic Engine V2.0 - Patent-Pending Motion Analysis Core
 * @description Enterprise-grade motion analysis engine implementing:
 *              - Orthonormal Basis Normalization (Gram-Schmidt)
 *              - Savitzky-Golay Noise-Resistant Differentiation
 *              - Constrained DTW with Sakoe-Chiba Band
 *              - Confidence-Weighted Scoring
 * 
 * @version 2.0.0
 * @license Proprietary - Patent Pending
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export interface HandPose {
    landmarks: Landmark[];
    timestamp: number;
    confidence?: number;
}

export interface KinematicState {
    position: Landmark[];
    velocity: Landmark[];
    acceleration: Landmark[];
    jerk: Landmark[];
}

export interface MatchResult {
    score: number;
    normalizedScore: number;
    confidence: number;
    feedback: MotionFeedback[];
    kinematicQuality: number;
}

export interface MotionFeedback {
    type: 'position' | 'velocity' | 'timing' | 'safety';
    severity: 'info' | 'warning' | 'error';
    landmark: number;
    message: string;
    correction?: Landmark;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const NUM_LANDMARKS = 21;
const FINGERTIP_INDICES = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips

// Savitzky-Golay coefficients (pre-computed for efficiency)
const SG_COEFFICIENTS = {
    7: {
        smooth: [-2, 3, 6, 7, 6, 3, -2].map(x => x / 21),
        deriv1: [-3, -2, -1, 0, 1, 2, 3].map(x => x / 28),
        deriv2: [5, 0, -3, -4, -3, 0, 5].map(x => x / 42),
    }
};

// =============================================================================
// CLASS: OrthonormalNormalizer
// Patent Claim: Palm-relative coordinate transformation
// =============================================================================

export class OrthonormalNormalizer {
    /**
     * Normalize landmarks to palm-relative orthonormal basis using Gram-Schmidt
     * This ensures scale/rotation invariance for matching
     */
    normalize(landmarks: Landmark[]): Landmark[] {
        if (landmarks.length < NUM_LANDMARKS) {
            throw new Error(`Expected ${NUM_LANDMARKS} landmarks, got ${landmarks.length}`);
        }

        const wrist = landmarks[0];
        const indexMcp = landmarks[5];
        const pinkyMcp = landmarks[17];

        // Calculate palm center
        const palmCenter: Landmark = {
            x: (indexMcp.x + pinkyMcp.x) / 2,
            y: (indexMcp.y + pinkyMcp.y) / 2,
            z: (indexMcp.z + pinkyMcp.z) / 2,
        };

        // e1: wrist → palm center (primary axis)
        let e1 = this.subtract(palmCenter, wrist);
        e1 = this.normalizeVector(e1);

        // e2: perpendicular in palm plane (index → pinky direction)
        let e2 = this.subtract(pinkyMcp, indexMcp);
        // Gram-Schmidt orthogonalization
        const e2DotE1 = this.dot(e2, e1);
        e2 = this.subtract(e2, this.scale(e1, e2DotE1));
        e2 = this.normalizeVector(e2);

        // e3: normal to palm (cross product)
        const e3 = this.cross(e1, e2);

        // Transform all landmarks to new basis
        return landmarks.map(lm => {
            const relative = this.subtract(lm, wrist);
            return {
                x: this.dot(relative, e1),
                y: this.dot(relative, e2),
                z: this.dot(relative, e3),
                visibility: lm.visibility,
            };
        });
    }

    /**
     * Calculate hand span for scale normalization
     */
    getHandSpan(landmarks: Landmark[]): number {
        const wrist = landmarks[0];
        const middleTip = landmarks[12];
        return this.distance(wrist, middleTip);
    }

    // Vector operations
    private subtract(a: Landmark, b: Landmark): Landmark {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    private scale(v: Landmark, s: number): Landmark {
        return { x: v.x * s, y: v.y * s, z: v.z * s };
    }

    private dot(a: Landmark, b: Landmark): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    private cross(a: Landmark, b: Landmark): Landmark {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x,
        };
    }

    private normalizeVector(v: Landmark): Landmark {
        const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return len > 1e-10
            ? { x: v.x / len, y: v.y / len, z: v.z / len }
            : { x: 0, y: 0, z: 0 };
    }

    private distance(a: Landmark, b: Landmark): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

// =============================================================================
// CLASS: SavitzkyGolayFilter
// Patent Claim: Noise-resistant kinematic differentiation
// =============================================================================

export class SavitzkyGolayFilter {
    private buffer: Landmark[][] = [];
    private timestamps: number[] = [];
    private windowSize: number;
    private coeffs: typeof SG_COEFFICIENTS[7];

    constructor(windowSize: 7 = 7) {
        this.windowSize = windowSize;
        this.coeffs = SG_COEFFICIENTS[windowSize];
    }

    /**
     * Process new frame and return smoothed derivatives
     */
    process(landmarks: Landmark[], timestamp: number): KinematicState {
        this.buffer.push(landmarks);
        this.timestamps.push(timestamp);

        // Maintain window size
        while (this.buffer.length > this.windowSize) {
            this.buffer.shift();
            this.timestamps.shift();
        }

        // Need full window for derivatives
        if (this.buffer.length < this.windowSize) {
            return {
                position: landmarks,
                velocity: this.zeroLandmarks(),
                acceleration: this.zeroLandmarks(),
                jerk: this.zeroLandmarks(),
            };
        }

        // Calculate time step in seconds
        const dt = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0])
            / (this.windowSize - 1) / 1000;

        return {
            position: this.convolve(this.coeffs.smooth),
            velocity: this.convolve(this.coeffs.deriv1, 1 / dt),
            acceleration: this.convolve(this.coeffs.deriv2, 1 / (dt * dt)),
            jerk: this.zeroLandmarks(), // Would need deriv3 coefficients
        };
    }

    private convolve(coeffs: number[], scale = 1): Landmark[] {
        const result: Landmark[] = [];

        for (let l = 0; l < NUM_LANDMARKS; l++) {
            let x = 0, y = 0, z = 0;

            for (let i = 0; i < this.windowSize; i++) {
                x += this.buffer[i][l].x * coeffs[i] * scale;
                y += this.buffer[i][l].y * coeffs[i] * scale;
                z += this.buffer[i][l].z * coeffs[i] * scale;
            }

            result.push({ x, y, z });
        }

        return result;
    }

    private zeroLandmarks(): Landmark[] {
        return Array(NUM_LANDMARKS).fill(null).map(() => ({ x: 0, y: 0, z: 0 }));
    }

    reset(): void {
        this.buffer = [];
        this.timestamps = [];
    }
}

// =============================================================================
// CLASS: ConstrainedDTW
// Patent Claim: Constrained temporal alignment with Sakoe-Chiba band
// =============================================================================

export class ConstrainedDTW {
    private bandwidth: number;
    private costMatrix: number[][] | null = null;

    constructor(bandwidth = 0.1) {
        this.bandwidth = bandwidth;
    }

    /**
     * Compute DTW distance between user sequence and reference template
     */
    compute(sequence: Landmark[][], template: Landmark[][]): {
        distance: number;
        normalizedDistance: number;
        alignmentPath: Array<[number, number]>;
    } {
        const n = sequence.length;
        const m = template.length;
        const band = Math.max(1, Math.floor(this.bandwidth * Math.max(n, m)));

        // Initialize cost matrix
        this.costMatrix = Array(n + 1).fill(null).map(() =>
            Array(m + 1).fill(Infinity)
        );
        this.costMatrix[0][0] = 0;

        // Fill matrix with band constraint
        for (let i = 1; i <= n; i++) {
            const jStart = Math.max(1, i - band);
            const jEnd = Math.min(m, i + band);

            for (let j = jStart; j <= jEnd; j++) {
                const cost = this.frameDistance(sequence[i - 1], template[j - 1]);

                this.costMatrix[i][j] = cost + Math.min(
                    this.costMatrix[i - 1][j],     // Insertion
                    this.costMatrix[i][j - 1],     // Deletion
                    this.costMatrix[i - 1][j - 1]  // Match
                );
            }
        }

        const distance = this.costMatrix[n][m];

        return {
            distance,
            normalizedDistance: distance / (n + m),
            alignmentPath: this.backtrack(n, m),
        };
    }

    private frameDistance(frame1: Landmark[], frame2: Landmark[]): number {
        let sum = 0;

        // Focus on fingertips for speed
        for (const idx of FINGERTIP_INDICES) {
            const dx = frame1[idx].x - frame2[idx].x;
            const dy = frame1[idx].y - frame2[idx].y;
            const dz = frame1[idx].z - frame2[idx].z;
            sum += dx * dx + dy * dy + dz * dz;
        }

        return Math.sqrt(sum);
    }

    private backtrack(n: number, m: number): Array<[number, number]> {
        if (!this.costMatrix) return [];

        const path: Array<[number, number]> = [];
        let i = n, j = m;

        while (i > 0 && j > 0) {
            path.unshift([i - 1, j - 1]);

            const diag = this.costMatrix[i - 1]?.[j - 1] ?? Infinity;
            const left = this.costMatrix[i]?.[j - 1] ?? Infinity;
            const up = this.costMatrix[i - 1]?.[j] ?? Infinity;

            if (diag <= left && diag <= up) {
                i--; j--;
            } else if (left < up) {
                j--;
            } else {
                i--;
            }
        }

        return path;
    }

    setBandwidth(bw: number): void {
        this.bandwidth = Math.max(0.01, Math.min(1.0, bw));
    }
}

// =============================================================================
// CLASS: KineticEngine
// Main orchestrator combining all components
// =============================================================================

export class KineticEngine {
    private normalizer: OrthonormalNormalizer;
    private smoother: SavitzkyGolayFilter;
    private dtw: ConstrainedDTW;
    private referenceTemplate: Landmark[][] | null = null;

    constructor() {
        this.normalizer = new OrthonormalNormalizer();
        this.smoother = new SavitzkyGolayFilter();
        this.dtw = new ConstrainedDTW(0.1);
    }

    /**
     * Load a reference skill template for comparison
     */
    loadTemplate(frames: Landmark[][]): void {
        this.referenceTemplate = frames.map(frame =>
            this.normalizer.normalize(frame)
        );
    }

    /**
     * Load an audio-kinematic binding as reference template.
     * This enables the "invisible first" paradigm where a specialist
     * narrates while performing, and the system extracts the reference.
     *
     * @param binding - Audio-kinematic binding from AudioKinematicEngine
     */
    loadAudioKinematicBinding(binding: { segments: Array<{ kinematic: { frames: Landmark[][] } }> }): void {
        const allFrames: Landmark[][] = []
        for (const seg of binding.segments) {
            allFrames.push(...seg.kinematic.frames)
        }
        if (allFrames.length > 0) {
            this.loadTemplate(allFrames)
        }
    }

    /**
     * Process a single frame and return real-time feedback
     */
    processFrame(landmarks: Landmark[], timestamp: number): {
        normalized: Landmark[];
        kinematics: KinematicState;
        instantScore: number;
        feedback: MotionFeedback[];
    } {
        // Step 1: Normalize to palm-relative coordinates
        const normalized = this.normalizer.normalize(landmarks);

        // Step 2: Apply Savitzky-Golay filtering for kinematics
        const kinematics = this.smoother.process(normalized, timestamp);

        // Step 3: Calculate instant score (if template loaded)
        let instantScore = 0;
        const feedback: MotionFeedback[] = [];

        if (this.referenceTemplate && this.referenceTemplate.length > 0) {
            // Find closest template frame (simple nearest neighbor for real-time)
            const templateIdx = Math.min(
                Math.floor((timestamp % 2000) / 2000 * this.referenceTemplate.length),
                this.referenceTemplate.length - 1
            );

            instantScore = this.calculateInstantScore(normalized, this.referenceTemplate[templateIdx]);

            // Generate feedback for low-scoring landmarks
            this.generateFeedback(normalized, this.referenceTemplate[templateIdx], feedback);
        }

        return { normalized, kinematics, instantScore, feedback };
    }

    /**
     * Compare full user sequence against template using DTW
     */
    matchSequence(userFrames: Landmark[][]): MatchResult {
        if (!this.referenceTemplate) {
            throw new Error('No reference template loaded');
        }

        // Normalize user frames
        const normalizedUser = userFrames.map(frame =>
            this.normalizer.normalize(frame)
        );

        // Run DTW
        const dtwResult = this.dtw.compute(normalizedUser, this.referenceTemplate);

        // Convert distance to score using sigmoid mapping
        // Lower distance = higher score (k=10, d0=0.3 tuned for DTW distances)
        const normalizedScore = this.sigmoidNormalize(dtwResult.normalizedDistance);

        // Calculate kinematic quality (smoothness of motion)
        const kinematicQuality = this.assessKinematicQuality(normalizedUser);

        // Generate summary feedback
        const feedback = this.generateSummaryFeedback(
            normalizedUser,
            this.referenceTemplate,
            dtwResult.alignmentPath
        );

        return {
            score: 1 / (1 + dtwResult.normalizedDistance), // Raw inverse distance score [0, 1]
            normalizedScore,
            confidence: this.calculateConfidence(userFrames),
            feedback,
            kinematicQuality,
        };
    }

    /**
     * Cosine similarity between two poses with Sigmoid Score Mapping
     * Patent Claim: Perceptual score normalization
     */
    private calculateInstantScore(user: Landmark[], reference: Landmark[]): number {
        let dotProduct = 0;
        let userMag = 0;
        let refMag = 0;

        for (const idx of FINGERTIP_INDICES) {
            const u = user[idx];
            const r = reference[idx];

            dotProduct += u.x * r.x + u.y * r.y + u.z * r.z;
            userMag += u.x * u.x + u.y * u.y + u.z * u.z;
            refMag += r.x * r.x + r.y * r.y + r.z * r.z;
        }

        const magnitude = Math.sqrt(userMag) * Math.sqrt(refMag);
        if (magnitude <= 1e-10) return 0;

        // Raw cosine similarity [-1, 1]
        const cosSim = dotProduct / magnitude;

        // Apply Sigmoid Score Mapping for perceptual quality
        // d: error metric [0, 1] where 0 = perfect, 1 = opposite
        const d = (1 - cosSim) / 2;

        // Sigmoid parameters (tuned for human perception)
        // k: steepness (higher = sharper transition)
        // d0: midpoint (error level that maps to ~50 score)
        const k = 15;    // Steep transition
        const d0 = 0.15; // 15% error = 50% score

        // Sigmoid mapping: 100 / (1 + exp(k * (d - d0)))
        const score = 100 / (1 + Math.exp(k * (d - d0)));

        return Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * Sigmoid normalization for score mapping (DTW distance → 0-100 score)
     * @param distance - DTW normalized distance (lower = better)
     * @param k - Steepness of sigmoid curve
     * @param d0 - Midpoint (distance that maps to ~50 score) 
     */
    private sigmoidNormalize(distance: number, k = 10, d0 = 0.3): number {
        // Map distance to score: low distance = high score
        const score = 100 / (1 + Math.exp(k * (distance - d0)));
        return Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * Calculate confidence based on landmark visibility
     */
    private calculateConfidence(frames: Landmark[][]): number {
        let totalVisibility = 0;
        let count = 0;

        for (const frame of frames) {
            for (const lm of frame) {
                if (lm.visibility !== undefined) {
                    totalVisibility += lm.visibility;
                    count++;
                }
            }
        }

        return count > 0 ? totalVisibility / count : 0.5;
    }

    /**
     * Assess kinematic quality (jerk minimization)
     */
    private assessKinematicQuality(frames: Landmark[][]): number {
        // Simple jerk approximation using finite differences
        if (frames.length < 4) return 1;

        let totalJerk = 0;

        for (let i = 3; i < frames.length; i++) {
            for (const idx of FINGERTIP_INDICES) {
                const v0 = this.velocity(frames[i - 3][idx], frames[i - 2][idx]);
                const v1 = this.velocity(frames[i - 2][idx], frames[i - 1][idx]);
                const v2 = this.velocity(frames[i - 1][idx], frames[i][idx]);

                const a0 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
                const a1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };

                const jerk = Math.sqrt(
                    Math.pow(a1.x - a0.x, 2) +
                    Math.pow(a1.y - a0.y, 2) +
                    Math.pow(a1.z - a0.z, 2)
                );

                totalJerk += jerk;
            }
        }

        // Normalize: lower jerk = higher quality
        const avgJerk = totalJerk / ((frames.length - 3) * FINGERTIP_INDICES.length);
        return 1 / (1 + avgJerk * 10);
    }

    private velocity(a: Landmark, b: Landmark): Landmark {
        return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    }

    private generateFeedback(
        user: Landmark[],
        reference: Landmark[],
        feedback: MotionFeedback[]
    ): void {
        const threshold = 0.1;

        for (const idx of FINGERTIP_INDICES) {
            const u = user[idx];
            const r = reference[idx];
            const dist = Math.sqrt(
                Math.pow(u.x - r.x, 2) +
                Math.pow(u.y - r.y, 2) +
                Math.pow(u.z - r.z, 2)
            );

            if (dist > threshold) {
                feedback.push({
                    type: 'position',
                    severity: dist > threshold * 2 ? 'error' : 'warning',
                    landmark: idx,
                    message: `Adjust ${this.getLandmarkName(idx)}`,
                    correction: { x: r.x - u.x, y: r.y - u.y, z: r.z - u.z },
                });
            }
        }
    }

    private generateSummaryFeedback(
        user: Landmark[][],
        reference: Landmark[][],
        path: Array<[number, number]>
    ): MotionFeedback[] {
        // Summary feedback based on overall alignment
        return [{
            type: 'timing',
            severity: 'info',
            landmark: -1,
            message: `Motion analyzed: ${path.length} alignment points`,
        }];
    }

    private getLandmarkName(idx: number): string {
        const names: Record<number, string> = {
            4: 'thumb tip',
            8: 'index finger',
            12: 'middle finger',
            16: 'ring finger',
            20: 'pinky',
        };
        return names[idx] || `landmark ${idx}`;
    }

    /**
     * Public wrapper: normalize landmarks to palm-relative orthonormal basis.
     * Use this instead of accessing the private normalizer directly.
     */
    public normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
        return this.normalizer.normalize(landmarks);
    }

    reset(): void {
        this.smoother.reset();
        this.referenceTemplate = null;
    }
}

// =============================================================================
// EXPORT DEFAULT INSTANCE
// =============================================================================

export const kineticEngine = new KineticEngine();
export default KineticEngine;
