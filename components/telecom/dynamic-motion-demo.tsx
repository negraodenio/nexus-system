'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface DynamicMotionDemoProps {
    skillId: string
    fallback?: React.ReactNode
}

export function DynamicMotionDemo({ skillId, fallback }: DynamicMotionDemoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [frames, setFrames] = useState<any[]>([])
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
    const [phase, setPhase] = useState<'scanning' | 'error' | 'correcting' | 'ok'>('scanning')
    const [score, setScore] = useState(42)

    // 1. Fetch Skill Data & Frames from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Skill Metadata (Video URL)
                const { data: skillData, error: skillError } = await supabase
                    .from('skills')
                    .select('video_url')
                    .eq('id', skillId)
                    .single()

                if (skillError) throw skillError
                if (skillData) setVideoUrl(skillData.video_url)

                // Fetch Skeleton Frames
                const { data, error } = await supabase
                    .from('skill_frames')
                    .select('landmarks, frame_index')
                    .eq('skill_id', skillId)
                    .order('frame_index', { ascending: true })

                if (error) throw error
                if (data) setFrames(data)
            } catch (err) {
                console.error('Error fetching data for AR demo:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [skillId])

    // 2. Playback Sync Loop
    // We let the video dictate the timing
    useEffect(() => {
        const video = videoRef.current
        if (!video || frames.length === 0) return

        const updateFrame = () => {
            const time = video.currentTime
            const duration = video.duration
            if (!duration) {
                requestAnimationFrame(updateFrame)
                return
            }

            // Map time to frame index
            const progress = time / duration
            const frameIdx = Math.floor(progress * (frames.length - 1))
            setCurrentFrameIndex(frameIdx)

            requestAnimationFrame(updateFrame)
        }

        const animId = requestAnimationFrame(updateFrame)
        return () => cancelAnimationFrame(animId)
    }, [frames])

    // 3. Dynamic Metadata simulation (matching progress)
    useEffect(() => {
        if (frames.length === 0) return
        
        const progress = currentFrameIndex / frames.length
        if (progress < 0.2) {
            setPhase('scanning'); setScore(Math.floor(40 + Math.random() * 5))
        } else if (progress < 0.4) {
            setPhase('error'); setScore(Math.floor(30 + Math.random() * 8))
        } else if (progress < 0.7) {
            setPhase('correcting'); setScore(Math.floor(60 + Math.random() * 10))
        } else {
            setPhase('ok'); setScore(Math.floor(95 + Math.random() * 5))
        }
    }, [currentFrameIndex, frames.length])

    // 4. Drawing Logic (Canvas Overlay)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || frames.length === 0 || !frames[currentFrameIndex]) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const currentLandmarks = frames[currentFrameIndex].landmarks[0]
        if (!currentLandmarks) return

        // Sync size
        if (canvas.width !== canvas.offsetWidth) canvas.width = canvas.offsetWidth
        if (canvas.height !== canvas.offsetHeight) canvas.height = canvas.offsetHeight

        const w = canvas.width
        const h = canvas.height
        const color = phase === 'error' ? '#f87171' : phase === 'ok' ? '#4ade80' : phase === 'correcting' ? '#fb923c' : '#60a5fa'

        ctx.clearRect(0, 0, w, h)
        
        // Connections
        const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]]
        
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.strokeStyle = `${color}BB`
        ctx.shadowBlur = 15
        ctx.shadowColor = color

        // Draw Skeleton Lines
        connections.forEach(([a, b]) => {
            const start = currentLandmarks[a]
            const end = currentLandmarks[b]
            if (start && end) {
                ctx.beginPath()
                ctx.moveTo(start.x * w, start.y * h)
                ctx.lineTo(end.x * w, end.y * h)
                ctx.stroke()
            }
        })

        // Draw Joints
        currentLandmarks.forEach((lm: any, i: number) => {
            ctx.fillStyle = i === 8 ? '#FFFFFF' : color
            ctx.beginPath()
            ctx.arc(lm.x * w, lm.y * h, i === 8 ? 5 : 2.5, 0, Math.PI * 2)
            ctx.fill()
        })

    }, [currentFrameIndex, frames, phase])

    const phaseConfig = {
        scanning:   { label: 'Scanning equipment…', color: '#60a5fa', ring: '#3b82f6' },
        error:      { label: 'Deviation detected: Loose PON cable', color: '#f87171', ring: '#ef4444' },
        correcting: { label: 'AI guiding: tighten LC/APC connector', color: '#fb923c', ring: '#f97316' },
        ok:         { label: '✓ Procedure validated', color: '#4ade80', ring: '#22c55e' },
    }
    const cfg = phaseConfig[phase]

    if (loading) {
        return (
            <div className="relative w-full aspect-video rounded-2xl border border-white/10 bg-[#070f1a] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Synchronizing AR Environment...</p>
            </div>
        )
    }

    if (frames.length === 0 || !videoUrl) return <>{fallback}</>

    return (
        <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-[#070f1a] shadow-2xl shadow-blue-900/30 group" style={{ aspectRatio: '16/10' }}>
            
            {/* ── BACKGROUND VIDEO (The Modem/Equipment) ── */}
            <div className="absolute inset-0 z-0">
                <video 
                    ref={videoRef}
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover filter brightness-[0.6] sepia-[0.3] hue-rotate-[180deg]"
                    style={{ transition: 'filter 0.5s ease' }}
                />
                {/* Tech Overlay Filter */}
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Background grid (overlaying video slightly) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-1"
                style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Canvas Stage (The AI Skeleton) */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

            {/* Status HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-4 z-20">
                <motion.div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-md text-[10px] font-mono font-bold"
                    style={{ background: `${cfg.ring}20`, borderColor: `${cfg.ring}50`, color: cfg.color }}
                    key={phase}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                >
                    {phase === 'error' && <AlertTriangle className="w-3 h-3" />}
                    {phase === 'ok' && <CheckCircle className="w-3 h-3" />}
                    {phase === 'scanning' && <motion.div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />}
                    {cfg.label}
                </motion.div>

                {/* Score */}
                <motion.div
                    className="flex flex-col items-center px-3 py-2 rounded-lg border backdrop-blur-md"
                    style={{ background: '#00000080', borderColor: 'rgba(255,255,255,0.1)' }}
                    animate={{ borderColor: `${cfg.ring}60` }}
                >
                    <span className="font-mono text-[8px] text-white/40 uppercase tracking-[0.2em] mb-1">COMPLIANCE</span>
                    <motion.span
                        className="text-2xl font-black text-white"
                        style={{ color: cfg.color }}
                        key={score}
                        initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
                    >
                        {score}%
                    </motion.span>
                </motion.div>
            </div>

            {/* Source Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 z-20">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600/20 rounded-full border border-blue-500/20">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="font-mono text-[7px] text-blue-400 uppercase tracking-widest font-bold">AR STREAM: ENABLED</span>
                </div>
                <span className="font-mono text-[7px] text-white/30 uppercase tracking-[0.3em]">Device: Field_Alpha_01</span>
            </div>

            {/* Corner Scanlines */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/5 z-20 shadow-[0_0_10px_white]" />
        </div>
    )
}
