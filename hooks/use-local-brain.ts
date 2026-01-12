'use client'

import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm'

// Using Phi-3-mini-4k-instruct-q4f16_1-MLC for optimal browser performance (Approx 2.3GB)
// Or Gemma-2b-it-q4f16_1-MLC for even lighter weight
const SELECTED_MODEL = 'Phi-3-mini-4k-instruct-q4f16_1-MLC'

export interface BrainState {
    isLoading: boolean
    progress: string
    isReady: boolean
    error: string | null
}

export function useLocalBrain() {
    const engineRef = useRef<MLCEngine | null>(null)
    const [state, setState] = useState<BrainState>({
        isLoading: false,
        progress: '',
        isReady: false,
        error: null
    })

    const initializeBrain = useCallback(async () => {
        if (engineRef.current || state.isReady) return

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const engine = await CreateMLCEngine(
                SELECTED_MODEL,
                {
                    initProgressCallback: (report) => {
                        setState(prev => ({
                            ...prev,
                            progress: report.text
                        }))
                    }
                }
            )

            engineRef.current = engine
            setState({
                isLoading: false,
                progress: 'Brain Loaded',
                isReady: true,
                error: null
            })
            console.log('Phi-3 Local Brain Ready 🧠')
        } catch (error: unknown) {
            console.error('Brain Init Error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to load brain'
            setState({
                isLoading: false,
                progress: '',
                isReady: false,
                error: errorMessage
            })
        }
    }, [state.isReady])

    const askBrain = useCallback(async (prompt: string): Promise<string> => {
        if (!engineRef.current || !state.isReady) {
            throw new Error('Brain not ready')
        }

        try {
            const reply = await engineRef.current.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1, // Low temp for safety/deterministic checks
                max_tokens: 50,    // Keep responses short for speed
            })

            return reply.choices[0].message.content || '...'
        } catch (error) {
            console.error('Inference Error:', error)
            return 'ERROR'
        }
    }, [state.isReady])

    return {
        ...state,
        initializeBrain,
        askBrain
    }
}
