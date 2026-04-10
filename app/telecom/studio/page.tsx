'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { 
    Video, Play, Save, Loader2, 
    CheckCircle, ArrowLeft, RefreshCw, 
    Activity, Cpu, Database
} from 'lucide-react'
import Link from 'next/link'
import { kineticEngine } from '@/lib/kinetic-engine'

const VIDEO_PATH = '/meo_demo.mp4'

export default function StudioPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const handLandmarkerRef = useRef<HandLandmarker | null>(null)
    
    const [status, setStatus] = useState('Initializing AI Studio...')
    const [isReady, setIsReady] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [extractedFrames, setExtractedFrames] = useState<any[][]>([])
    const [isSaved, setIsSaved] = useState(false)

    // 1. Init MediaPipe
    useEffect(() => {
        const init = async () => {
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
                setStatus('Studio Ready to Vectorize')
            } catch (err) {
                console.error(err)
                setStatus('Initialization Failed')
            }
        }
        init()
    }, [])

    const startProcessing = async () => {
        const video = videoRef.current
        const landmarker = handLandmarkerRef.current
        if (!video || !landmarker) return

        setIsProcessing(true)
        setStatus('Vectorizing Movement...')
        setExtractedFrames([])
        
        video.currentTime = 0
        await video.play()

        const processFrame = () => {
            if (video.paused || video.ended) {
                finishProcessing()
                return
            }

            const now = Date.now()
            const result = landmarker.detectForVideo(video, now)
            
            if (result.landmarks && result.landmarks.length > 0) {
                setExtractedFrames(prev => [...prev, result.landmarks[0]])
            }

            // Update progress
            const p = (video.currentTime / video.duration) * 100
            setProgress(p)

            requestAnimationFrame(processFrame)
        }

        requestAnimationFrame(processFrame)
    }

    const finishProcessing = () => {
        setIsProcessing(false)
        setStatus('Vectorization Complete')
        setProgress(100)
    }

    const saveGoldenSkill = () => {
        setStatus('Saving to Physical Graph...')
        // In a real app, we would send extractedFrames to Supabase
        // For the demo, we store them in the kineticEngine instance (memory)
        kineticEngine.loadTemplate(extractedFrames)
        setIsSaved(true)
        setStatus('Golden Skill Saved & Active')
    }

    return (
        <div className="min-h-screen bg-[#070b14] text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* ── HEADER ── */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu className="w-4 h-4 text-emerald-500" />
                                <h1 className="text-sm font-mono uppercase tracking-[0.3em] text-emerald-500">Nexus Studio v2</h1>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Golden Skill Ingestion</h2>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                            <Activity className="w-3 h-3" /> System Status
                        </div>
                        <div className="text-sm font-bold uppercase">{status}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* ── VIDEO PROCESSING STAGE (LEFT) ── */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
                            <video 
                                ref={videoRef} 
                                src={VIDEO_PATH}
                                className="w-full h-full object-cover opacity-60" 
                                muted 
                                playsInline
                            />
                            
                            {/* Overlay Progress */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                                        <div className="text-4xl font-black">{Math.round(progress)}%</div>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mt-2">Extracting Kinematic Vectors</p>
                                    </div>
                                </div>
                            )}

                            {!isProcessing && !progress && (
                                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition-all pointer-events-none">
                                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40">
                                        <Play className="w-8 h-8 text-white ml-1" />
                                    </div>
                                </div>
                            )}

                            {/* HUD Lines */}
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/5" />
                        </div>

                        {/* Progress Bar Container */}
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Vectorization Stream</div>
                                <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">{extractedFrames.length} Frames Captured</div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* ── CONTROL PANEL (RIGHT) ── */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Source Metadata */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <Video className="w-4 h-4" /> Video Metadata
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-mono text-slate-600 uppercase">File</span>
                                    <span className="text-[10px] font-mono text-white">meo_demo.mp4</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-mono text-slate-600 uppercase">Duration</span>
                                    <span className="text-[10px] font-mono text-white">~45 Seconds</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-mono text-slate-600 uppercase">Target Pilot</span>
                                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">MEO Telecom</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button 
                                onClick={startProcessing}
                                disabled={isProcessing || !isReady}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 rounded-2xl"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Start Ingestion
                            </button>

                            <button 
                                onClick={saveGoldenSkill}
                                disabled={isProcessing || extractedFrames.length === 0 || isSaved}
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 rounded-2xl"
                            >
                                {isSaved ? <CheckCircle className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                                {isSaved ? 'Skill Saved' : 'Commit to Physical Graph'}
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="p-6 bg-[#0a0f1c] border border-white/5 rounded-3xl opacity-60">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4">Ingestion Guide</h3>
                            <ul className="text-[10px] text-slate-500 space-y-2 leading-relaxed font-medium">
                                <li>1. Ensure the expert hand is visible throughout the video.</li>
                                <li>2. AI Studio will extract coordinate-invariance landmarks.</li>
                                <li>3. Common noise is filtered via Savitzky-Golay algorithm.</li>
                                <li>4. Final vector is stored as the "Golden Protocol".</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* Success Notification */}
            {isSaved && (
                <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                        <div className="font-black text-sm uppercase tracking-tighter">Pilot Template Live</div>
                        <div className="text-[10px] font-mono opacity-80 uppercase tracking-widest">Broadcasting to Field Technicians</div>
                    </div>
                </div>
            )}
        </div>
    )
}
