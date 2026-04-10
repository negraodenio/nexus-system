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
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import { NexusRealtimeMessage, NEXUS_CHANNELS } from '@/lib/realtime-protocol'
import { toast } from 'sonner'

interface OverviewStats {
    truckRollsAvoided: number
    totalSessions: number
    activeTechnicians: number
    avgAccuracy: number
    financialSavings: number
    roiMultiplier: number
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
        truckRollsAvoided: 142,
        totalSessions: 842,
        activeTechnicians: 40,
        avgAccuracy: 94.2,
        financialSavings: 21300,
        roiMultiplier: 4.8
    })
    const [loading, setLoading] = useState(true)
    const [activeTechs, setActiveTechs] = useState<TechnicianStatus[]>(MOCK_TECHS)
    const [showProvisionModal, setShowProvisionModal] = useState(false)
    const [showSupportModal, setShowSupportModal] = useState(false)
    const [selectedTech, setSelectedTech] = useState<TechnicianStatus | null>(null)
    const [lastToken, setLastToken] = useState<string | null>(null)

    const sendExpertCommand = async (type: NexusRealtimeMessage['type'], message: string) => {
        if (!selectedTech) return;

        try {
            const response = await fetch('/api/realtime/send-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    techId: selectedTech.id,
                    type,
                    payload: {
                        message,
                        timestamp: Date.now(),
                        x: 0.5,
                        y: 0.5
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gateway Rejected Command');
            }

            toast.success(`Command ${type} sent to ${selectedTech.name}`);
        } catch (err: any) {
            console.error("Failed to send command:", err);
            toast.error(`Transmission Failure: ${err.message}`);
        }
    };

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
                            <h1 className="text-sm font-black uppercase tracking-tighter">Nexus Telecom Control Center <span className="text-slate-500 ml-1">v4.2.0</span></h1>
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
                        { label: 'Truck-Rolls Avoided', val: stats?.truckRollsAvoided.toString(), icon: <Activity className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                        { label: 'Financial Savings', val: `€${stats?.financialSavings.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                        { label: 'Risk Mitigation', val: 'A+', icon: <Shield className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                        { label: 'ROI Multiplier', val: `${stats?.roiMultiplier}x`, icon: <Zap className="w-4 h-4" />, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                    ].map((stat, i) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            key={stat.label} className={`p-6 border border-white/5 rounded-2xl ${stat.bg} backdrop-blur-sm group hover:border-white/10 transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg bg-black/40 ${stat.color}`}>{stat.icon}</div>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Real-time ROI</span>
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
                                {/* Regional Map Overlay - Global/Europe Edition */}
                                <div className="p-8 border-r border-white/5 bg-black/20 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-1">Coverage: EU / Global</div>
                                        <div className="text-xl font-black uppercase tracking-tight">Enterprise Infrastructure</div>
                                    </div>
                                    
                                    <div className="py-8 relative group">
                                        {/* Stylized Europe/Global Map SVG */}
                                        <svg viewBox="0 0 400 300" className="w-full max-w-[260px] mx-auto opacity-40 group-hover:opacity-60 transition-opacity">
                                            {/* Stylized Europe Contours */}
                                            <path 
                                                d="M100,200 L120,180 L150,170 L180,180 L200,160 L230,170 L250,190 L270,220 L250,250 L200,260 L150,250 L120,230 Z" 
                                                fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500/50"
                                            />
                                            {/* Live Deployment Pings (EU Hubs) */}
                                            <motion.circle cx="150" cy="180" r="3" fill="#3b82f6" animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                                            <motion.circle cx="180" cy="160" r="3" fill="#3b82f6" animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
                                            <motion.circle cx="210" cy="190" r="3" fill="#3b82f6" animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
                                            <motion.circle cx="240" cy="220" r="3" fill="#3b82f6" animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} />
                                        </svg>

                                        {/* Deployment Labels */}
                                        <div className="absolute top-1/4 right-0 text-[8px] font-mono p-2 bg-white/5 border border-white/5 rounded backdrop-blur-sm">
                                            <div className="text-emerald-400 font-bold">W-EUROPE [142]</div>
                                            <div className="text-slate-500">Avg Compliance: 94.2%</div>
                                        </div>
                                        <div className="absolute bottom-1/4 left-0 text-[8px] font-mono p-2 bg-white/5 border border-white/5 rounded backdrop-blur-sm">
                                            <div className="text-blue-400 font-bold">S-EUROPE [84]</div>
                                            <div className="text-slate-500">Avg Compliance: 91.8%</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-mono uppercase text-slate-500">
                                            <span>Global Ops Health</span>
                                            <span className="text-emerald-500">99.98%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[99.98%]" />
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
                                                <th className="px-6 py-4 font-bold text-center">Support</th>
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
                                                    <td className="px-6 py-5 text-center">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedTech(tech)
                                                                setShowSupportModal(true)
                                                            }}
                                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-lg group/btn transition-all"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-400 group-hover/btn:scale-110" />
                                                        </button>
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
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Field Performance Spread</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Avoided Rework', p: 98 },
                                        { label: 'First-Time Resolution', p: 92 },
                                        { label: 'Procedure Compliance', p: 99 },
                                        { label: 'Time-to-Quality', p: 89 },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-[9px] font-mono uppercase text-slate-400 mb-1">
                                                <span>{item.label}</span>
                                                <span>{item.p}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${item.p}%` }} />
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
                                    <span className="font-mono text-[10px] text-blue-400">ROI TRACKER</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Nexus Field Assistant Pilot</h3>
                                <div className="text-[10px] font-mono text-slate-400 mb-4 space-y-2">
                                    <p className="text-emerald-500 flex items-center gap-2 pr-2">
                                        <CheckCircle2 className="w-3 h-3" /> Redução de 24% em segundas visitas.
                                    </p>
                                    <p className="text-emerald-500 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> Onboarding instantâneo (Smartphone Only).
                                    </p>
                                    <p className="text-emerald-500 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> Validação de 842 tickets em tempo real.
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-6">Foco total em evitar retrabalho técnico e garantir que cada truck-roll termine com um ticket resolvido na primeira tentativa.</p>
                                
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
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                Anomalies Detected
                            </h3>
                            <button 
                                onClick={() => {
                                    setLastToken(`PILOT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
                                    setShowProvisionModal(true)
                                }}
                                className="text-[8px] font-mono text-blue-500 hover:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                            >
                                Provision Tech
                            </button>
                        </div>
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

                                {/* Digital Trust Center */}
                                <div className="p-8 border border-emerald-500/20 rounded-3xl relative overflow-hidden bg-emerald-500/[0.02]">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest">Digital Trust Center</span>
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tighter mb-4">Audit Authority</h4>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                            <span>Integrity Score</span>
                                            <span className="text-emerald-400">99.8%</span>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                            <span>Sessions Insured</span>
                                            <span className="text-white">1,242</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toast.success("Generating Audit Protocol... Session UUIDs hashed for insurance.")}
                                        className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 font-black text-[9px] uppercase tracking-widest rounded-xl border border-emerald-500/20 transition-all"
                                    >
                                        Download Compliance PDF
                                    </button>
                                </div>

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
            {/* Provisioning Modal */}
            <AnimatePresence>
                {showProvisionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProvisionModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#0a0f1c] border border-blue-500/30 rounded-3xl p-8 overflow-hidden">
                            
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={() => setShowProvisionModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5 rotate-90" />
                                </button>
                            </div>

                            <div className="text-center space-y-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl inline-block">
                                    <QrCode className="w-8 h-8 text-blue-500" />
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Provision Pilot Access</h2>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Telecom Enterprise OS</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl inline-block mx-auto mb-4 border-8 border-white/5">
                                    {lastToken && (
                                        <QRCodeSVG 
                                            value={`https://www.nexusmotion.pt/telecom/field?token=${lastToken}`} 
                                            size={180}
                                            level="L"
                                            includeMargin={false}
                                        />
                                    )}
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Access Token (Secure)</div>
                                    <div className="font-mono text-xs text-blue-400 font-bold">{lastToken}</div>
                                </div>

                                <p className="text-[9px] text-slate-500 leading-relaxed px-4">
                                    Envia este código ao técnico para desbloquear o **Field Assistant AR**. 
                                    Este acesso é **persistente** e válido durante todo o período do piloto.
                                </p>

                                <button onClick={() => setShowProvisionModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                                    Acknowledge & Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Support Override Modal */}
            <AnimatePresence>
                {showSupportModal && selectedTech && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-white">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowSupportModal(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-6xl h-[85vh] bg-[#0a0f1c] border border-blue-500/20 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.1)]">
                            
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-lg">
                                        {selectedTech.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Expert-in-the-Loop Override</div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedTech.name} · <span className="text-slate-500">{selectedTech.location}</span></h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Trust</div>
                                        <div className="text-xl font-black text-emerald-500">{selectedTech.score}% compliance</div>
                                    </div>
                                    <button onClick={() => setShowSupportModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                        <ArrowLeft className="w-6 h-6 rotate-90" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Left: Real-time Stream Emulator */}
                                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                                    {/* Simulated Camera Feed Overlay */}
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen pointer-events-none" />
                                    <div className="w-full h-full bg-[#05080f] flex items-center justify-center relative">
                                        <video className="w-full h-full object-cover opacity-60" autoPlay loop muted playsInline shadow-inner="true">
                                            <source src="/nexus_demo.mp4" type="video/mp4" />
                                        </video>
                                        
                                        {/* EXPERT CANVAS LAYER */}
                                        <div className="absolute inset-0 z-20 cursor-crosshair">
                                            {/* Simulated AR Glyphs */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500 rounded-full animate-pulse flex items-center justify-center">
                                                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-500/30">L2 Focus Zone</div>
                                            </div>
                                            <div className="absolute top-[40%] left-[30%] text-blue-400 flex flex-col items-center animate-bounce">
                                                <Target className="w-8 h-8" />
                                                <div className="text-[8px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded mt-1">Check PON LED</div>
                                            </div>
                                        </div>

                                        {/* HUD OVERLAY SIMULATION */}
                                        <div className="absolute top-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                                            <div className="text-[8px] font-black text-white/40 uppercase mb-2">Technician HUD View</div>
                                            <div className="space-y-1">
                                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[94%]" />
                                                </div>
                                                <div className="text-[10px] font-black text-emerald-400 font-mono tracking-widest uppercase">Validated</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Controls */}
                                <div className="w-80 border-l border-white/5 bg-[#0a0f1c] p-8 space-y-8 overflow-y-auto">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Expert Intervention Tools</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => sendExpertCommand('HIGHLIGHT', 'L2 focus requested at center')}
                                                className="flex flex-col items-center gap-3 p-5 bg-blue-500/10 hover:bg-blue-500/20 rounded-3xl border border-blue-500/20 transition-all text-blue-400 group"
                                            >
                                                <Target className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Pin Target</span>
                                            </button>
                                            <button 
                                                onClick={() => sendExpertCommand('WARNING', 'Intervention required: high risk detected')}
                                                className="flex flex-col items-center gap-3 p-5 bg-amber-500/10 hover:bg-amber-500/20 rounded-3xl border border-amber-500/20 transition-all text-amber-500 group"
                                            >
                                                <AlertCircle className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Warning</span>
                                            </button>
                                            <button 
                                                onClick={() => sendExpertCommand('APPROVE', 'Visual validation complete')}
                                                className="flex flex-col items-center gap-3 p-5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-3xl border border-emerald-500/20 transition-all text-emerald-400 group"
                                            >
                                                <CheckCircle2 className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Approve</span>
                                            </button>
                                            <button 
                                                onClick={() => sendExpertCommand('OVERRIDE', 'L2 Force Override: Cease current activity')}
                                                className="flex flex-col items-center gap-3 p-5 bg-purple-500/10 hover:bg-purple-500/20 rounded-3xl border border-purple-500/20 transition-all text-purple-400 group"
                                            >
                                                <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Override</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-blue-400" />
                                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">L2 Protocol Active</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic px-1">A projetar anotações AR no smartphone do técnico. Esta intervenção será anexada ao relatório de conformidade auditado.</p>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <button onClick={() => setShowSupportModal(false)} className="w-full py-5 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-red-500/20 transition-all active:scale-95">
                                            Terminate Override
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
        </div>
    )
}
