'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface SkillFrame {
    frame_index: number
    landmarks: any[]
}

interface Skill {
    id: string
    title: string
    video_url: string | null
}

export function SkillPlayer({ skillId }: { skillId: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | null>(null)

    const [skill, setSkill] = useState<Skill | null>(null)
    const [frames, setFrames] = useState<SkillFrame[]>([])
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

    // 1. Load Skill + Frames
    useEffect(() => {
        if (!skillId) return

        const loadSkill = async () => {
            console.log("Loading Skill ID:", skillId)

            // Get skill metadata
            const { data: skillData, error: skillError } = await supabase
                .from('skills')
                .select('id, title, video_url')
                .eq('id', skillId)
                .single()

            if (skillError) {
                console.error("Skill Load Error:", skillError)
                setLoading(false)
                return
            }

            setSkill(skillData)

            // Get frames
            const { data: framesData, error: framesError } = await supabase
                .from('skill_frames')
                .select('*')
                .eq('skill_id', skillId)
                .order('frame_index', { ascending: true })

            if (framesError) {
                console.error("Frames Load Error:", framesError)
            }

            if (framesData && framesData.length > 0) {
                console.log(`Loaded ${framesData.length} frames`)
                setFrames(framesData)
            } else {
                console.warn("No frames found for this ID")
            }

            setLoading(false)
        }
        loadSkill()
    }, [skillId])

    // 2. Draw skeleton on canvas synced with video
    const drawSkeleton = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || frames.length === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Sync canvas size
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth || 640
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight || 360

        // Calculate current frame based on video time
        const fps = 30
        const frameIndex = Math.floor(video.currentTime * fps) % frames.length
        setCurrentFrameIndex(frameIndex)

        const frame = frames[frameIndex]
        if (!frame || !frame.landmarks || frame.landmarks.length === 0) {
            animationRef.current = requestAnimationFrame(drawSkeleton)
            return
        }

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw all hands
        for (const landmarks of frame.landmarks) {
            if (!landmarks) continue

            for (let i = 0; i < landmarks.length; i++) {
                const x = landmarks[i].x * canvas.width
                const y = landmarks[i].y * canvas.height

                ctx.beginPath()
                ctx.arc(x, y, 6, 0, 2 * Math.PI)
                ctx.fillStyle = i === 8 || i === 4 ? '#FF4444' : '#44FF44' // Tips red
                ctx.fill()
                ctx.strokeStyle = '#FFFFFF'
                ctx.lineWidth = 2
                ctx.stroke()
            }

            // Draw connections (simplified skeleton lines)
            ctx.strokeStyle = '#00FF00'
            ctx.lineWidth = 2
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17] // Palm
            ]

            for (const [a, b] of connections) {
                if (landmarks[a] && landmarks[b]) {
                    ctx.beginPath()
                    ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height)
                    ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height)
                    ctx.stroke()
                }
            }
        }

        animationRef.current = requestAnimationFrame(drawSkeleton)
    }

    // 3. Start/Stop animation loop
    useEffect(() => {
        if (isPlaying && frames.length > 0) {
            animationRef.current = requestAnimationFrame(drawSkeleton)
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [isPlaying, frames])

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    const handlePause = () => {
        if (videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }

    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    if (loading) {
        return <div className="text-white p-4 text-center">Loading Ghost Data...</div>
    }

    if (!skill) {
        return <div className="text-red-400 p-4 text-center">⚠️ Skill not found</div>
    }

    if (!skill.video_url) {
        return <div className="text-yellow-400 p-4 text-center">⚠️ No video recorded for this skill (old format)</div>
    }

    return (
        <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden border border-indigo-500/30">
            {/* Video + Canvas Overlay */}
            <div className="relative aspect-video">
                <video
                    ref={videoRef}
                    src={skill.video_url}
                    className="w-full h-full object-contain bg-black"
                    playsInline
                    muted
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50">
                <div className="flex items-center gap-2">
                    {!isPlaying ? (
                        <button
                            onClick={handlePlay}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700"
                        >
                            <Play className="w-4 h-4" /> Play
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700"
                        >
                            <Pause className="w-4 h-4" /> Pause
                        </button>
                    )}
                    <button
                        onClick={handleRestart}
                        className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-white font-mono text-xs bg-black/50 px-2 py-1 rounded">
                    Frame: {currentFrameIndex + 1} / {frames.length}
                </div>
            </div>
        </div>
    )
}
