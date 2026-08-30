'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Sparkles, Brain, Clock, CheckCircle, AlertCircle, RotateCcw, History, Settings, Camera, X, Thermometer, Zap, MessageSquareQuote, ShieldAlert, Target, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import MermaidRenderer from './mermaid-renderer'
import RealityCanvas from './reality-canvas'
import { SkillPlayer } from './skill-player'
import { GhostHandPractice } from './ghost-hand-practice'
import ContextSelector, { AVAILABLE_CONTEXTS } from './context-selector'
import { AuthButton } from './auth-button'
import { AudienceType, VisualType, CacheSource, RealityOverlay } from '@/lib/db-types'
import { ModelId } from '@/lib/ai-client'

interface AnalogyResponse {
    source: 'exact' | 'rag' | 'generated'
    detected_mode?: string
    analogy: string
    visual: {
        type: VisualType
        code?: string
        items?: Array<{ label: string, value: string }>
        steps?: Array<{ title: string, description: string }>
        overlay?: RealityOverlay
    }
    coreIdeas: string[]
    limits: string[]
    skill_query?: string | null
}

interface HistoryItem {
    concept: string
    audience: string
    timestamp: number
    understood: boolean
}

const ComparisonRenderer = ({ items }: { items: Array<{ label: string, value: string }> }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
            <div key={idx} className="border border-white/10 rounded-2xl p-4 bg-[#111827]">
                <h4 className="font-bold text-blue-300 mb-2">{item.label}</h4>
                <p className="text-sm text-slate-300">{item.value}</p>
            </div>
        ))}
    </div>
)

const TimelineRenderer = ({ steps }: { steps: Array<{ title: string, description: string }> }) => (
    <div className="space-y-4">
        {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                    </div>
                    {idx < steps.length - 1 && <div className="w-0.5 flex-1 bg-blue-500/30 my-2" />}
                </div>
                <div className="flex-1 pb-8">
                    <h4 className="font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-300">{step.description}</p>
                </div>
            </div>
        ))}
    </div>
)

export default function Nexus() {
    const [concept, setConcept] = useState('')
    const [image, setImage] = useState<string | null>(null)
    const [selectedContext, setSelectedContext] = useState(AVAILABLE_CONTEXTS[0])
    const [model, setModel] = useState<ModelId>('gpt-4o')
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<AnalogyResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [matchedSkillId, setMatchedSkillId] = useState<string | null>(null)
    const [matchedOkemId, setMatchedOkemId] = useState<string | null>(null)
    const [showPractice, setShowPractice] = useState(false) // NEW: State for interactive practice

    // Metrics
    const [startTime, setStartTime] = useState<number | null>(null)
    const [understood, setUnderstood] = useState(false)

    const generateAnalogy = async () => {
        if (!concept.trim() && !image) {
            setError('Digite um conceito ou envie uma imagem')
            return
        }

            setLoading(true)
            setError(null)
            setResponse(null)
            setUnderstood(false)
            setMatchedSkillId(null)
            setMatchedOkemId(null)
            setStartTime(Date.now())

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept,
                    audience: selectedContext.name, // Legacy fallback
                    contextId: selectedContext.id,
                    systemPrompt: selectedContext.system_prompt,
                    visualMode: selectedContext.visual_mode,
                    model,
                    image
                }),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Falha na geração')
            }

            const data = await res.json()
            setResponse(data)

            // Semantic Search for matching skill if AI suggested one (Ghost Hand Demo mapping)
            if (data.skill_query) {
                try {
                    const skillRes = await fetch(`/api/skills/semantic-search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: data.skill_query })
                    })
                    const skillData = await skillRes.json()
                    if (skillData.results?.length > 0) {
                        const skillId = skillData.results[0].id
                        setMatchedSkillId(skillId)

                        // Look up OKEM for this skill
                        try {
                            const { supabase } = await import('@/lib/supabase')
                            const { data: okemData } = await supabase
                                .from('okems' as any)
                                .select('id')
                                .eq('skill_id', skillId)
                                .limit(1)
                                .maybeSingle()
                            if (okemData) {
                                setMatchedOkemId((okemData as any).id)
                            }
                        } catch {
                            // OKEM not found — legacy skill, no step mode
                        }
                    }
                } catch (skillErr) {
                    console.error('Semantic Skill search failed:', skillErr)
                }
            }

            setHistory(prev => [{
                concept: concept || 'Análise de Imagem',
                audience: selectedContext.name,
                timestamp: Date.now(),
                understood: false
            }, ...prev])

        } catch (err: any) {
            setError(err.message || 'Erro ao gerar analogia. Tente novamente.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnderstood = async () => {
        if (startTime) {
            const timeToUnderstand = Math.floor((Date.now() - startTime) / 1000)

            try {
                await fetch('/api/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        concept,
                        audience: selectedContext.name,
                        timeToUnderstand,
                        understood: true
                    }),
                })
            } catch (e) {
                console.error('Failed to send metrics', e)
            }

            setHistory(prev => prev.map((item, idx) =>
                idx === 0 ? { ...item, understood: true } : item
            ))
        }
        setUnderstood(true)
    }

    const renderVisual = () => {
        if (!response?.visual) return null

        switch (response.visual.type) {
            case 'mermaid':
                return <MermaidRenderer code={response.visual.code || ''} />
            case 'comparison':
                return <ComparisonRenderer items={response.visual.items || []} />
            case 'timeline':
                return <TimelineRenderer steps={response.visual.steps || []} />
            case 'reality':
                if (!image || !response.visual.overlay) return null
                return (
                    <div className="space-y-8">
                        {/* 1. The Overlay */}
                        <RealityCanvas image={image} overlay={response.visual.overlay} />

                        {/* 2. Hybrid Mode: If steps are present (e.g. Manual), show them too */}
                        {response.visual.steps && response.visual.steps.length > 0 && (
                            <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 mt-6">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    Procedimento (Manual Detectado)
                                </h4>
                                <TimelineRenderer steps={response.visual.steps} />
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0F1A] text-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    {/* Top Navigation */}
                    <div className="absolute top-4 right-4 flex items-center gap-4">
                        <a href="/dashboard/progress" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors">Dashboard</a>
                        <a href="/skills" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                            <span>📹</span> Skills
                        </a>
                        <AuthButton />
                        <a
                            href="/skills"
                            className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse"
                        >
                            🚀 EXPLORAR SOPS
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Brain className="w-12 h-12 text-blue-500" />
                        <h1 className="text-5xl font-bold text-white tracking-tight">Nexus</h1>
                    </div>
                    <p className="text-xl text-slate-400">Adaptador Cognitivo · Transforme complexidade em clareza</p>
                </div>

                {/* Input Section */}
                <div className="bg-[#111827] rounded-3xl shadow-xl p-8 mb-8 border border-white/10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Qual conceito você quer entender?
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    placeholder={image ? "Descreva o que explicar na imagem (opcional)..." : "Ex: Como funciona a internet, Teoria da Relatividade..."}
                                    className="w-full px-5 py-4 pr-12 text-lg bg-[#0A0F1A] border border-white/10 rounded-xl focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-slate-500 text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && generateAnalogy()}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <label className="cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center text-slate-400 hover:text-blue-400" title="Adicionar Imagem">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const reader = new FileReader()
                                                    reader.onloadend = () => setImage(reader.result as string)
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                        />
                                        <Camera className="w-6 h-6" />
                                    </label>
                                </div>
                            </div>

                            {image && (
                                <div className="mt-3 relative inline-block animate-in fade-in zoom-in-95 duration-200">
                                    <img src={image} alt="Preview" className="h-32 w-auto rounded-2xl border border-white/10 shadow-md object-cover" />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition hover:scale-110"
                                        title="Remover imagem"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                                    <span>Quem vai explicar? (Contexto)</span>
                                    {selectedContext.visual_mode === 'reality' && (
                                        <span className="text-xs bg-[#2563EB]/20 text-blue-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> AR Ativado
                                        </span>
                                    )}
                                </label>
                                <ContextSelector selectedId={selectedContext.id} onSelect={setSelectedContext} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Modelo de IA (2025 Gen)
                                </label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value as ModelId)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0A0F1A] text-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none font-medium"
                                >
                                    <option value="gpt-4o">GPT-4o (OpenAI — Raciocínio Superior)</option>
                                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic — Visão Perfeita)</option>
                                    <option value="gemini-2-flash">Gemini 2.0 Flash (Google — Multimodal Rápido)</option>
                                    <option value="deepseek-chat">DeepSeek Chat (Open Source)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateAnalogy}
                            disabled={loading || (!concept.trim() && !image)}
                            className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-[#2563EB]/30 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Gerando explicação...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                                    {image && selectedContext.visual_mode === 'reality' ? 'Analisar Realidade' : 'Gerar Explicação'}
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-start gap-3 animate-in shake">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-300 font-medium">Ops! Ocorreu um erro.</p>
                                <p className="text-red-400 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Response Section */}
                {response && (
                    <div className="bg-[#111827] rounded-3xl shadow-xl p-8 mb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/10">
                        {/* Cache Badge */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${response.source === 'exact' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                    response.source === 'rag' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                    }`}>
                                    {response.source === 'exact' ? '⚡ Memória' :
                                        response.source === 'rag' ? '🔍 Similar' :
                                            '✨ Nova Criação'}
                                </span>
                                {startTime && !understood && (
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4" />
                                        {Math.floor((Date.now() - startTime) / 1000)}s
                                    </span>
                                )}
                            </div>

                            {/* Detected Mode Badge (Prisma) */}
                            {response.detected_mode && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#2563EB] text-white rounded-full text-sm font-bold shadow-sm animate-pulse">
                                    <Sparkles className="w-4 h-4" />
                                    Modo Ativado: {response.detected_mode}
                                </div>
                            )}
                        </div>

                        {/* Analogia */}
                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-6 h-6 text-blue-400" />
                                Análise
                            </h3>
                            <p className="text-lg text-slate-300 leading-relaxed bg-[#0A0F1A] p-6 rounded-2xl border border-white/10">
                                {response.analogy}
                            </p>
                        </div>

                        {/* Core Ideas */}
                        {response.coreIdeas && (
                            <div className="bg-[#0A0F1A] rounded-2xl p-6 border border-white/10">
                                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    Ideias Centrais
                                </h4>
                                <ul className="grid gap-3">
                                    {response.coreIdeas.map((idea, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-[#111827] p-3 rounded-xl border border-white/10">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB]/20 text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span className="text-slate-300">{idea}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Visual */}
                        <div className="border-t border-white/10 pt-8">
                            <h4 className="font-semibold text-white mb-4">Visualização</h4>
                            {renderVisual()}
                        </div>

                        {/* Ghost Hand - Physical Skill Demo */}
                        {matchedSkillId && (
                            <div className="bg-[#0A0F1A] rounded-2xl p-6 border border-[#2563EB]/30 mt-8 relative overflow-hidden group">
                                {/* Sensor Fusion Overlay (Mocks for APEX) */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md animate-pulse">
                                        <Thermometer className="w-4 h-4 text-red-400" />
                                        <span className="text-xs font-mono text-red-200">FLIR: 42.5°C</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md">
                                        <Zap className="w-4 h-4 text-cyan-400" />
                                        <span className="text-xs font-mono text-cyan-200">Torque: 45Nm</span>
                                    </div>
                                </div>

                                <h4 className="text-blue-400 font-bold mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        Physical Intelligence: Execution Record
                                    </span>
                                    <button 
                                        onClick={() => setShowPractice(true)}
                                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
                                    >
                                        <Target className="w-4 h-4" />
                                        Calibration (Live AR)
                                    </button>
                                </h4>
                                
                                <div className="mb-6">
                                    <SkillPlayer skillId={matchedSkillId} />
                                </div>

                                {/* Physical Copilot Proactive Insight */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-2xl p-4 flex gap-4 items-start"
                                >
                                    <div className="p-2 bg-[#2563EB] rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.5)] flex-shrink-0">
                                        <MessageSquareQuote className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">Copilot Físico</span>
                                            <span className="text-[10px] text-slate-500 font-mono italic">Contexto: Sensor Fusion (Torque + Vision)</span>
                                        </div>
                                        <p className="text-sm text-blue-100 leading-relaxed italic">
                                            "Detetei resistência anormal no passo 3. O torque subiu para 45Nm prematuramente. Sugiro verificar a rosca antes de continuar para evitar danos permanentes."
                                        </p>
                                        <div className="mt-2 flex gap-3">
                                            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300">Aceitar Sugestão</button>
                                            <button className="text-[10px] font-bold text-slate-500 hover:text-slate-400">Ignorar</button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {showPractice && matchedSkillId && (
                            <GhostHandPractice skillId={matchedSkillId} okemId={matchedOkemId ?? undefined} onClose={() => setShowPractice(false)} />
                        )}

                        {/* Limits */}
                        {response.limits && (
                            <div className="bg-[#0A0F1A] rounded-2xl p-6 border border-orange-500/20">
                                <h4 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Pontos de Atenção
                                </h4>
                                <ul className="space-y-2">
                                    {response.limits.map((limit, idx) => (
                                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                            {limit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {!understood ? (
                                <button
                                    onClick={handleUnderstood}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Entendi!
                                </button>
                            ) : (
                                <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-center gap-2 text-green-400 font-bold">
                                    <CheckCircle className="w-6 h-6" />
                                    Registrado com sucesso!
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setResponse(null)
                                    setConcept('')
                                    setImage(null)
                                    setUnderstood(false)
                                }}
                                className="flex-1 border border-white/10 text-slate-300 py-3 rounded-xl font-bold hover:bg-white/5 transition flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Nova Explicação
                            </button>
                        </div>
                    </div>
                )
                }

                {/* History Toggle */}
                {
                    history.length > 0 && (
                        <div className="text-center pb-8">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 mx-auto px-4 py-2 hover:bg-white/5 rounded-lg transition"
                            >
                                <History className="w-4 h-4" />
                                {showHistory ? 'Ocultar' : 'Ver'} Histórico ({history.length})
                            </button>

                            {showHistory && (
                                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-[#111827] rounded-2xl border border-white/10 hover:bg-[#1a2235] transition"
                                        >
                                            <div className="text-left">
                                                <p className="font-bold text-white">{item.concept}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-medium">
                                                        {item.audience}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(item.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.understood && (
                                                <div className="bg-green-500/10 p-1.5 rounded-full">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    )
}
