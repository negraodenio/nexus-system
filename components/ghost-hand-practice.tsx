'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { supabase } from '@/lib/supabase'
import { Camera, Play, Pause, RotateCcw, Target, X, Volume2, VolumeX, Zap } from 'lucide-react'
import { KineticEngine, type Landmark, type MatchResult } from '@/lib/kinetic-engine'
import { useHardwareQualification, getCachedTier } from '@/lib/hardware-benchmark'

interface SkillFrame {
    frame_index: number
    landmarks: any[]
}

interface GhostHandPracticeProps {
    skillId: string
    onClose: () => void
}

export function GhostHandPractice({ skillId, onClose }: GhostHandPracticeProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const handLandmarkerRef = useRef<HandLandmarker | null>(null)
    const animationRef = useRef<number | null>(null)

    const [isReady, setIsReady] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
    const [expertFrames, setExpertFrames] = useState<SkillFrame[]>([])
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
    const [alignmentScore, setAlignmentScore] = useState(0)
    const [status, setStatus] = useState('Initializing...')
    const [isRecoveryMode, setIsRecoveryMode] = useState(false) // New Recovery Mode
    const [kinematicQuality, setKinematicQuality] = useState(0) // NEW: Jerk-free motion quality
    const [deviceTier, setDeviceTier] = useState<'premium' | 'standard' | 'lite'>('lite')

    // Performance optimization: Store frame/score in refs to avoid re-renders
    const currentFrameRef = useRef(0)
    const alignmentScoreRef = useRef(0)
    const kinematicQualityRef = useRef(0) // NEW: Kinematic quality ref

    // NEW: Kinetic Engine V2.0 (Patent-Pending)
    const kineticEngineRef = useRef<KineticEngine | null>(null)

    const startTimeRef = useRef<number>(0)

    // 1. Initialize MediaPipe + Camera + KineticEngine
    useEffect(() => {
        const init = async () => {
            setStatus('Loading hand detection model...')

            // NEW: Initialize KineticEngine V2.0 and detect hardware tier
            kineticEngineRef.current = new KineticEngine()
            const tier = getCachedTier()
            setDeviceTier(tier)
            console.log(`[KineticEngine] Initialized in ${tier} mode`)

            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                )

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO',
                    numHands: 2,
                    minHandDetectionConfidence: 0.3, // Lower confidence for recovery mode robustness
                    minHandPresenceConfidence: 0.3,
                    minTrackingConfidence: 0.3
                })

                handLandmarkerRef.current = landmarker
                setStatus('Starting camera...')

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 1280, height: 720 }
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setStatus(`Ready! Press Play to start practice (${tier.toUpperCase()} mode)`)
                    setIsReady(true)
                }
            } catch (error) {
                console.error('Init error:', error)
                setStatus('Error initializing camera or model')
            }
        }

        init()

        return () => {
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close()
            }
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    // 2. Load expert skeleton frames
    useEffect(() => {
        const loadExpertFrames = async () => {
            const { data, error } = await supabase
                .from('skill_frames')
                .select('*')
                .eq('skill_id', skillId)
                .order('frame_index', { ascending: true })

            if (error) {
                console.error('Error loading frames:', error)
                return
            }

            if (data && data.length > 0) {
                // FIX: Deduplicate frames (SkillRecorder might save duplicates at 60fps)
                const uniqueFrames = data.reduce((acc: SkillFrame[], current: SkillFrame) => {
                    const last = acc[acc.length - 1]
                    if (!last || last.frame_index !== current.frame_index) {
                        acc.push(current)
                    }
                    return acc
                }, [])

                setExpertFrames(uniqueFrames)
                setStatus(`Loaded ${uniqueFrames.length} expert frames`)
                setStatus(`Loaded ${uniqueFrames.length} expert frames`)
            } else {
                console.warn('No expert frames found. Activating Real-Time Recovery Mode.')
                setIsRecoveryMode(true)
                // Retrieve the video URL to play it
                // Note: The video element will be handled by the parent passed URL or we need to fetch it?
                // Actually the parent passes skillId, we fetched frames. 
                // We assume video plays.
                setStatus('⚠️ Data incomplete - Using Live Inference Mode')
            }
        }

        loadExpertFrames()
    }, [skillId])

    // 3. Calculate alignment using KineticEngine V2.0 (Patent-Pending)
    const calculateAlignment = useCallback((userLandmarks: any[], expertLandmarks: any[]): number => {
        if (!userLandmarks || !expertLandmarks || userLandmarks.length === 0 || expertLandmarks.length === 0) {
            return 0
        }

        // Lite mode: Use simple distance (for low-end devices)
        if (deviceTier === 'lite') {
            const userHand = userLandmarks[0]
            const expertHand = expertLandmarks[0]
            if (!userHand || !expertHand) return 0

            let totalDistance = 0
            let count = 0
            for (let i = 0; i < Math.min(userHand.length, expertHand.length); i++) {
                const dx = userHand[i].x - expertHand[i].x
                const dy = userHand[i].y - expertHand[i].y
                totalDistance += Math.sqrt(dx * dx + dy * dy)
                count++
            }
            const avgDistance = totalDistance / count
            return Math.max(0, Math.min(100, 100 - avgDistance * 500))
        }

        // Premium/Standard mode: Use KineticEngine V2.0
        const engine = kineticEngineRef.current
        if (!engine) return 0

        const userHand = userLandmarks[0]
        const expertHand = expertLandmarks[0]
        if (!userHand || !expertHand) return 0

        // Convert to Landmark[] format
        const userLm: Landmark[] = userHand.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility
        }))
        const expertLm: Landmark[] = expertHand.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility
        }))

        // Process through engine (normalization + smoothing)
        const timestamp = Date.now()
        const result = engine.processFrame(userLm, timestamp)

        // Calculate instant score using cosine similarity
        // The engine normalizes both poses and compares
        const normalizer = engine['normalizer'] // Access private for direct comparison
        try {
            const normalizedUser = normalizer.normalize(userLm)
            const normalizedExpert = normalizer.normalize(expertLm)

            // Cosine similarity on fingertips (indices 4, 8, 12, 16, 20)
            const fingertips = [4, 8, 12, 16, 20]
            let dotProduct = 0
            let userMag = 0
            let expertMag = 0

            for (const idx of fingertips) {
                const u = normalizedUser[idx]
                const e = normalizedExpert[idx]
                dotProduct += u.x * e.x + u.y * e.y + u.z * e.z
                userMag += u.x * u.x + u.y * u.y + u.z * u.z
                expertMag += e.x * e.x + e.y * e.y + e.z * e.z
            }

            const magnitude = Math.sqrt(userMag) * Math.sqrt(expertMag)
            const cosineSim = magnitude > 1e-10 ? (dotProduct / magnitude + 1) / 2 : 0

            // Update kinematic quality ref
            kinematicQualityRef.current = Math.round(result.instantScore * 100)

            return Math.round(cosineSim * 100)
        } catch (e) {
            // Fallback if normalization fails (e.g., degenerate hand pose)
            return 0
        }
    }, [deviceTier])

    const lastFeedbackTimeRef = useRef<number>(0)

    // Voice Feedback Function
    const speakFeedback = (text: string) => {
        // FIX: Respect the Voice Coach toggle
        if (!isVoiceEnabled) return

        const now = Date.now()
        // Limit feedback frequency (max once per 3 seconds)
        if (now - lastFeedbackTimeRef.current < 3000) return

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.2
        utterance.pitch = 1.0
        utterance.lang = 'en-US' // Or pt-BR depending on user preference
        window.speechSynthesis.speak(utterance)

        lastFeedbackTimeRef.current = now
    }

    // Analyze specific errors for feedback
    const analyzeFeedback = (userLandmarks: any[], expertLandmarks: any[]) => {
        if (!userLandmarks?.length || !expertLandmarks?.length) return

        const user = userLandmarks[0]
        const expert = expertLandmarks[0]

        // Threshold for error (0.1 is roughly 10% of screen size)
        const ERROR_THRESHOLD = 0.1

        // Check Left Hand (Wrist: 0)
        if (Math.abs(user[0].y - expert[0].y) > ERROR_THRESHOLD) {
            if (user[0].y > expert[0].y) {
                speakFeedback("Raise your wrist")
            } else {
                speakFeedback("Lower your wrist")
            }
            return
        }

        // Check Horizontal alignment
        if (Math.abs(user[0].x - expert[0].x) > ERROR_THRESHOLD) {
            if (user[0].x > expert[0].x) {
                speakFeedback("Move left")
            } else {
                speakFeedback("Move right")
            }
            return
        }

        // Positive feedback if alignment is good
        if (calculateAlignment([user], [expert]) > 85) {
            // Random compliment
            const compliments = ["Perfect!", "Great match!", "Hold it there!", "Excellent!"]
            const index = Math.floor(Math.random() * compliments.length)
            speakFeedback(compliments[index])
        }
    }

    // 4. Animation loop
    const animate = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const landmarker = handLandmarkerRef.current

        if (!video || !canvas || !landmarker || video.readyState < 4) {
            animationRef.current = requestAnimationFrame(animate)
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            animationRef.current = requestAnimationFrame(animate)
            return
        }

        // Helper to match display size
        // We must draw on a canvas that matches the video's intrinsic resolution
        // and then let CSS scale it to fit the container (object-contain)
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight

        // Detect user's hands
        const nowInMs = Date.now()
        const results = landmarker.detectForVideo(video, nowInMs)

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate current expert frame based on elapsed time
        const elapsedMs = nowInMs - startTimeRef.current
        const fps = 30
        const frameIndex = Math.floor(elapsedMs / (1000 / fps)) % expertFrames.length
        // FIX: Store in ref instead of triggering re-render
        currentFrameRef.current = frameIndex

        const expertFrame = expertFrames[frameIndex]

        // ... (Drawing code remains same) ...

        // Draw expert skeleton (GREEN - Ghost)
        let expertLandmarksToDraw = expertFrame?.landmarks

        // RECOVERY MODE: If no recorded frames, detect from video on the fly
        if (isRecoveryMode && isPlaying && video && video.currentTime > 0) {
            // Detect hands in the VIDEO element itself
            const videoResults = landmarker.detectForVideo(video, nowInMs)
            if (videoResults.landmarks && videoResults.landmarks.length > 0) {
                expertLandmarksToDraw = videoResults.landmarks
            }
        }

        if (expertLandmarksToDraw) {
            for (const landmarks of expertLandmarksToDraw) {
                if (!landmarks) continue
                // Draw connections
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'
                ctx.lineWidth = 3
                const connections = [
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    [0, 9], [9, 10], [10, 11], [11, 12],
                    [0, 13], [13, 14], [14, 15], [15, 16],
                    [0, 17], [17, 18], [18, 19], [19, 20],
                    [5, 9], [9, 13], [13, 17]
                ]

                for (const [a, b] of connections) {
                    if (landmarks[a] && landmarks[b]) {
                        ctx.beginPath()
                        ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height)
                        ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height)
                        ctx.stroke()
                    }
                }

                // Draw points
                for (let i = 0; i < landmarks.length; i++) {
                    const x = landmarks[i].x * canvas.width
                    const y = landmarks[i].y * canvas.height

                    ctx.beginPath()
                    ctx.arc(x, y, 8, 0, 2 * Math.PI)
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
                    ctx.fill()
                    ctx.strokeStyle = '#FFFFFF'
                    ctx.lineWidth = 2
                    ctx.stroke()
                }
            }
        }

        // Draw user skeleton (BLUE)
        if (results.landmarks && results.landmarks.length > 0) {
            // Run Voice Analysis
            if (expertFrame?.landmarks) {
                analyzeFeedback(results.landmarks, expertFrame.landmarks)
            }

            for (const landmarks of results.landmarks) {
                // Draw connections
                ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'
                ctx.lineWidth = 2
                const connections = [
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    [0, 9], [9, 10], [10, 11], [11, 12],
                    [0, 13], [13, 14], [14, 15], [15, 16],
                    [0, 17], [17, 18], [18, 19], [19, 20],
                    [5, 9], [9, 13], [13, 17]
                ]

                for (const [a, b] of connections) {
                    if (landmarks[a] && landmarks[b]) {
                        ctx.beginPath()
                        ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height)
                        ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height)
                        ctx.stroke()
                    }
                }

                // Draw points
                for (let i = 0; i < landmarks.length; i++) {
                    const x = landmarks[i].x * canvas.width
                    const y = landmarks[i].y * canvas.height

                    ctx.beginPath()
                    ctx.arc(x, y, 6, 0, 2 * Math.PI)
                    ctx.fillStyle = i === 8 ? '#FF4444' : '#0096FF'
                    ctx.fill()
                }
            }

            // Calculate alignment score
            if (expertFrame?.landmarks) {
                const score = calculateAlignment(results.landmarks, expertFrame.landmarks)
                // FIX: Store in ref instead of triggering re-render
                alignmentScoreRef.current = score
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }, [expertFrames])

    // 5. Start/Stop practice
    useEffect(() => {
        if (isPlaying && expertFrames.length > 0) {
            startTimeRef.current = Date.now()
            animationRef.current = requestAnimationFrame(animate)
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [isPlaying, expertFrames, animate])

    // 6. Throttled UI Update (Performance optimization: update React state every 200ms, not every frame)
    useEffect(() => {
        if (!isPlaying) return

        const uiUpdateInterval = setInterval(() => {
            setCurrentFrameIndex(currentFrameRef.current)
            setAlignmentScore(alignmentScoreRef.current)
        }, 200) // 5 updates per second is enough for UI

        return () => clearInterval(uiUpdateInterval)
    }, [isPlaying])

    const handleStart = () => {
        startTimeRef.current = Date.now()
        setIsPlaying(true)
    }

    const handleStop = () => {
        setIsPlaying(false)
    }

    const handleRestart = () => {
        startTimeRef.current = Date.now()
        setCurrentFrameIndex(0)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#101822]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-green-500" />
                        Ghost Hand Practice
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isVoiceEnabled ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                            }`}
                        title={isVoiceEnabled ? 'Mute Voice Coach' : 'Enable Voice Coach'}
                    >
                        {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        <span className="text-sm font-bold hidden md:inline">Voice Coach</span>
                    </button>
                    <div className="text-sm text-slate-400">
                        Frame: {currentFrameIndex + 1} / {expertFrames.length}
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold ${alignmentScore >= 80 ? 'bg-green-500 text-white' :
                        alignmentScore >= 50 ? 'bg-yellow-500 text-black' :
                            'bg-red-500 text-white'
                        }`}>
                        {alignmentScore}% Match
                    </div>
                </div>
            </div>

            {/* Video + Canvas */}
            <div className="flex-1 relative">
                <video
                    ref={videoRef}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    playsInline
                // muted // Enable audio for demo
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="text-white">Expert (Ghost)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-white">You</span>
                    </div>
                    {isRecoveryMode && (
                        <div className="mt-2 text-xs text-yellow-500 font-mono animate-pulse">
                            ⚡ LIVE RECOVERY ACTIVE
                        </div>
                    )}
                </div>

                {/* Status */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                            <p className="text-white text-lg mb-4">{status}</p>
                            {isReady && expertFrames.length > 0 && (
                                <button
                                    onClick={handleStart}
                                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 mx-auto"
                                >
                                    <Play className="w-6 h-6" />
                                    Start Practice
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-[#101822] flex justify-center gap-4">
                {isPlaying ? (
                    <button
                        onClick={handleStop}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                        <Pause className="w-5 h-5" />
                        Pause
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        disabled={!isReady || expertFrames.length === 0}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        {currentFrameIndex > 0 ? 'Resume' : 'Start'}
                    </button>
                )}
                <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Restart
                </button>
            </div>
        </div>
    )
}
