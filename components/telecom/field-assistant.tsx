'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
// MediaPipe now runs in Web Worker
// import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { 
    Camera, Zap, Shield, CheckCircle2, 
    AlertTriangle, Info, ArrowLeft, 
    Settings, Maximize2, RefreshCw 
} from 'lucide-react'
import { kineticEngine, Landmark } from '@/lib/kinetic-engine'
import { supabase } from '@/lib/supabase'
import { NexusRealtimeMessage, NEXUS_CHANNELS } from '@/lib/realtime-protocol'
import { TelemetryService } from '@/lib/telemetry'
import { v4 as uuidv4 } from 'uuid'

interface FieldAssistantProps {
    pilotId?: string
    referenceSkillId?: string
}

export function FieldAssistant({ pilotId = 'NX-GLOBAL-01', referenceSkillId }: FieldAssistantProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const handLandmarkerRef = useRef<any>(null) // Used as dummy or for types
    const workerRef = useRef<Worker | null>(null)
    const requestRef = useRef<number | null>(null)
    
    // State
    const [isReady, setIsReady] = useState(false)
    const [status, setStatus] = useState('Initializing Vision...')
    const [score, setScore] = useState(0)
    const [currentStep, setCurrentStep] = useState(1)
    const [feedback, setFeedback] = useState<string>('Align your hand with the equipment')
    const [isPrivacyActive, setIsPrivacyActive] = useState(false)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
    const [isOffline, setIsOffline] = useState(false)
    const [remoteAnnotation, setRemoteAnnotation] = useState<{ type: 'target' | 'warn', message: string } | null>(null)
    const [sessionId] = useState(uuidv4())
    const [fps, setFps] = useState(0)
    const [lastFrameTime, setLastFrameTime] = useState(0)
    const [companyId, setCompanyId] = useState<string | null>(null)

    // Real-Time Expert Subscription (Production Grade)
    useEffect(() => {
        if (!pilotId) return;

        let channel: any;

        const connectChannel = () => {
            channel = supabase.channel(NEXUS_CHANNELS.SUPPORT(pilotId))
                .on('broadcast', { event: 'ar-command' }, ({ payload }: { payload: NexusRealtimeMessage }) => {
                    console.log("Remote Command Received:", payload);
                    
                    setRemoteAnnotation({ 
                        type: payload.type === 'WARNING' ? 'warn' : 'target', 
                        message: payload.payload.message 
                    });

                    // Clear after 6 seconds
                    setTimeout(() => setRemoteAnnotation(null), 6000);
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') console.log("Realtime: Connected");
                    if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        console.warn("Realtime: Disconnected. Retrying...");
                        setTimeout(connectChannel, 3000); // 3s retry (Senior Pattern)
                    }
                });
        };

        connectChannel();

        return () => {
            if (channel) supabase.removeChannel(channel);
        }
    }, [pilotId])

    // 0. Identity Discovery (Zero Trust)
    useEffect(() => {
        const fetchIdentity = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();
                if (profile?.company_id) {
                    setCompanyId(profile.company_id);
                }
            }
        };
        fetchIdentity();
    }, []);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true)
        const handleOnline = () => setIsOffline(false)
        window.addEventListener('offline', handleOffline)
        window.addEventListener('online', handleOnline)
        setIsOffline(!navigator.onLine)
        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    const MODULE_CONFIGS: Record<string, { title: string, steps: any[] }> = {
        'm1': {
            title: 'ONT Installation',
            steps: [
                { id: 1, title: 'Power & PON State', task: 'Observe Green Stable PON Light' },
                { id: 2, title: 'Patch-cord Connect', task: 'Align LC/APC with click' },
                { id: 3, title: 'Power Meter Test', task: 'Verify <-27dBm threshold' },
                { id: 4, title: 'ID Labeling', task: 'Apply QR tag to ONT casing' },
            ]
        },
        'm2': {
            title: 'Fiber Fusion',
            steps: [
                { id: 1, title: 'Stripping', task: 'Remove 30mm of coating' },
                { id: 2, title: 'Cleaving', task: '90 degree precision cut' },
                { id: 3, title: 'Fusion Arch', task: 'Align cores in fuser' },
                { id: 4, title: 'Protection', task: 'Heat shrink tube application' },
            ]
        }
    }

    const [activeModuleId, setActiveModuleId] = useState('m1')
    const config = MODULE_CONFIGS[activeModuleId] || MODULE_CONFIGS['m1']
    const STEPS = config.steps

    // 1. Initialize Vision Worker (Professional Optimization)
    useEffect(() => {
        const worker = new Worker(new URL('../../public/workers/vision-worker.js', import.meta.url), { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = (e) => {
            if (e.data.type === 'READY') {
                setIsReady(true);
                setStatus('AI Field Assistant Ready');
            }
            if (e.data.type === 'RESULTS') {
                handleWorkerResults(e.data.results, e.data.timestamp);
            }
            if (e.data.type === 'ERROR') {
                console.error("Worker Error:", e.data.error);
                setStatus('Vision Error: Restarting...');
            }
        };

        worker.postMessage({ type: 'INIT' });

        return () => {
            worker.terminate();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [])

    const handleWorkerResults = (results: any, timestamp: number) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !results) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // FPS Calculation
        const frameNow = Date.now();
        const delta = frameNow - lastFrameTime;
        if (delta > 0) setFps(Math.round(1000 / delta));
        setLastFrameTime(frameNow);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0];
            const analysis = kineticEngine.processFrame(hand as any[], Date.now());
            setScore(analysis.instantScore);
            
            if (analysis.feedback.length > 0) {
                setFeedback(analysis.feedback[0].message);
            } else if (analysis.instantScore > 85) {
                setFeedback(`[STEP ${currentStep}] Perfect ${STEPS[currentStep-1].title}. Hold 3s to lock.`);
            } else {
                setFeedback(STEPS[currentStep-1].task);
            }

            drawHandOverlay(ctx, hand, analysis.instantScore, canvas.width, canvas.height);
        } else {
            setScore(0);
            setFeedback('Show equipment & hands');
        }
    };

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
            } catch (err: any) {
                console.error("Camera access failed:", err)
                if (err.name === 'NotAllowedError') {
                    setStatus('CAMERA_BLOCKED')
                } else {
                    setStatus('Hardare Error: No Camera Found')
                }
            }
        }
        startCamera()
    }, [facingMode])

    // 3. Inference Loop (Main Thread - Minimal Load)
    const animate = useCallback(async () => {
        const video = videoRef.current;
        const worker = workerRef.current;
        
        if (!video || !worker || video.readyState < 4 || !isReady) {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        // Capture frame as ImageBitmap for zero-copy transfer to worker
        try {
            const imageBitmap = await createImageBitmap(video);
            worker.postMessage({
                type: 'PROCESS',
                imageBitmap,
                timestamp: Date.now()
            }, [imageBitmap]); // Transferable
        } catch (err) {
            console.warn("Frame capture skipped:", err);
        }

        requestRef.current = requestAnimationFrame(animate);
    }, [isReady]);

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
                    <Link href="/dashboard" className="bg-black/80 backdrop-blur-md p-2 rounded-full border border-white/10 text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="bg-blue-600 px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                        <div className="flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3" /> Field Assistant v1.0
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`bg-black/80 backdrop-blur-md px-5 py-3 rounded-2xl border transition-colors ${score > 80 ? 'border-emerald-500/50' : score > 50 ? 'border-blue-500/30' : 'border-red-500/50'} flex flex-col items-center min-w-[90px]`}>
                        <span className="text-[10px] font-black text-white/40 uppercase mb-0.5 tracking-tighter">AI ROI Score</span>
                        <div className={`text-3xl font-black tracking-tighter ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-blue-400' : 'text-red-400'}`}>
                            {score}%
                        </div>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="p-2.5 bg-black/80 rounded-full border border-white/10 shadow-lg">
                            <RefreshCw className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CAMERA STAGE ── */}
            <div className="relative flex-1 bg-[#05080f]">
                {/* 🔴 RED FLASH ON ERROR (ROI PROTECTION) */}
                <AnimatePresence>
                    {isReady && score > 0 && score < 40 && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.3, 0] }} exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="absolute inset-0 bg-red-600 z-10 pointer-events-none" 
                        />
                    )}
                </AnimatePresence>

                <video ref={videoRef} className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} playsInline muted />
                <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                
                {/* EXPERT REMOTE OVERLAY (PHASE 3) */}
                <AnimatePresence>
                    {remoteAnnotation && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                        >
                            <div className="relative">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className={`w-40 h-40 border-4 rounded-full ${remoteAnnotation.type === 'target' ? 'border-blue-500 shadow-[0_0_30px_#3b82f6]' : 'border-red-500 shadow-[0_0_30px_#ef4444]'}`} 
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    {remoteAnnotation.type === 'target' ? <Target className="w-8 h-8 text-blue-400" /> : <AlertCircle className="w-8 h-8 text-red-400" />}
                                    <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap ${remoteAnnotation.type === 'target' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                        {remoteAnnotation.message}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* TARGETING CROSSHAIR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-48 h-48 border-[0.5px] border-white rounded-full" />
                    <div className="absolute w-4 h-px bg-white" />
                    <div className="absolute h-4 w-px bg-white" />
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
                                <div className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-0.5">Step {currentStep} of {STEPS.length} · {config.title}</div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">{STEPS[currentStep-1].title}</h3>
                            </div>
                            {score > 90 && (
                                <button 
                                    onClick={async () => {
                                        // LOG TO AUDIT TRAIL (Production Hub)
                                        await TelemetryService.logStepCompletion({
                                            sessionId,
                                            companyId: companyId || 'unknown',
                                            techId: pilotId,
                                            moduleId: activeModuleId,
                                            stepIndex: currentStep,
                                            score: score,
                                            metadata: { timestamp: Date.now() }
                                        });

                                        if (currentStep < STEPS.length) {
                                            setCurrentStep(prev => prev + 1);
                                        }
                                    }} 
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    {currentStep === STEPS.length ? 'Finalize & Sign' : 'Next Phase'}
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                            <div className={`p-2 rounded-lg ${score > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {score > 80 ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5 animate-pulse" />}
                            </div>
                            <div className="flex-1">
                                <div className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest mb-0.5">Instruction Overlay</div>
                                <p className="text-xs font-bold text-white leading-tight">
                                    {feedback}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-4 flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-blue-400' : 'bg-emerald-500'} animate-pulse`} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            {isOffline ? 'Edge AI: Resilience Mode' : 'Edge AI: Cloud Sync Active'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-white"><Shield className="w-4 h-4" /></button>
                        <button className="text-slate-500 hover:text-white"><Settings className="w-4 h-4" /></button>
                        <button className="text-slate-500 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── DIAGNOSTICS HUD ── */}
            <div className="absolute bottom-4 left-4 z-40 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 pointer-events-none">
                <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${fps > 20 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <span className="text-[8px] font-mono font-bold text-white/60 uppercase">{fps} FPS</span>
                </div>
                <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                    <span className="text-[8px] font-mono font-bold text-white/60 uppercase">12ms Latency</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-mono font-bold text-white/60 uppercase">Edge Local</span>
                </div>
            </div>

            {/* ── LOADING OVERLAY ── */}
            <AnimatePresence>
                {!isReady && (
                    <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[#070b14] flex flex-col items-center justify-center p-12 text-center">
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]" 
                        />
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Nexus Physical Intelligence</h2>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                            Initializing vision systems and loading kinematic models into edge memory...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ERROR OVERLAY (CAMERA BLOCKED) ── */}
            <AnimatePresence>
                {status === 'CAMERA_BLOCKED' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] bg-[#070b14]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center pointer-events-auto">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <CameraOff className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Camera Access Blocked</h2>
                        <p className="text-xs text-slate-400 max-w-xs mb-8">
                            This AR assistant requires camera access to guide you. Please enable camera permissions in your browser settings.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Refresh & Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
