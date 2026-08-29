'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { supabase } from '@/lib/supabase'
import { 
    Camera, Play, Pause, RotateCcw, Target, X, 
    Volume2, VolumeX, Layers, Activity, Brain, Info, Wifi, ShoppingCart 
} from 'lucide-react'
import { KineticEngine, type Landmark } from '@/lib/kinetic-engine'
import { getCachedTier } from '@/lib/hardware-benchmark'
import { HandSkeleton3D } from '@/components/hand-skeleton-3d'
import { EMGClient, type EMGData } from '@/lib/emg-client'
import { EMGProcessor } from '@/lib/emg-processor'
import { EMGVisualizer } from '@/components/emg-visualizer'
import { NexusSyncEngine, type SyncPacket } from '@/lib/nexus-sync'
import { DeadReckoning } from '@/lib/dead-reckoning'
import { LatencyShield } from '@/components/latency-shield'
import { AttestationService } from '@/lib/blockchain/attestation'
import { PurchaseService } from '@/lib/marketplace/purchase-service'
import { toast } from 'sonner'

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
    const [isRecoveryMode, setIsRecoveryMode] = useState(false)
    const [deviceTier, setDeviceTier] = useState<'premium' | 'standard' | 'lite'>('lite')
    const [viewMode, setViewMode] = useState<'camera' | '3d'>('camera')

    // Live landmark refs — shared with 3D renderer without re-renders
    const expertLiveLandmarksRef = useRef<{ x: number; y: number; z: number }[] | null>(null)
    const userLiveLandmarksRef   = useRef<{ x: number; y: number; z: number }[] | null>(null)
    const predictedLandmarksRef  = useRef<{ x: number; y: number; z: number }[] | null>(null)
    const remoteUsersLandmarksRef = useRef<Map<string, { x: number; y: number; z: number }[] | null>>(new Map())
    const remoteDeadReckoningsRef = useRef<Map<string, DeadReckoning>>(new Map())

    const [isNeuralMode, setIsNeuralMode] = useState(false)
    const [isCollaborativeMode, setIsCollaborativeMode] = useState(false)
    const [hasAccess, setHasAccess] = useState(true) // Default to true, update after check
    const [isPremium, setIsPremium] = useState(false)
    const [emgData, setEmgData] = useState<EMGData>({ timestamp: 0, channels: Array(8).fill(0), quality: 0 })
    const [predictionConfidence, setPredictionConfidence] = useState(0)
    const [latency, setLatency] = useState({ rtt: 0, jitter: 0, packetLoss: 0 })

    // RAG Buffer (window of ~200ms at 60Hz ~= 12 samples)
    const emgBufferRef = useRef<number[][]>([])
    const isPredictingRef = useRef(false)
    const syncEngineRef = useRef<NexusSyncEngine | null>(null)

    // Performance refs
    const currentFrameRef = useRef(0)
    const alignmentScoreRef = useRef(0)
    const kineticEngineRef = useRef<KineticEngine | null>(null)
    const startTimeRef = useRef<number>(0)
    const lastFeedbackTimeRef = useRef<number>(0)

    // 1. Initialize MediaPipe + Camera + KineticEngine
    useEffect(() => {
        const init = async () => {
            setStatus('Loading hand detection model...')
            kineticEngineRef.current = new KineticEngine()
            const tier = getCachedTier()
            setDeviceTier(tier)

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
                    minHandDetectionConfidence: 0.3,
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
            if (handLandmarkerRef.current) handLandmarkerRef.current.close()
            // Capture ref value at cleanup scheduling time to avoid stale ref bug
            const video = videoRef.current
            if (video?.srcObject) {
                (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
            }
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            EMGClient.getInstance().stopSimulation()
            syncEngineRef.current?.leaveRoom()
        }
    }, [])

    // 2. Load expert skeleton frames & Check Access
    useEffect(() => {
        const loadExpertFrames = async () => {
            // Check if skill is premium
            const { data: listing } = await (supabase.from('marketplace_listings') as any).select('is_premium, id').eq('skill_id', skillId).maybeSingle()
            if (listing?.is_premium) {
                setIsPremium(true)
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const owned = await PurchaseService.checkAccess(user.id, skillId)
                    setHasAccess(owned)
                }
            }

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
                const uniqueFrames = data.reduce((acc: SkillFrame[], current: SkillFrame) => {
                    const last = acc[acc.length - 1]
                    if (!last || last.frame_index !== current.frame_index) {
                        acc.push(current)
                    }
                    return acc
                }, [])
                setExpertFrames(uniqueFrames)
            } else {
                setIsRecoveryMode(true)
                setStatus('⚠️ Live Inference Mode active')
            }
        }
        loadExpertFrames()
    }, [skillId])

    // 3. EMG Subscription
    useEffect(() => {
        if (!isNeuralMode) {
            EMGClient.getInstance().stopSimulation()
            return
        }

        EMGClient.getInstance().startSimulation((data) => {
            setEmgData(data)
            emgBufferRef.current.push(data.channels)
            if (emgBufferRef.current.length > 30) emgBufferRef.current.shift()
        })

        return () => EMGClient.getInstance().stopSimulation()
    }, [isNeuralMode])

    // 4. Motion Prediction Loop (M2.7 Neural)
    useEffect(() => {
        if (!isNeuralMode || !isPlaying || !userLiveLandmarksRef.current) return

        const predictInterval = setInterval(async () => {
            if (isPredictingRef.current || emgBufferRef.current.length < 5) return

            isPredictingRef.current = true
            try {
                const features = EMGProcessor.extractFeatures(emgBufferRef.current)
                const embedding = await EMGProcessor.toEmbedding(features)

                if (embedding) {
                    const response = await fetch('/api/predict-motion', {
                        method: 'POST',
                        body: JSON.stringify({
                            emgEmbedding: embedding,
                            currentLandmarks: userLiveLandmarksRef.current,
                        })
                    })

                    const result = await response.json()
                    if (result.predictedLandmarks) {
                        predictedLandmarksRef.current = result.predictedLandmarks
                        setPredictionConfidence(result.confidence || 0.8)
                    }
                }
            } catch (err) {
                console.error('Prediction error:', err)
            } finally {
                isPredictingRef.current = false
            }
        }, 500)

        return () => clearInterval(predictInterval)
    }, [isNeuralMode, isPlaying])

    // 5. Collaborative Sync
    useEffect(() => {
        if (!isCollaborativeMode) {
            syncEngineRef.current?.leaveRoom()
            syncEngineRef.current = null
            return
        }

        const engine = new NexusSyncEngine()
        syncEngineRef.current = engine

        const handleRemotePacket = (packet: SyncPacket) => {
            const now = Date.now()
            const rtt = now - packet.timestamp
            setLatency(l => ({ 
                rtt, 
                jitter: Math.abs(rtt - l.rtt), 
                packetLoss: l.packetLoss * 0.95 // fake decay for MVP
            }))

            let dr = remoteDeadReckoningsRef.current.get(packet.userId)
            if (!dr) {
                dr = new DeadReckoning()
                remoteDeadReckoningsRef.current.set(packet.userId, dr)
            }
            dr.update(packet.landmarks)
        }

        engine.joinRoom(skillId, handleRemotePacket)

        return () => engine.leaveRoom()
    }, [isCollaborativeMode, skillId])

    // Alignment calculation
    const calculateAlignment = useCallback((userLandmarks: any[], expertLandmarks: any[]): number => {
        if (!userLandmarks?.length || !expertLandmarks?.length) return 0
        const engine = kineticEngineRef.current
        if (!engine) return 0

        try {
            const userLm = userLandmarks[0].map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility }))
            const expertLm = expertLandmarks[0].map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility }))

            const normalizedUser = engine.normalizeLandmarks(userLm)
            const normalizedExpert = engine.normalizeLandmarks(expertLm)

            const fingertips = [4, 8, 12, 16, 20]
            let dotProduct = 0, userMag = 0, expertMag = 0

            for (const idx of fingertips) {
                const u = normalizedUser[idx], e = normalizedExpert[idx]
                dotProduct += u.x * e.x + u.y * e.y + u.z * e.z
                userMag += u.x * u.x + u.y * u.y + u.z * u.z
                expertMag += e.x * e.x + e.y * e.y + e.z * e.z
            }

            const magnitude = Math.sqrt(userMag) * Math.sqrt(expertMag)
            return magnitude > 1e-10 ? Math.round(((dotProduct / magnitude + 1) / 2) * 100) : 0
        } catch { return 0 }
    }, [])

    // Voice feedback
    const speakFeedback = (text: string) => {
        if (!isVoiceEnabled || Date.now() - lastFeedbackTimeRef.current < 3000) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.2
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
        lastFeedbackTimeRef.current = Date.now()
    }

    const analyzeFeedback = (userLandmarks: any[], expertLandmarks: any[]) => {
        if (!userLandmarks?.length || !expertLandmarks?.length) return
        const user = userLandmarks[0], expert = expertLandmarks[0]
        const ERROR_THRESHOLD = 0.1

        if (Math.abs(user[0].y - expert[0].y) > ERROR_THRESHOLD) {
            speakFeedback(user[0].y > expert[0].y ? "Raise your wrist" : "Lower your wrist")
        } else if (Math.abs(user[0].x - expert[0].x) > ERROR_THRESHOLD) {
            speakFeedback(user[0].x > expert[0].x ? "Move left" : "Move right")
        } else if (calculateAlignment([user], [expert]) > 85) {
            speakFeedback("Perfect!")
        }
    }

    // Main animation loop
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

        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight

        const nowInMs = Date.now()
        const results = landmarker.detectForVideo(video, nowInMs)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const elapsedMs = nowInMs - startTimeRef.current
        const frameIndex = Math.floor(elapsedMs / (1000 / 30)) % expertFrames.length
        currentFrameRef.current = frameIndex
        const expertFrame = expertFrames[frameIndex]

        if (expertFrame?.landmarks?.[0]) expertLiveLandmarksRef.current = expertFrame.landmarks[0]

        // 1. Draw Expert (GREEN)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17]
        ]

        if (expertFrame?.landmarks) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'
            ctx.lineWidth = 3
            expertFrame.landmarks[0].forEach((_: any, i: number) => {
                const landmark = expertFrame.landmarks[0][i]
                ctx.beginPath(); ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; ctx.fill()
            })
            connections.forEach(([a, b]) => {
                const l1 = expertFrame.landmarks[0][a], l2 = expertFrame.landmarks[0][b]
                if (l1 && l2) {
                    ctx.beginPath(); ctx.moveTo(l1.x * canvas.width, l1.y * canvas.height); ctx.lineTo(l2.x * canvas.width, l2.y * canvas.height); ctx.stroke()
                }
            })
        }

        // 2. Draw User (BLUE)
        if (results.landmarks?.length > 0) {
            const user = results.landmarks[0]
            userLiveLandmarksRef.current = user
            if (expertFrame?.landmarks) {
                analyzeFeedback(results.landmarks, expertFrame.landmarks)
                alignmentScoreRef.current = calculateAlignment(results.landmarks, expertFrame.landmarks)
            }

            ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'
            ctx.lineWidth = 2
            user.forEach((lm, i) => {
                ctx.beginPath(); ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI); ctx.fillStyle = i === 8 ? '#FF4444' : '#0096FF'; ctx.fill()
            })
            connections.forEach(([a, b]) => {
                ctx.beginPath(); ctx.moveTo(user[a].x * canvas.width, user[a].y * canvas.height); ctx.lineTo(user[b].x * canvas.width, user[b].y * canvas.height); ctx.stroke()
            })
        }

        // 4. Remote Skeletons Prediction (Dead Reckoning)
        if (isCollaborativeMode) {
            remoteDeadReckoningsRef.current.forEach((dr, userId) => {
                const predicted = dr.predict()
                if (predicted) {
                    remoteUsersLandmarksRef.current.set(userId, predicted)
                }
            })

            // Broadcast own position
            if (userLiveLandmarksRef.current) {
                syncEngineRef.current?.broadcast('me', skillId, userLiveLandmarksRef.current)
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }, [expertFrames, isNeuralMode, isCollaborativeMode, predictionConfidence, calculateAlignment, skillId])

    useEffect(() => {
        if (isPlaying && expertFrames.length > 0) {
            startTimeRef.current = Date.now()
            animationRef.current = requestAnimationFrame(animate)
        }
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
    }, [isPlaying, expertFrames, animate])

    useEffect(() => {
        if (!isPlaying) return
        const uiUpdateInterval = setInterval(() => {
            setCurrentFrameIndex(currentFrameRef.current)
            setAlignmentScore(alignmentScoreRef.current)
        }, 200)
        return () => clearInterval(uiUpdateInterval)
    }, [isPlaying])

    const handleStart = () => { startTimeRef.current = Date.now(); setIsPlaying(true) }
    
    const handleStop = async () => { 
        setIsPlaying(false) 
        
        // Automatic Blockchain Minting (Gamification > 95%)
        if (alignmentScoreRef.current >= 95) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user && userLiveLandmarksRef.current) {
                    toast.info('🎯 Elite Mastery Detected! Minting Certificate...')
                    const attestation = await AttestationService.mint(
                        user.id,
                        skillId,
                        skillId, // Using ID as name if name is not available in state
                        alignmentScoreRef.current,
                        userLiveLandmarksRef.current
                    )
                    toast.success(`Proof of Competence minted on Polygon!`, {
                        description: `Transaction: ${attestation.transactionHash.substring(0, 10)}...`,
                        action: {
                            label: 'View Vault',
                            onClick: () => window.location.href = '/dashboard/certificates'
                        }
                    })
                }
            } catch (err) {
                console.error('Minting failed:', err)
            }
        }
    }
    
    const handleRestart = () => { startTimeRef.current = Date.now(); setCurrentFrameIndex(0) }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-[#101822]">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg"><X className="w-6 h-6" /></button>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-green-500" /> Ghost Hand Practice
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsCollaborativeMode(!isCollaborativeMode)} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${isCollaborativeMode ? 'bg-cyan-500 text-black shadow-lg' : 'bg-slate-700 text-slate-300'}`}>
                        <Wifi className={`w-5 h-5 ${isCollaborativeMode ? 'animate-pulse' : ''}`} /><span className="hidden md:inline">Live Room</span>
                    </button>
                    <button onClick={() => setIsNeuralMode(!isNeuralMode)} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${isNeuralMode ? 'bg-amber-500 text-black shadow-lg' : 'bg-slate-700 text-slate-300'}`}>
                        <Brain className={`w-5 h-5 ${isNeuralMode ? 'animate-pulse' : ''}`} /><span className="hidden md:inline">Neural Mode</span>
                    </button>
                    <button onClick={() => setViewMode(v => v === 'camera' ? '3d' : 'camera')} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === '3d' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        <Layers className="w-5 h-5" /><span className="hidden md:inline">3D Mode</span>
                    </button>
                    <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-2 rounded-lg ${isVoiceEnabled ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${alignmentScore >= 80 ? 'bg-green-500' : 'bg-amber-500'} text-white`}>{alignmentScore}%</div>
                </div>
            </div>

            <div className="flex-1 relative">
                {viewMode === '3d' ? (
                    <HandSkeleton3D 
                        expertLandmarksRef={expertLiveLandmarksRef} 
                        userLandmarksRef={userLiveLandmarksRef} 
                        remoteUsersRef={remoteUsersLandmarksRef}
                        alignmentScoreRef={alignmentScoreRef} 
                    />
                ) : (
                    <>
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain bg-black" playsInline muted />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                        {isNeuralMode && (
                            <div className="absolute top-4 left-4 z-20 w-64">
                                <EMGVisualizer channels={emgData.channels} quality={emgData.quality} />
                                {predictionConfidence > 0 && <div className="mt-2 bg-amber-500/20 backdrop-blur rounded p-2 border border-amber-500/30 text-[10px] text-amber-200 uppercase font-bold flex justify-between">Confidence <span>{(predictionConfidence * 100).toFixed(0)}%</span></div>}
                            </div>
                        )}
                        {isCollaborativeMode && (
                            <div className="absolute top-4 right-4 z-20">
                                <LatencyShield rtt={latency.rtt} jitter={latency.jitter} packetLoss={latency.packetLoss} />
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3 text-sm space-y-1">
                            <div className="flex items-center gap-2 text-green-400"><div className="w-3 h-3 rounded-full bg-green-500" /> Expert</div>
                            <div className="flex items-center gap-2 text-blue-400"><div className="w-3 h-3 rounded-full bg-blue-500" /> You</div>
                            {isNeuralMode && <div className="flex items-center gap-2 text-amber-400"><div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" /> Neural Predicted</div>}
                        </div>
                    </>
                )}
                {!isPlaying && isReady && hasAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <button onClick={handleStart} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-xl shadow-green-500/20"><Play className="w-6 h-6" /> Start Practice</button>
                    </div>
                )}
                {!hasAccess && isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#101822] p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center max-w-sm">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-amber-500/20">
                                <ShoppingCart className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight italic">Premium Access Required</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                This cinematic protocol is restricted to licensed users. Acquire the license in the marketplace to proceed and unlock elite physical insights.
                            </p>
                            <button 
                                onClick={() => window.location.href = '/dashboard/marketplace'}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                            >
                                Visit Marketplace
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[#101822] flex justify-center gap-4">
                <button onClick={isPlaying ? handleStop : handleStart} className={`px-6 py-3 ${isPlaying ? 'bg-slate-700' : 'bg-green-500'} text-white rounded-xl font-bold flex items-center gap-2`}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />} {isPlaying ? 'Pause' : 'Start'}
                </button>
                <button onClick={handleRestart} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2"><RotateCcw className="w-5 h-5" /> Restart</button>
            </div>
        </div>
    )
}
