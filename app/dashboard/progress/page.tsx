'use client'

/**
 * @fileoverview Dashboard de Progresso — mostra o histórico de prática
 * do utilizador por skill, com best score, nº de sessões e última prática.
 * Dados de: tabela `learning_progress` (Supabase)
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Clock, Target, TrendingUp, Zap, BarChart2, Play, Activity } from 'lucide-react'
import Link from 'next/link'

interface ProgressEntry {
    id: string
    skill_id: string
    practice_count: number
    best_alignment_score: number
    total_practice_time_seconds: number
    last_practiced_at: string
    skill?: {
        title: string
        category: string | null
        thumbnail_url: string | null
    }
}

function ScoreRing({ score }: { score: number }) {
    const r = 36
    const circ = 2 * Math.PI * r
    const fill = circ - (circ * score) / 100
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <svg width={88} height={88} viewBox="0 0 88 88">
            {/* Track */}
            <circle cx={44} cy={44} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
            {/* Progress */}
            <circle
                cx={44} cy={44} r={r}
                fill="none"
                stroke={color}
                strokeWidth={8}
                strokeDasharray={circ}
                strokeDashoffset={fill}
                strokeLinecap="round"
                transform="rotate(-90 44 44)"
                style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x={44} y={44} textAnchor="middle" dominantBaseline="central"
                fill={color} fontSize={18} fontWeight="bold" fontFamily="monospace">
                {score}
            </text>
        </svg>
    )
}

function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m atrás`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h atrás`
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

export default function ProgressPage() {
    const [entries, setEntries] = useState<ProgressEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setError('Precisas de fazer login para ver o teu progresso.')
                    setLoading(false)
                    return
                }

                const { data, error: fetchErr } = await supabase
                    .from('learning_progress')
                    .select(`
                        *,
                        skill:skills(title, category, thumbnail_url)
                    `)
                    .eq('user_id', user.id)
                    .order('last_practiced_at', { ascending: false })

                if (fetchErr) throw fetchErr
                setEntries(data || [])
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Aggregate stats
    const totalSessions = entries.reduce((s, e) => s + e.practice_count, 0)
    const totalTime = entries.reduce((s, e) => s + e.total_practice_time_seconds, 0)
    const avgScore = entries.length
        ? Math.round(entries.reduce((s, e) => s + e.best_alignment_score, 0) / entries.length)
        : 0
    const masteredCount = entries.filter(e => e.best_alignment_score >= 80).length

    if (error && error.includes('login')) {
        return (
            <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-md w-full relative z-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 rounded-3xl shadow-2xl text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                    
                    <div className="w-20 h-20 bg-slate-900 border border-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse blur" />
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-400">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">System Locked</h2>
                    <p className="text-slate-400 font-light mb-8">
                        Necessita de credenciais ativas para aceder à Brain Network e consultar as métricas operacionais.
                    </p>

                    <Link href="/auth/login" className="relative group w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 shadow-lg cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <span className="relative flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" /> Iniciar Autenticação
                        </span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-300 px-4 py-8 relative">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
            <div className="mb-14 flex items-end justify-between">
                <div>
                    <Link href="/dashboard" className="text-slate-500 text-sm font-bold tracking-widest uppercase hover:text-white transition-colors mb-4 flex items-center gap-2 w-fit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Operational Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
                        Telemetry & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Progresso</span>
                    </h1>
                    <p className="text-slate-400 font-light">Métricas gravadas pela Kinetic Engine em tempo real.</p>
                </div>
                
                {/* Global Status badge */}
                {!loading && entries.length > 0 && (
                    <div className="hidden sm:flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-400 font-mono text-sm uppercase tracking-wider font-bold">Sync Active</span>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { icon: <BarChart2 className="w-6 h-6" />, label: 'Sessões Registadas', value: totalSessions, color: 'blue' },
                    { icon: <Clock className="w-6 h-6" />, label: 'Tempo Tático', value: formatTime(totalTime), color: 'purple' },
                    { icon: <Target className="w-6 h-6" />, label: 'Score Global', value: `${avgScore}%`, color: avgScore >= 80 ? 'emerald' : avgScore >= 50 ? 'amber' : 'red' },
                    { icon: <Trophy className="w-6 h-6" />, label: 'Skills Dominadas', value: `${masteredCount}/${entries.length}`, color: 'indigo' },
                ].map(({ icon, label, value, color }) => (
                    <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mx-10 -my-10 group-hover:bg-${color}-500/20 transition-all`} />
                        <div className={`text-${color}-400 mb-4 bg-${color}-500/10 w-fit p-3 rounded-xl border border-${color}-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            {icon}
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight mb-1">{value}</div>
                        <div className="text-slate-500 text-xs font-bold tracking-wider uppercase">{label}</div>
                    </div>
                ))}
            </div>

            {/* Main content */}
            {loading && (
                <div className="flex items-center justify-center py-32">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin opacity-80" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500 animate-spin" style={{ animationDuration: '2s' }} />
                    </div>
                </div>
            )}

            {error && !error.includes('login') && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                    <p className="text-red-400 font-mono">ERR_FETCH: {error}</p>
                </div>
            )}

            {!loading && !error && entries.length === 0 && (
                <div className="text-center py-32 bg-white/[0.02] border border-white/5 rounded-3xl mt-8">
                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Zap className="w-8 h-8 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Database Vazia</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto font-light">Não existem registos de Kinetic Tracking no seu histórico operativo. Inicie um SOP para gravar dados.</p>
                    <Link href="/skills" className="inline-flex bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)] gap-2">
                        <Play className="w-5 h-5" fill="currentColor" /> Explorar SOPs Disponíveis
                    </Link>
                </div>
            )}

            {!loading && entries.length > 0 && (
                <div className="space-y-6 mt-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" /> Histórico Operacional ({entries.length})
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                        {entries.map((entry) => {
                            const skill = entry.skill as any
                            const scoreColor = entry.best_alignment_score >= 80
                                ? 'emerald'
                                : entry.best_alignment_score >= 50 ? 'amber' : 'red'

                            return (
                                <div key={entry.id}
                                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-white/[0.04] hover:border-slate-700 transition-all group overflow-hidden relative">
                                    
                                    {/* Hover gradient effect inside card */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:via-blue-500/[0.02] transition-colors pointer-events-none" />

                                    {/* Score ring */}
                                    <div className="flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500 ease-in-out">
                                        <div className={`absolute inset-0 bg-${scoreColor}-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        <ScoreRing score={entry.best_alignment_score} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 w-full z-10">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-white font-bold text-xl leading-tight truncate group-hover:text-blue-300 transition-colors">
                                                {skill?.title || 'SOP sem Categoria'}
                                            </h3>
                                            
                                            {/* Badge Mobile/Desktop flex */}
                                            <div className="flex-shrink-0 ml-4 hidden sm:block">
                                                {entry.best_alignment_score >= 80 ? (
                                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                        MASTERED
                                                    </span>
                                                ) : entry.best_alignment_score >= 50 ? (
                                                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full">
                                                        EM CURSO
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full">
                                                        CRITICAL
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="text-slate-400 text-sm font-light">
                                            {skill?.category || 'Geral'} <span className="text-slate-600 px-2">•</span> {entry.practice_count} sessão{entry.practice_count !== 1 ? 'ões' : ''} gravada{entry.practice_count !== 1 ? 's' : ''}
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {formatTime(entry.total_practice_time_seconds)} Tático
                                            </span>
                                            <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800">
                                                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                                                Último Sync: {formatDate(entry.last_practiced_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}
