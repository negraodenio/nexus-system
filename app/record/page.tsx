'use client'

/**
 * @fileoverview Record Page
 * @description Specialist/parent records a procedure while narrating.
 *              - Captures hand tracking via MediaPipe
 *              - Captures audio narration via Web Speech API
 *              - Sends data to /api/record for OKEM generation
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Web Speech API types
// ─────────────────────────────────────────────────────────────────────────────

interface SpeechRecognitionResult {
    isFinal: boolean
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: Event) => void) | null
    onend: (() => void) | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RecordingState {
    isRecording: boolean
    isPaused: boolean
    duration: number
    frameCount: number
    audioSegments: Array<{
        text: string
        startTimeMs: number
        endTimeMs: number
        confidence: number
    }>
}

interface OKEMResult {
    id: string
    procedureName: string
    stepCount: number
    confidence: number
    steps: Array<{
        name: string
        description: string
        isCritical: boolean
    }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RecordPage() {
    const [procedureName, setProcedureName] = useState('')
    const [specialistId, setSpecialistId] = useState('')
    const [recording, setRecording] = useState<RecordingState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
        frameCount: 0,
        audioSegments: [],
    })
    const [okemResult, setOkemResult] = useState<OKEMResult | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const framesRef = useRef<Array<{ x: number; y: number; z: number; visibility: number }[]>>([])
    const timestampsRef = useRef<number[]>([])
    const startTimeRef = useRef<number>(0)

    // ── Initialize MediaPipe Hands ─────────────────────────────────────────
    useEffect(() => {
        // MediaPipe Hands would be initialized here
        // For now, we'll use a placeholder
        console.log('MediaPipe Hands would initialize here')
    }, [])

    // ── Initialize Speech Recognition ──────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognitionAPI = (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition
            const recognition = new SpeechRecognitionAPI()

            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'pt-PT'

            recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
                const result = event.results[event.results.length - 1]
                if (result.isFinal) {
                    const audioSegments = [...recording.audioSegments]
                    audioSegments.push({
                        text: result[0].transcript,
                        startTimeMs: Date.now() - startTimeRef.current,
                        endTimeMs: Date.now() - startTimeRef.current,
                        confidence: result[0].confidence,
                    })
                    setRecording(prev => ({ ...prev, audioSegments }))
                }
            }

            recognitionRef.current = recognition
        }
    }, [recording.audioSegments])

    // ── Start Recording ────────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        if (!procedureName.trim()) {
            setError('Please enter a procedure name')
            return
        }

        setError('')
        framesRef.current = []
        timestampsRef.current = []
        startTimeRef.current = Date.now()

        setRecording({
            isRecording: true,
            isPaused: false,
            duration: 0,
            frameCount: 0,
            audioSegments: [],
        })

        // Start speech recognition
        if (recognitionRef.current) {
            recognitionRef.current.start()
        }

        // Start camera and hand tracking
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                })
                .catch(err => {
                    console.error('Camera error:', err)
                    setError('Could not access camera')
                })
        }
    }, [procedureName])

    // ── Stop Recording ─────────────────────────────────────────────────────
    const stopRecording = useCallback(async () => {
        setRecording(prev => ({ ...prev, isRecording: false }))

        // Stop speech recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }

        // Stop camera
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
        }

        // Process recording
        setIsProcessing(true)
        try {
            const response = await fetch('/api/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    procedureName,
                    specialistId: specialistId || 'anonymous',
                    audioSegments: recording.audioSegments,
                    kinematicFrames: framesRef.current,
                    timestamps: timestampsRef.current,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setOkemResult(data.okem)
            } else {
                setError(data.error || 'Failed to process recording')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setIsProcessing(false)
        }
    }, [procedureName, specialistId, recording.audioSegments])

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        🎬 Gravar Procedimento
                    </h1>
                    <p className="text-gray-400">
                        Fale enquanto executa. O sistema aprende automaticamente.
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                    {!okemResult ? (
                        <>
                            {/* Input Form */}
                            <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Nome do Procedimento
                                    </label>
                                    <input
                                        type="text"
                                        value={procedureName}
                                        onChange={(e) => setProcedureName(e.target.value)}
                                        placeholder="Ex: Troca de lâmpada do carro"
                                        className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        disabled={recording.isRecording}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Seu Nome (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={specialistId}
                                        onChange={(e) => setSpecialistId(e.target.value)}
                                        placeholder="Ex: Pai do João"
                                        className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        disabled={recording.isRecording}
                                    />
                                </div>
                            </div>

                            {/* Video Preview */}
                            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full rounded-lg"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            {/* Recording Controls */}
                            <div className="flex justify-center gap-4 mb-6">
                                {!recording.isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition-colors"
                                    >
                                        🔴 Gravar
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-lg transition-colors"
                                    >
                                        ⏹ Parar
                                    </button>
                                )}
                            </div>

                            {/* Recording Status */}
                            {recording.isRecording && (
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                        <span className="font-medium">Gravando...</span>
                                    </div>
                                    <div className="text-center text-gray-400">
                                        <p>{recording.audioSegments.length} frases capturadas</p>
                                    </div>
                                </div>
                            )}

                            {/* Processing */}
                            {isProcessing && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Processando gravação...</p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mt-4">
                                    <p className="text-red-300">{error}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* OKEM Result */
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-4 text-green-400">
                                ✅ Procedimento Gravado!
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-gray-400">Nome</p>
                                    <p className="font-medium">{okemResult.procedureName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Passos Extraídos</p>
                                    <p className="font-medium">{okemResult.stepCount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Confiança</p>
                                    <p className="font-medium">
                                        {(okemResult.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <h3 className="font-bold mb-3">Passos:</h3>
                            <div className="space-y-2">
                                {okemResult.steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-lg ${
                                            step.isCritical
                                                ? 'bg-yellow-900/30 border border-yellow-700'
                                                : 'bg-gray-700/50'
                                        }`}
                                    >
                                        <p className="font-medium">
                                            {i + 1}. {step.name}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={() => setOkemResult(null)}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                >
                                    Gravar Novamente
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(okemResult.id)
                                    }}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
                                >
                                    Copiar ID
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
