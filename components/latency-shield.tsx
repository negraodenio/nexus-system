'use client'

import React from 'react'
import { Wifi, Signal, AlertTriangle } from 'lucide-react'

interface LatencyShieldProps {
    rtt: number; // Round Trip Time (ms)
    jitter: number; // Milliseconds
    packetLoss: number; // Percentage
}

export function LatencyShield({ rtt, jitter, packetLoss }: LatencyShieldProps) {
    const isGood = rtt < 67 && packetLoss < 1;
    const isWarning = rtt >= 100 || packetLoss > 5;
    const isCritical = rtt >= 250 || packetLoss > 15;

    return (
        <div className="bg-black/80 rounded-2xl p-4 border border-white/5 backdrop-blur-md shadow-2xl flex flex-col gap-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Wifi className={`w-4 h-4 ${isGood ? 'text-green-500' : isWarning ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">5G MEC SHIELD</span>
                </div>
                {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>LATENCY (RTT)</span>
                        <span className={isGood ? 'text-green-400' : 'text-red-400'}>{rtt}ms</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, (rtt / 300) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2">
                    <span>JITTER</span>
                    <span className="text-white">{jitter.toFixed(1)}ms</span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2">
                    <span>PACKET LOSS</span>
                    <span className={packetLoss > 5 ? 'text-red-400' : 'text-slate-400'}>{packetLoss.toFixed(1)}%</span>
                </div>
            </div>

            <div className="mt-2 text-[9px] font-bold py-1 px-2 rounded-sm text-center tracking-tighter uppercase flex items-center justify-center gap-1">
                {isGood ? (
                    <span className="text-green-500">MEC SYNC: STABLE</span>
                ) : (
                    <span className="text-yellow-500">MEC SYNC: PREDICTIVE MODE</span>
                )}
                <Signal className="w-2 h-2 opacity-50" />
            </div>
        </div>
    )
}
