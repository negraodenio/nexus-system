'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { supabase } from '@/lib/supabase'
import { Camera, Video, RotateCcw, Upload, Shield, Eye, EyeOff, FileText, BookOpen, X, Cpu } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SafetyMonitor } from './safety-monitor'

interface HandSkeleton {
    frame_index: number
    landmarks: any[]
}

export interface SkillRecorderProps {
    onSave?: (skillData: any) => void
}

export function SkillRecorder({ onSave }: SkillRecorderProps) {
    const { showToast } = useToast()
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const handLandmarkerRef = useRef<HandLandmarker | null>(null)
    const requestRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const recordedFramesRef = useRef<HandSkeleton[]>([])

    // Video Recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const videoChunksRef = useRef<Blob[]>([])

    const [status, setStatus] = useState('Loading Vision...')
    const [isRecording, setIsRecording] = useState(false)
    const [frameCount, setFrameCount] = useState(0)
    const [lastSavedId, setLastSavedId] = useState<string | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
    const [isReady, setIsReady] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<string | null>(null)
    const [isSkeletonOnly, setIsSkeletonOnly] = useState(false)
    const [sopInstructions, setSopInstructions] = useState('')
    const [showTeleprompter, setShowTeleprompter] = useState(true)
    const [showSopInput, setShowSopInput] = useState(false)
    const [isSafetyMonitorActive, setIsSafetyMonitorActive] = useState(false)
    const [skillTitle, setSkillTitle] = useState('')

    // Track latest landmarks for SafetyMonitor
    const [latestLandmarks, setLatestLandmarks] = useState<any[]>([])

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
                    numHands: 2
                })
                handLandmarkerRef.current = landmarker
                setStatus('Ready to Record')
                setIsReady(true)
            } catch (err) {
                console.error("Vision Init Error:", err)
                setStatus('Error: Vision Failed')
            }
        }
        initVision()

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [])

    // 2. Start Camera
    useEffect(() => {
        const startCamera = async () => {
            if (!videoRef.current) return

            if (!navigator.mediaDevices?.getUserMedia) {
                setStatus('Error: Camera Blocked')
                showToast('Câmera Bloqueada! Ative "unsafely-treat-insecure-origin-as-secure" em chrome://flags', 'error')
                return
            }

            // Stop previous stream
            if (videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false // No audio for now
                })
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            } catch (err: any) {
                // Ignore AbortError - happens when camera is reinitialized quickly
                if (err.name === 'AbortError') {
                    console.log('Camera init aborted (expected during switch)')
                    return
                }
                console.error("Camera Error:", err)
                setStatus('Error: Camera Unavailable')
            }
        }
        startCamera()
    }, [facingMode])

    // 3. Continuous Detection Loop & Drawing
    const animate = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const landmarker = handLandmarkerRef.current

        if (!video || !canvas || !landmarker || video.readyState < 4) {
            requestRef.current = requestAnimationFrame(animate)
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            requestRef.current = requestAnimationFrame(animate)
            return
        }

        // Sync canvas size
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight

        const nowInMs = Date.now()
        const results = landmarker.detectForVideo(video, nowInMs)

        // Clear canvas or Fill Black for Privacy Mode
        if (isSkeletonOnly) {
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        // Draw landmarks
        if (results.landmarks && results.landmarks.length > 0) {
            for (const landmarks of results.landmarks) {
                for (let i = 0; i < landmarks.length; i++) {
                    const x = landmarks[i].x * canvas.width
                    const y = landmarks[i].y * canvas.height

                    ctx.beginPath()
                    ctx.arc(x, y, 5, 0, 2 * Math.PI)
                    // Index finger red (8), others green
                    ctx.fillStyle = i === 8 ? '#EF4444' : '#10B981'
                    ctx.fill()
                    ctx.strokeStyle = '#FFFFFF'
                    ctx.lineWidth = 1
                    ctx.stroke()
                }
            }

            // Record skeleton if active
            if (isRecording) {
                const frameIndex = Math.floor((nowInMs - startTimeRef.current) / 33)
                recordedFramesRef.current.push({
                    frame_index: frameIndex,
                    landmarks: results.landmarks
                })
                setFrameCount(recordedFramesRef.current.length)
            }

            // Update state for Safety Monitor (first hand only)
            if (results.landmarks && results.landmarks[0]) {
                setLatestLandmarks(results.landmarks[0])
            }
        }

        requestRef.current = requestAnimationFrame(animate)
    }, [isRecording, isSkeletonOnly])

    // Start animation loop when ready
    useEffect(() => {
        if (isReady) {
            requestRef.current = requestAnimationFrame(animate)
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [isReady, animate])

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    const startRecording = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !video.srcObject || !canvas) return

        // Reset state
        recordedFramesRef.current = []
        videoChunksRef.current = []
        setFrameCount(0)
        setLastSavedId(null)
        startTimeRef.current = Date.now()

        // Choose source stream: Privacy Mode (Canvas) vs Standard (Camera)
        let stream: MediaStream

        if (isSkeletonOnly) {
            // Record from Canvas (30fps)
            stream = canvas.captureStream(30)
        } else {
            stream = video.srcObject as MediaStream
        }

        let mimeType = 'video/webm;codecs=vp9'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/mp4'
            }
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType })

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                videoChunksRef.current.push(e.data)
            }
        }

        mediaRecorder.start(100)
        mediaRecorderRef.current = mediaRecorder

        setIsRecording(true)
        setStatus(isSkeletonOnly ? '💀 Recording Privacy Mode...' : '🔴 Recording Video...')
    }

    const stopRecording = async () => {
        setIsRecording(false)
        setStatus('Processing...')

        // Stop MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }

        // Wait for final chunk
        await new Promise(resolve => setTimeout(resolve, 200))

        // Save everything
        await saveSkillWithVideo()
    }

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    const saveSkillWithVideo = async () => {
        const frames = recordedFramesRef.current
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        const title = skillTitle.trim() || `Skill ${new Date().toLocaleTimeString()}`

        // Check Online Status
        if (!navigator.onLine) {
            setUploadProgress('Saving Offline...')
            try {
                // Dynamic import to avoid SSR issues if any, though we are client side
                const { db } = await import('@/lib/db-local')

                await db.pendingSkills.add({
                    title,
                    videoBlob,
                    skeletonFrames: frames as any,
                    createdAt: new Date(),
                    status: 'pending',
                    instructions: sopInstructions
                })

                setStatus('✅ Saved to Offline Queue')
                setLastSavedId('OFFLINE-PENDING')
                setUploadProgress(null)
                return
            } catch (err) {
                setStatus('Error: Failed to save offline')
                console.error(err)
                setUploadProgress(null)
                return
            }
        }

        setUploadProgress('Creating skill...')

        // Get current user (if logged in)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Create skill record
        const { data: skill, error: skillError } = await (supabase as any)
            .from('skills')
            .insert({
                title,
                difficulty_level: 1,
                instructions: sopInstructions,
                creator_id: user?.id || null // Associate with logged in user
            })
            .select()
            .single()

        if (skillError || !skill) {
            console.error('Skill Insert Error:', skillError)
            const errMsg = skillError?.message || 'Unknown error'
            setStatus(`Error: ${errMsg}`)
            showToast(`Falha ao criar skill: ${errMsg}`, 'error')
            setUploadProgress(null)
            return
        }

        // 2. Upload video to Storage
        setUploadProgress('Uploading video...')
        const videoFileName = `${skill.id}.webm`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('skill_videos')
            .upload(videoFileName, videoBlob, { contentType: 'video/webm', upsert: true })

        if (uploadError) {
            console.error('Video Upload Error:', uploadError)
            setStatus('Error: Video upload failed - ' + uploadError.message)
            setUploadProgress(null)
            return
        }

        // 3. Get public URL and update skill record
        const { data: { publicUrl } } = supabase.storage
            .from('skill_videos')
            .getPublicUrl(videoFileName)

        console.log('[DEBUG] Public URL generated:', publicUrl)

        const { error: updateError } = await (supabase as any)
            .from('skills')
            .update({ video_url: publicUrl })
            .eq('id', skill.id)

        console.log('[DEBUG] Update skill result:', updateError)

        if (updateError) {
            console.error('Skill Update Error:', updateError)
            setStatus('Error: Failed to link video to skill')
        }

        // 4. Save skeleton frames
        setUploadProgress('Saving skeleton data...')
        const CHUNK_SIZE = 100
        const payload = frames.map(f => ({
            skill_id: skill.id,
            frame_index: f.frame_index,
            landmarks: f.landmarks
        }))

        for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
            const chunk = payload.slice(i, i + CHUNK_SIZE)
            await (supabase as any).from('skill_frames').insert(chunk)
        }

        console.log(`Saved ${payload.length} frames + video to Skill ${skill.id}`)
        
        // 5. Trigger Semantic Search Embedding
        try {
            setUploadProgress('Indexing for Semantic Search...')
            await fetch('/api/skills/semantic-search', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skillId: skill.id,
                    title: title,
                    description: '', // Can be added if field exists in UI
                    instructions: sopInstructions
                })
            })
        } catch (err) {
            console.error('Semantic Indexing Error:', err)
            // Non-blocking error, we don't return here
        }

        setLastSavedId(skill.id)
        setStatus('✅ Habilidade Salva com IA!')
        setUploadProgress(null)
    }

    return (
        <div className="relative w-full h-96 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            {/* Title Input - Prominent at Top */}
            <div className="absolute top-4 left-4 right-20 z-30">
                <input
                    type="text"
                    placeholder="🎬 Nome: Diagnóstico Modem MEO"
                    value={skillTitle}
                    onChange={e => setSkillTitle(e.target.value)}
                    disabled={isRecording}
                    className="w-full bg-black/70 backdrop-blur-md border-2 border-blue-500/50 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 shadow-lg"
                />
            </div>
            <video
                ref={videoRef}
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Smart Safety Monitor (Local Cortex) */}
            <SafetyMonitor landmarks={latestLandmarks} isActive={isSafetyMonitorActive} />

            {/* Teleprompter Overlay */}
            {isRecording && sopInstructions && showTeleprompter && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-4/5 md:w-2/3 max-h-48 z-20 pointer-events-none">
                    <div className="bg-black/40 text-white p-4 rounded-xl backdrop-blur-sm shadow-xl border border-white/10 overflow-y-auto animate-in fade-in slide-in-from-top-4">
                        <h4 className="text-yellow-400 font-bold text-xs uppercase mb-1 flex items-center gap-2">
                            <BookOpen className="w-3 h-3" /> Standard Operating Procedure
                        </h4>
                        <p className="text-lg font-medium leading-relaxed drop-shadow-md whitespace-pre-wrap text-center opacity-90">
                            {sopInstructions}
                        </p>
                    </div>
                </div>
            )}

            {/* SOP Input Modal (Pre-recording) */}
            {showSopInput && !isRecording && (
                <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-[#1c242f] w-full max-w-md rounded-xl p-6 border border-slate-700 shadow-2xl relative">
                        <button
                            onClick={() => setShowSopInput(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Add Instructions (POP)
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">Paste the procedure steps here. They will appear on screen while you record.</p>
                        <textarea
                            value={sopInstructions}
                            onChange={(e) => setSopInstructions(e.target.value)}
                            placeholder="1. Check safety equipment&#10;2. Verify pressure levels&#10;3. Turn valve clockwise..."
                            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4 font-mono text-sm"
                        />
                        <button
                            onClick={() => setShowSopInput(false)}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                        >
                            Save Instructions
                        </button>
                    </div>
                </div>
            )}

            {/* Camera Switch & Privacy Toggle */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={toggleCamera} className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20" title="Switch Camera">
                    <div className="flex items-center gap-1 text-xs font-bold px-1">
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-indigo-400">{facingMode === 'user' ? 'Front' : 'Back'}</span>
                    </div>
                </button>

                {/* SOP Toggle Button */}
                {!isRecording && (
                    <button
                        onClick={() => setShowSopInput(true)}
                        className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all ${sopInstructions ? 'bg-indigo-600/80 text-white' : 'bg-black/60 text-gray-400 hover:bg-white/20'}`}
                        title="Add Instructions"
                    >
                        <div className="flex items-center gap-1 text-xs font-bold px-1">
                            <FileText className="w-4 h-4" />
                            <span>{sopInstructions ? 'Edit POP' : 'Add POP'}</span>
                        </div>
                    </button>
                )}

                {/* Teleprompter Toggle (during recording) */}
                {isRecording && sopInstructions && (
                    <button
                        onClick={() => setShowTeleprompter(!showTeleprompter)}
                        className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all ${showTeleprompter ? 'bg-indigo-600/80 text-white' : 'bg-black/60 text-gray-400'}`}
                    >
                        <div className="flex items-center gap-1 text-xs font-bold px-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{showTeleprompter ? 'Hide Text' : 'Show Text'}</span>
                        </div>
                    </button>
                )}

                <button
                    onClick={() => setIsSkeletonOnly(!isSkeletonOnly)}
                    className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all ${isSkeletonOnly ? 'bg-green-500/80 text-white' : 'bg-black/60 text-gray-400 hover:bg-white/20'}`}
                >
                    <div className="flex items-center gap-1 text-xs font-bold px-1">
                        {isSkeletonOnly ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        <span>{isSkeletonOnly ? 'Privacy ON' : 'Privacy OFF'}</span>
                    </div>
                </button>

                {/* Safety Monitor Toggle */}
                <button
                    onClick={() => setIsSafetyMonitorActive(!isSafetyMonitorActive)}
                    className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all ${isSafetyMonitorActive ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-black/60 text-gray-400 hover:bg-white/20'}`}
                    title="Toggle Local AI Safety Monitor"
                >
                    <div className="flex items-center gap-1 text-xs font-bold px-1">
                        <Cpu className="w-4 h-4" />
                        <span>{isSafetyMonitorActive ? 'AI Safety: ON' : 'AI Safety: OFF'}</span>
                    </div>
                </button>
            </div >

            {/* Visual indicator for Privacy Shield */}
            {
                isSkeletonOnly && (
                    <div className="absolute top-4 left-4 z-10 bg-green-500 text-black px-3 py-1 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse">
                        <Shield className="w-4 h-4" />
                        <span>🛡️ PRIVACY SHIELD ACTIVE</span>
                    </div>
                )
            }

            {/* Upload Progress */}
            {
                uploadProgress && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-indigo-500 mx-auto animate-bounce" />
                            <p className="text-white font-bold mt-4">{uploadProgress}</p>
                        </div>
                    </div>
                )
            }

            {/* Bottom UI */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : (isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse')}`} />
                            {status}
                        </h3>
                        <p className="text-gray-400 text-sm">Frames: {frameCount} | 📹 Video: {isRecording ? 'Recording' : 'Ready'}</p>
                    </div>

                    <button
                        onClick={toggleRecording}
                        disabled={!isReady || uploadProgress !== null}
                        className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${!isReady || uploadProgress !== null ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : isRecording ? 'bg-white text-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]'
                                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                            }`}
                    >
                        {isRecording ? '⏹ Stop Recording' : <><Video className="w-5 h-5" /> Record Skill</>}
                    </button>
                </div>

                <div className="mt-4 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 p-3 rounded-lg border border-indigo-500/50 text-center">
                    <span className="text-xs text-indigo-300 uppercase font-bold">✅ Skill Asset Created (Video + Skeleton)</span>
                    <code
                        onClick={() => {
                            navigator.clipboard.writeText(lastSavedId!)
                            showToast('ID copied to clipboard!', 'success')
                        }}
                        className="block bg-black/50 px-3 py-1 rounded text-white font-mono text-sm mt-1 select-all cursor-pointer hover:bg-black/70 transition-colors"
                        title="Click to copy"
                    >
                        {lastSavedId}
                    </code>
                    <p className="text-gray-400 text-xs mt-1">Click ID to copy • Tag for Nexus</p>
                </div>
            </div>
        </div >
    )
}
