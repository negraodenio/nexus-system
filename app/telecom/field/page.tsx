'use client'

import React from 'react'
import { FieldAssistant } from '@/components/telecom/field-assistant'
import { motion } from 'framer-motion'
import { Signal, User, Battery, Clock } from 'lucide-react'

export default function FieldPage() {
    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
            
            {/* ── TOP STATUS BAR (MIMIC NATIVE) ── */}
            <div className="bg-black px-6 py-2 flex justify-between items-end h-10 select-none">
                <div className="text-[10px] font-bold text-white/40 font-mono tracking-tighter">14:02</div>
                <div className="flex items-center gap-3 text-white/40">
                    <div className="flex gap-0.5 items-end h-2.5">
                        <div className="w-0.5 h-1 bg-white/40 rounded-full" />
                        <div className="w-0.5 h-1.5 bg-white/40 rounded-full" />
                        <div className="w-0.5 h-2 bg-white/40 rounded-full" />
                        <div className="w-0.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]" />
                    </div>
                    <Battery className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* ── MAIN ANALYTIC HUD ── */}
            <header className="bg-[#0a0f1c] border-b border-white/5 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center border border-white/10 shadow-lg">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-none mb-1">Authenticated Technician</h1>
                        <p className="text-sm font-bold text-white tracking-tight">João Silva · <span className="text-blue-400">#4022</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1 leading-none">Session Time</div>
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 justify-end">
                        <Clock className="w-3 h-3 text-blue-500" /> 00:24:12
                    </div>
                </div>
            </header>

            {/* ── REAL-TIME AI STAGE ── */}
            <div className="flex-1 relative bg-black">
                <FieldAssistant pilotId="MEO-PILOT-01" />
            </div>

            {/* ── OFFLINE SYNC NOTIFICATION ── */}
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                    <div className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap">Edge AI Sync: Optimized</span>
                </div>
            </motion.div>

        </div>
    )
}
