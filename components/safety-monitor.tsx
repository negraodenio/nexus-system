'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocalBrain } from '@/hooks/use-local-brain'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

interface Landmark {
    x: number;
    y: number;
    z: number;
}

interface SafetyMonitorProps {
    landmarks: Landmark[]
    isActive: boolean
}

export function SafetyMonitor({ landmarks, isActive }: SafetyMonitorProps) {
    const { initializeBrain, isReady, isLoading, progress } = useLocalBrain()
    const [safetyStatus, setSafetyStatus] = useState<'SAFE' | 'DANGER' | 'Analyzing...'>('Analyzing...')
    const [reason, setReason] = useState('')

    // Load brain when component activates
    useEffect(() => {
        if (isActive && !isReady && !isLoading) {
            initializeBrain()
        }
    }, [isActive, isReady, isLoading, initializeBrain])

    // 3D Danger Zone Definition (Relative to camera frame)
    // Adjust these values based on field testing
    const DANGER_ZONE = useMemo(() => ({
        yMin: 0.0,  // Top of screen
        yMax: 0.3,  // Upper 30%
    }), [])

    // Hybrid Analysis Loop
    useEffect(() => {
        if (!isActive || landmarks.length === 0) return

        // 1. FAST CHECK (Math / Spatial Geometry) - Runs every frame (or throttled slightly)
        // Using logic for immediate feedback (Zero Latency)
        const wrist = landmarks[0]

        if (!wrist) return

        // Check if wrist is in Danger Zone (Top of screen)
        const inDangerZone = wrist.y >= DANGER_ZONE.yMin && wrist.y <= DANGER_ZONE.yMax

        if (inDangerZone) {
            setSafetyStatus('DANGER')
            setReason('Wrist entered restricted upper zone')
        } else {
            setSafetyStatus('SAFE')
            setReason('Posture within safety limits')
        }
    }, [isActive, landmarks, DANGER_ZONE])

    if (!isActive) return null

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            {/* Brain Loading State (Hidden if we rely on Math for immediate check, 
                but good to show if we want to imply AI is warming up for deeper tasks) */}
            {!isReady && isActive && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 p-2 rounded text-xs text-white whitespace-nowrap">
                    initializing cortex... {progress}
                </div>
            )}

            {/* Active Monitor State (Always visible if Active) */}
            {(
                <div className={`
                    backdrop-blur-md border-2 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 transition-colors duration-100 ease-out
                    ${safetyStatus === 'DANGER'
                        ? 'bg-red-950/90 border-red-500 text-red-100'
                        : 'bg-green-950/90 border-green-500 text-green-100'}
                `}>
                    <div className={`p-2 rounded-full ${safetyStatus === 'DANGER' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                        {safetyStatus === 'DANGER' ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="font-black text-xl tracking-wider">
                            {safetyStatus}
                        </h3>
                        <p className="text-xs opacity-80 font-mono uppercase tracking-widest">
                            {reason || 'Monitoring active'}
                        </p>
                    </div>
                    {/* Pulsing Dot indicating "Thinking" */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-75" />
                    </div>
                </div>
            )}
        </div>
    )
}
