'use client'

import React, { useState, useEffect } from 'react'
import { 
    ArrowLeft, BarChart3, Users, Eye, TrendingUp, 
    Loader2, Plus, DollarSign, Shield, Activity, 
    Target, Clock, CheckCircle2, AlertCircle, 
    Signal, MapPin, Zap
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface OverviewStats {
    totalSkills: number
    totalViews: number
    totalUsers: number
    avgCompliance: number
    savingsEstimate: number
    mttrReduction: number
}

interface TechnicianStatus {
    id: string
    name: string
    last_action: string
    score: number
    status: 'online' | 'idle' | 'offline'
    location: string
}

const MOCK_TECHS: TechnicianStatus[] = [
    { id: '1', name: 'João Silva', last_action: 'Fiber Splicing', score: 94, status: 'online', location: 'Lisboa - Parque das Nações' },
    { id: '2', name: 'Marta Rebelo', last_action: 'ONT Configuration', score: 88, status: 'online', location: 'Porto - Boavista' },
    { id: '3', name: 'Carlos Santos', last_action: 'Power Supply Check', score: 91, status: 'idle', location: 'Sintra - Algueirão' },
    { id: '4', name: 'Tiago Ferreira', last_action: 'Drop Cable Install', score: 76, status: 'online', location: 'Coimbra - Centro' },
]

export default function EnterpriseDashboard() {
    const [stats, setStats] = useState<OverviewStats | null>({
        totalSkills: 12,
        totalViews: 842,
        totalUsers: 40,
        avgCompliance: 89.4,
        savingsEstimate: 14200,
        mttrReduction: 32
    })
    const [loading, setLoading] = useState(true)
    const [activeTechs, setActiveTechs] = useState<TechnicianStatus[]>(MOCK_TECHS)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Iniciando Nexus Control Center...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white selection:bg-blue-500" style={{ 
            backgroundColor: '#070b14',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.03) 0%, transparent 100%)'
        }}>
            
            {/* ── TOP NAV ── */}
            <header className="border-b border-white/5 bg-[#0a0f1c]/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Nexus Motion</span>
                        </Link>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h1 className="text-sm font-black uppercase tracking-tighter">MEO Pilot Center <span className="text-slate-500 ml-1">v4.2.0</span></h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-4 mr-4">
                            {['Overview', 'Field Agents', 'SOP Library', 'Financials'].map(item => (
                                <button key={item} className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors">
                                    {item}
                                </button>
                            ))}
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                            Download Report
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto p-8 space-y-8">
                
                {/* ── HERO STATS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pilot Compliance', val: `${stats?.avgCompliance}%`, icon: <Shield className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                        { label: 'MTTR Reduction', val: `-${stats?.mttrReduction}%`, icon: <Zap className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                        { label: 'Active Technicians', val: activeTechs.filter(t => t.status === 'online').length.toString(), icon: <Users className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                        { label: 'Estimated Savings', val: `€${stats?.savingsEstimate.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                    ].map((stat, i) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            key={stat.label} className={`p-6 border border-white/5 rounded-2xl ${stat.bg} backdrop-blur-sm group hover:border-white/10 transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg bg-black/40 ${stat.color}`}>{stat.icon}</div>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Real-time</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter mb-1">{stat.val}</div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ── LIVE FIELD MONITOR ── */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="bg-[#0a0f1c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-blue-500" />
                                    <h2 className="text-xs font-black uppercase tracking-widest">Live Field Monitoring</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest">Active Link</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Regional Map Overlay */}
                                <div className="p-8 border-r border-white/5 bg-black/20 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-1">Region: PT-Mainland</div>
                                        <div className="text-xl font-black uppercase tracking-tight">National Coverage</div>
                                    </div>
                                    
                                    <div className="py-8 relative group">
                                        {/* Simple SVG Map of Portugal (Hand-crafted path) */}
                                        <svg viewBox="0 0 200 400" className="w-full max-w-[180px] mx-auto opacity-40 group-hover:opacity-60 transition-opacity">
                                            <path 
                                                d="M50,20 L70,20 L80,50 L90,100 L110,150 L120,200 L110,250 L100,300 L90,350 L50,380 L30,350 L20,300 L30,200 L40,100 L50,50 Z" 
                                                fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500"
                                            />
                                            {/* Live Pings for Lisbon, Porto, Faro */}
                                            <motion.circle cx="105" cy="180" r="4" fill="#3b82f6" animate={{ r: [4, 8, 4], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                                            <motion.circle cx="85" cy="80" r="4" fill="#3b82f6" animate={{ r: [4, 8, 4], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
                                            <motion.circle cx="70" cy="340" r="4" fill="#3b82f6" animate={{ r: [4, 8, 4], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
                                        </svg>

                                        {/* Map Overlay Labels */}
                                        <div className="absolute top-1/4 right-0 text-[8px] font-mono p-2 bg-white/5 border border-white/5 rounded backdrop-blur-sm">
                                            <div className="text-emerald-400 font-bold">PORTO [8]</div>
                                            <div className="text-slate-500">Avg Compliance: 91%</div>
                                        </div>
                                        <div className="absolute top-1/2 left-0 text-[8px] font-mono p-2 bg-white/5 border border-white/5 rounded backdrop-blur-sm translate-x-4">
                                            <div className="text-blue-400 font-bold">LISBOA [24]</div>
                                            <div className="text-slate-500">Avg Compliance: 94%</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-mono uppercase text-slate-500">
                                            <span>Signal Health</span>
                                            <span className="text-emerald-500">99.2%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[99.2%]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                                                <th className="px-6 py-4 font-bold">Technician</th>
                                                <th className="px-6 py-4 font-bold">Current Task</th>
                                                <th className="px-6 py-4 font-bold text-center">Score</th>
                                                <th className="px-6 py-4 font-bold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                        <AnimatePresence>
                                            {activeTechs.map((tech) => (
                                                <motion.tr key={tech.id} 
                                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs">
                                                                {tech.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-xs">{tech.name}</div>
                                                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                    <MapPin className="w-2 h-2" /> {tech.location}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono">
                                                            <Signal className="w-3 h-3 text-blue-400" />
                                                            {tech.last_action}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-[10px] text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 
                                                                Step 4: Torque Validated
                                                            </div>
                                                            <div className="text-[8px] text-slate-600 ml-5 font-mono">14:02:44 GMT</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className={`text-sm font-black ${tech.score > 90 ? 'text-emerald-400' : tech.score > 80 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                            {tech.score}%
                                                        </div>
                                                        <div className="w-20 h-1 bg-white/5 rounded-full mt-1 mx-auto overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${tech.score}%` }} 
                                                                className={`h-full ${tech.score > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                                            tech.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                            tech.status === 'idle' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                            {tech.status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* ── DRILL DOWN GRAPHS (PLACEHOLDER) ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-[#0a0f1c] border border-white/5 rounded-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Error Rate Over Time</h3>
                                </div>
                                <div className="h-40 flex items-end justify-between gap-2 px-2">
                                    {[65, 59, 80, 45, 30, 22, 12].map((v, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-white/5 rounded-t-sm relative group">
                                                <motion.div initial={{ height: 0 }} animate={{ height: `${v}%` }} 
                                                    className="bg-emerald-500/40 group-hover:bg-emerald-500 transition-all rounded-t-sm" />
                                            </div>
                                            <span className="text-[8px] font-mono text-slate-600">Day {i+1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-[#0a0f1c] border border-white/5 rounded-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">SOP Performance Dist.</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Optical Alignment', p: 94 },
                                        { label: 'Cabinet Wiring', p: 82 },
                                        { label: 'Safety Protocol', p: 99 },
                                        { label: 'Client Handover', p: 74 },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-[9px] font-mono uppercase text-slate-400 mb-1">
                                                <span>{item.label}</span>
                                                <span>{item.p}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${item.p}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR: PILOT DETAILS & SOPs ── */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Pilot Box */}
                        <div className="p-8 border border-blue-500/20 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent)' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-2 py-0.5 bg-blue-500 text-black text-[8px] font-black uppercase tracking-widest rounded">Active Pilot</span>
                                    <span className="font-mono text-[10px] text-blue-400">ID: NXM-MEO-01</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">MEO FTTH Pilot Portugal</h3>
                                <div className="text-[10px] font-mono text-slate-400 mb-4 space-y-1">
                                    <p className="text-emerald-500">[x] Fase 3: Gestão de Referências (Nexus Studio)</p>
                                    <p className="text-emerald-500">[x] Criar página `/telecom/studio` para processar o vídeo `meo_demo.mp4`.</p>
                                    <p className="text-emerald-500">[x] Implementar extrator de landmarks via MediaPipe para vídeos.</p>
                                    <p className="text-emerald-500">[x] Salvar o "Golden Template" no sistema para uso no Field App.</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-6">Implementação de validação por IA nas equipas de field maintenance para redução de truck rolls evitáveis.</p>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-slate-500 uppercase tracking-widest">Time Remaining</span>
                                        <span className="text-white font-bold">18 Days</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-slate-500 uppercase tracking-widest">Tickets Verified</span>
                                        <span className="text-white font-bold">1,242</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-slate-500 uppercase tracking-widest">Pilot ROI (Net)</span>
                                        <span className="text-emerald-400 font-bold">+ €8,440.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="p-6 bg-[#0a0f1c] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                Anomalies Detected
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { t: 'High Jitter detected', d: 'Technician Tiago Ferreira - Low score (76%)', time: '2 mins ago' },
                                    { t: 'Safety Bypass Attempted', d: 'Optical SOP - Step 2 skipped in Porto-04', time: '14 mins ago' },
                                ].map((alert, i) => (
                                    <div key={i} className="p-3 border border-amber-500/10 bg-amber-500/5 rounded-xl">
                                        <div className="font-bold text-[10px] text-amber-400 uppercase tracking-tight mb-1">{alert.t}</div>
                                        <div className="text-[9px] text-slate-400 leading-tight mb-2">{alert.d}</div>
                                        <div className="text-[8px] font-mono text-slate-600">{alert.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SOP Library Link */}
                                <Link href="/telecom/studio">
                                    <div className="group p-6 bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all rounded-3xl cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Manage Templates</h3>
                                                <p className="text-[9px] text-slate-500">Video ingestion & Golden Skills</p>
                                            </div>
                                            <Plus className="w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/telecom/field">
                                    <div className="group p-6 bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 transition-all rounded-3xl cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-400">Launch Field App</h3>
                                                <p className="text-[9px] text-slate-500">Technician Assistant AR</p>
                                            </div>
                                            <Zap className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </div>
                                </Link>

                    </div>
                </div>
            </main>
            
            {/* ── FOOTER STATS ── */}
            <footer className="mt-12 p-8 border-t border-white/5">
                <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">Server Latency</div>
                            <div className="text-xs font-bold font-mono">14ms · <span className="text-emerald-500">Stable</span></div>
                        </div>
                        <div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">Model Version</div>
                            <div className="text-xs font-bold font-mono text-blue-400">Prisma V5 (Edge Optimized)</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">© 2026 Nexus Motion · B2B Enterprise OS</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
