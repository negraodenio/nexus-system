'use client'

/**
 * @fileoverview Learn Page
 * @description Learner follows step-by-step instructions with real-time validation.
 *              - Shows current instruction
 *              - Captures hand tracking via MediaPipe
 *              - Validates execution against OKEM
 *              - Plays audio instructions
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GuidanceStep {
    stepNumber: number
    instruction: string
    waitDurationMs: number
    passThreshold: number
    isCritical: boolean
}

interface ValidationResult {
    overallScore: number
    stepScores: Array<{
        stepIndex: number
        score: number
        passed: boolean
        feedback: string
    }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LearnPage() {
    const [okemId, setOkemId] = useState('')
    const [currentStep, setCurrentStep] = useState<GuidanceStep | null>(null)
    const [totalSteps, setTotalSteps] = useState(0)
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [error, setError] = useState('')

    const videoRef = useRef<HTMLVideoElement>(null)
    const recognitionRef = useRef<EventTarget | null>(null)
    const framesRef = useRef<Array<{ x: number; y: number; z: number; visibility: number }[]>>([])
    const timestampsRef = useRef<number[]>([])
    const startTimeRef = useRef<number>(0)

    // ── Initialize Speech Synthesis ────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            console.log('Speech Synthesis available')
        }
    }, [])

    // ── Speak Instruction ──────────────────────────────────────────────────
    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'pt-PT'
            utterance.rate = 0.9
            utterance.pitch = 1
            window.speechSynthesis.speak(utterance)
        }
    }, [])

    // ── Start Learning Session ─────────────────────────────────────────────
    const startSession = useCallback(async () => {
        if (!okemId.trim()) {
            setError('Please enter an OKEM ID')
            return
        }

        setError('')
        setIsRecording(true)

        // Start camera
        if (videoRef.current) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (err) {
                console.error('Camera error:', err)
                setError('Could not access camera')
                return
            }
        }

        // Fetch first step guidance
        try {
            const response = await fetch(`/api/guidance?okemId=${okemId}&step=0`)
            const data = await response.json()

            if (data.success) {
                setCurrentStep(data.currentInstruction)
                setTotalSteps(data.totalSteps)
                speak(data.currentInstruction.instruction)
            } else {
                setError(data.error)
                setIsRecording(false)
            }
        } catch (err) {
            setError('Failed to fetch guidance')
            setIsRecording(false)
        }
    }, [okemId, speak])

    // ── Submit Step for Validation ─────────────────────────────────────────
    const submitStep = useCallback(async () => {
        if (!currentStep || framesRef.current.length === 0) {
            return
        }

        try {
            const response = await fetch('/api/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    okemId,
                    kinematicFrames: framesRef.current,
                    timestamps: timestampsRef.current,
                    currentStepIndex: currentStep.stepNumber - 1,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setValidationResult(data)

                // Check if passed
                const stepScore = data.stepScores.find(
                    (s: { stepIndex: number }) => s.stepIndex === currentStep.stepNumber - 1
                )

                if (stepScore?.passed) {
                    // Move to next step
                    if (currentStep.stepNumber < totalSteps) {
                        const nextResponse = await fetch(
                            `/api/guidance?okemId=${okemId}&step=${currentStep.stepNumber}`
                        )
                        const nextData = await nextResponse.json()

                        if (nextData.success) {
                            setCurrentStep(nextData.currentInstruction)
                            speak(nextData.currentInstruction.instruction)
                            framesRef.current = []
                            timestampsRef.current = []
                        }
                    } else {
                        // Completed all steps
                        setIsCompleted(true)
                        speak('Parabéns! Procedimento concluído com sucesso!')
                    }
                } else {
                    // Failed - provide feedback
                    speak(stepScore?.feedback || 'Tente novamente')
                }
            }
        } catch (err) {
            console.error('Validation error:', err)
        }
    }, [currentStep, okemId, totalSteps, speak])

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        📚 Aprender Procedimento
                    </h1>
                    <p className="text-gray-400">
                        Siga as instruções. O sistema valida em tempo real.
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                    {!isRecording ? (
                        <>
                            {/* Input Form */}
                            <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        OKEM ID (do gravador)
                                    </label>
                                    <input
                                        type="text"
                                        value={okemId}
                                        onChange={(e) => setOkemId(e.target.value)}
                                        placeholder="Cole o ID do procedimento"
                                        className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={startSession}
                                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition-colors"
                                >
                                    🚀 Começar Aprendizagem
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-900/50 border border-red-700 rounded-xl p-4">
                                    <p className="text-red-300">{error}</p>
                                </div>
                            )}
                        </>
                    ) : isCompleted ? (
                        /* Completion Screen */
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold mb-4 text-green-400">
                                Procedimento Concluído!
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Parabéns! Você completou todos os passos com sucesso.
                            </p>

                            {validationResult && (
                                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                                    <p className="text-gray-400">Score Final</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        {validationResult.overallScore.toFixed(1)}%
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setIsRecording(false)
                                    setIsCompleted(false)
                                    setCurrentStep(null)
                                    setValidationResult(null)
                                }}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                                Aprender Outro Procedimento
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Video Preview */}
                            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full rounded-lg"
                                />
                            </div>

                            {/* Current Step Instruction */}
                            {currentStep && (
                                <div className={`rounded-xl p-6 mb-6 border ${
                                    currentStep.isCritical
                                        ? 'bg-yellow-900/30 border-yellow-700'
                                        : 'bg-gray-800/50 border-gray-700'
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-400">
                                            Passo {currentStep.stepNumber} de {totalSteps}
                                        </span>
                                        {currentStep.isCritical && (
                                            <span className="text-xs bg-yellow-600 px-2 py-1 rounded">
                                                CRÍTICO
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xl font-medium mb-4">
                                        {currentStep.instruction}
                                    </p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => speak(currentStep.instruction)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                        >
                                            🔊 Repetir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Validation Result */}
                            {validationResult && (
                                <div className={`rounded-xl p-4 mb-6 border ${
                                    validationResult.overallScore >= 70
                                        ? 'bg-green-900/30 border-green-700'
                                        : 'bg-red-900/30 border-red-700'
                                }`}>
                                    <p className="font-medium">
                                        Score: {validationResult.overallScore.toFixed(1)}%
                                    </p>
                                    {validationResult.stepScores[currentStep?.stepNumber! - 1]?.feedback && (
                                        <p className="text-sm text-gray-300 mt-2">
                                            {validationResult.stepScores[currentStep?.stepNumber! - 1].feedback}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-4">
                                <button
                                    onClick={submitStep}
                                    className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg transition-colors"
                                >
                                    ✅ Confirmar Passo
                                </button>
                                <button
                                    onClick={() => {
                                        setIsRecording(false)
                                        setCurrentStep(null)
                                    }}
                                    className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl"
                                >
                                    ⏹ Parar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
