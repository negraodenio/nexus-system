'use client'

import React from 'react'
import { Activity } from 'lucide-react'

interface EMGVisualizerProps {
    channels: number[]
    quality: number
}

export function EMGVisualizer({ channels, quality }: EMGVisualizerProps) {
    return (
        <div className="bg-black/80 rounded-2xl p-4 border border-blue-500/30 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="text-blue-100 font-bold text-sm tracking-widest uppercase">BCI Neural Stream</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${quality > 0.8 ? 'bg-green-500' : 'bg-yellow-500'} animate-ping`} />
                    <span className="text-[10px] text-slate-400 font-mono">{(quality * 100).toFixed(1)}% SIG</span>
                </div>
            </div>

            <div className="grid grid-cols-8 gap-2 h-24 items-end">
                {channels.map((val, i) => (
                    <div key={i} className="group relative flex flex-col items-center">
                        <div 
                            className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm transition-all duration-75"
                            style={{ height: `${Math.max(4, val * 100)}%` }}
                        />
                        <div className="w-1 h-1 bg-blue-900/50 rounded-full mt-1" />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            CH{i+1}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex justify-between text-[9px] font-bold text-slate-500 border-t border-slate-800 pt-2">
                <span>60HZ STREAM</span>
                <span className="text-blue-500/50 italic tracking-tighter">MINIMAX M2.7 SYNCED</span>
            </div>
        </div>
    )
}
