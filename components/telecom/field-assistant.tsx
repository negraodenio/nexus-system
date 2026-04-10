'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { 
    Camera, Zap, Shield, CheckCircle2, 
    AlertTriangle, Info, ArrowLeft, 
    Settings, Maximize2, RefreshCw 
} from 'lucide-react'
import { kineticEngine, Landmark } from '@/lib/kinetic-engine'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface FieldAssistantProps {
    pilotId?: string
    referenceSkillId?: string
}

export function FieldAssistant({ pilotId = 'MEO-01', referenceSkillId }: FieldAssistantProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const handLandmarkerRef = useRef<HandLandmarker | null>(null)
    const requestRef = useRef<number | null>(null)
    
    // State
    const [isReady, setIsReady] = useState(false)
    const [status, setStatus] = useState('Initializing Vision...')
    const [score, setScore] = useState(0)
    const [currentStep, setCurrentStep] = useState(1)
    const [feedback, setFeedback] = useState<string>('Align your hand with the equipment')
    const [isPrivacyActive, setIsPrivacyActive] = useState(false)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

    const STEPS = [
        { id: 1, title: 'Verify Connections', task: 'Check PON light status' },
        { id: 2, title: 'Fiber Alignment', task: 'Insert LC/APC connector' },
        { id: 3, title: 'Signal Test', task: 'Validate decibel levels' },
        { id: 4, title: 'Closure', task: 'Secure cabinet casing' },
    ]

    // 1. Initialize MediaPipe
    useEffect(() => {
        const initVision = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                )
                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                })
                handLandmarkerRef.current = landmarker
                setIsReady(true)
                setStatus('AI Field Assistant Ready')
            } catch (err) {
                console.error("Field Vision Init Error:", err)
                setStatus('Hardware Error: Check Camera Permissions')
            }
        }
        initVision()
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
    }, [])

    // 2. Camera Management
    useEffect(() => {
        const startCamera = async () => {
            if (!videoRef.current || !navigator.mediaDevices?.getUserMedia) return
            
            // Stop currents
            if (videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                })
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            } catch (err) {
                console.error("Camera access failed:", err)
                setStatus('Camera Blocked')
            }
        }
        startCamera()
    }, [facingMode])

    // 3. AI Inference & AR Overlay Loop
    const animate = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const landmarker = handLandmarkerRef.current
        
        if (!video || !canvas || !landmarker || video.readyState < 4) {
            requestRef.current = requestAnimationFrame(animate)
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight

        const now = Date.now()
        const results = landmarker.detectForVideo(video, now)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0]
            
            // Run Kinetic Engines scoring (real-time comparison)
            const analysis = kineticEngine.processFrame(hand as any[], now)
            setScore(analysis.instantScore)
            
            if (analysis.feedback.length > 0) {
                setFeedback(analysis.feedback[0].message)
            } else if (analysis.instantScore > 85) {
                setFeedback('Perfect alignment. Proceed.')
            }

            // DRAW AR GHOST HAND (Reference Overlay Simulation)
            // In a real system, we'd draw the landmarks from the template here
            drawHandOverlay(ctx, hand, analysis.instantScore, canvas.width, canvas.height)
        } else {
            setScore(0)
            setFeedback('Show equipment & hands')
        }

        requestRef.current = requestAnimationFrame(animate)
    }, [])

    useEffect(() => {
        if (isReady) requestRef.current = requestAnimationFrame(animate)
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
    }, [isReady, animate])

    const drawHandOverlay = (ctx: CanvasRenderingContext2D, landmarks: any[], currentScore: number, w: number, h: number) => {
        const color = currentScore > 80 ? '#10b981' : currentScore > 50 ? '#3b82f6' : '#ef4444'
        
        // Connections for the hand skeleton
        const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]]
        
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.shadowBlur = 10
        ctx.shadowColor = color

        // Draw Glow Lines
        ctx.strokeStyle = `${color}88`
        connections.forEach(([a, b]) => {
            const start = landmarks[a]
            const end = landmarks[b]
            ctx.beginPath()
            ctx.moveTo(start.x * w, start.y * h)
            ctx.lineTo(end.x * w, end.y * h)
            ctx.stroke()
        })

        // Draw Joints
        landmarks.forEach((lm, i) => {
            ctx.fillStyle = i === 8 ? '#FFFFFF' : color
            ctx.beginPath()
            ctx.arc(lm.x * w, lm.y * h, i === 8 ? 6 : 3, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden flex flex-col font-sans">
            
            {/* ── HEADER HUD ── */}
            <div className="absolute top-0 inset-x-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard" className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 text-white pointer-events-auto hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> Pilot Session
                        </div>
                        <div className="text-sm font-bold text-white uppercase">{pilotId}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[80px]">
                        <span className="text-[9px] font-mono text-white/40 uppercase mb-1">AI Match</span>
                        <div className={`text-2xl font-black ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-blue-400' : 'text-red-400'}`}>
                            {score}%
                        </div>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="p-2 bg-black/60 rounded-full border border-white/10">
                            <RefreshCw className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CAMERA STAGE ── */}
            <div className="relative flex-1 bg-[#05080f]">
                <video ref={videoRef} className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} playsInline muted />
                <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                
                {/* AI TARGET INDICATOR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <div className="w-64 h-64 border-2 border-dashed border-white/20 rounded-3xl" />
                </div>
            </div>

            {/* ── FEEDBACK HUD (BOTTOM) ── */}
            <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-black to-transparent z-10 relative">
                
                {/* STEP PROGRESSBAR */}
                <div className="mb-4 flex gap-1.5 h-1">
                    {STEPS.map(s => (
                        <div key={s.id} className={`flex-1 rounded-full transition-all duration-500 ${currentStep >= s.id ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <div className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-0.5">Step {currentStep} of {STEPS.length}</div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">{STEPS[currentStep-1].title}</h3>
                            </div>
                            {score > 90 && (
                                <button onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                    Next Phase
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className={`p-2 rounded-lg ${score > 50 ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {score > 80 ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5 animate-pulse" />}
                            </div>
                            <p className="text-sm font-medium text-slate-300 italic">
                                &quot;{feedback}&quot;
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-4 flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Edge AI: Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-white"><Shield className="w-4 h-4" /></button>
                        <button className="text-slate-500 hover:text-white"><Settings className="w-4 h-4" /></button>
                        <button className="text-slate-500 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* PRIVACY OVERLAY */}
            <AnimatePresence>
                {isPrivacyActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black z-50 flex items-center justify-center p-12 text-center">
                        <div>
                            <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">Privacy Encryption Active</h2>
                            <p className="text-slate-500 text-sm">Motion being processed as pure kinematic tokens. No image leaves the edge.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
