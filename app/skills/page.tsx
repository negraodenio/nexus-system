'use client'

import React, { useState } from 'react'
import { SkillRecorder } from '@/components/skill-recorder'
import { SkillPlayer } from '@/components/skill-player'
import { SkillSearch } from '@/components/skill-search'
import { ArrowLeft, Database, Play, Video, Search } from 'lucide-react'
import Link from 'next/link'

export default function SkillsPage() {
    const [mode, setMode] = useState<'record' | 'play' | 'search'>('search')
    const [skillIdToPlay, setSkillIdToPlay] = useState<string>('')

    const handleSelectSkill = (skillId: string) => {
        setSkillIdToPlay(skillId)
        setMode('play')
    }

    // Auto-play from URL params
    React.useEffect(() => {
        // Simple client-side search param check
        const params = new URLSearchParams(window.location.search)
        const idFromUrl = params.get('skillId')
        if (idFromUrl) {
            setSkillIdToPlay(idFromUrl)
            setMode('play')
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#0A0F1A] text-white p-6 font-sans">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/progress" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/app" className="px-3 py-1 bg-[#2563EB]/10 text-[#38BDF8] border border-[#2563EB]/20 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2563EB]/20 transition-colors hidden sm:block">
                        Cognitive Adapter
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Database className="w-6 h-6 text-[#38BDF8]" />
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">
                        The Physical Graph
                    </h1>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-center gap-4">
                <button
                    onClick={() => setMode('search')}
                    className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all ${mode === 'search'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 scale-105'
                        : 'bg-[#111827] text-slate-400 hover:bg-[#1a2332] border border-white/10'
                        }`}
                >
                    <Search className="w-5 h-5" />
                    AI Search
                </button>
                <button
                    onClick={() => setMode('record')}
                    className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all ${mode === 'record'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30 scale-105'
                        : 'bg-[#111827] text-slate-400 hover:bg-[#1a2332] border border-white/10'
                        }`}
                >
                    <Video className="w-5 h-5" />
                    Recorder
                </button>
                <button
                    onClick={() => setMode('play')}
                    className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all ${mode === 'play'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 scale-105'
                        : 'bg-[#111827] text-slate-400 hover:bg-[#1a2332] border border-white/10'
                        }`}
                >
                    <Play className="w-5 h-5" />
                    Player
                </button>
            </div>

            {/* Main Stage */}
            <div className="max-w-4xl mx-auto">
                {mode === 'search' && (
                    <div className="space-y-4">
                        <div className="bg-[#111827] border border-white/10 p-6 rounded-3xl shadow-lg shadow-black/20">
                            <h2 className="text-xl font-black mb-2 text-center">Busca Inteligente de Skills</h2>
                            <p className="text-slate-400 text-sm text-center mb-6">
                                Descreva o que você quer aprender. A IA encontra skills similares.
                            </p>
                            <SkillSearch onSelectSkill={handleSelectSkill} />
                        </div>
                    </div>
                )}

                {mode === 'record' && (
                    <div className="space-y-4">
                        <div className="bg-[#111827] border border-white/10 p-4 rounded-3xl text-center shadow-lg shadow-black/20">
                            <h2 className="text-xl font-black mb-2">Capture a New Skill</h2>
                            <p className="text-slate-400 text-sm">
                                Ensure your hand is visible. This will record skeletal data to train the Physical Graph.
                            </p>
                        </div>
                        <SkillRecorder />
                    </div>
                )}

                {mode === 'play' && (
                    <div className="space-y-4">
                        <div className="bg-[#111827] border border-white/10 p-4 rounded-3xl shadow-lg shadow-black/20">
                            <h2 className="text-xl font-black mb-4 text-center">Replay a Skill Asset</h2>
                            <div className="flex gap-2 max-w-md mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter Skill ID (UUID)..."
                                    value={skillIdToPlay}
                                    onChange={(e) => setSkillIdToPlay(e.target.value)}
                                    className="flex-1 bg-[#0A0F1A] border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                                />
                            </div>
                        </div>

                        {skillIdToPlay ? (
                            <SkillPlayer skillId={skillIdToPlay} />
                        ) : (
                            <div className="h-96 bg-black/40 rounded-3xl flex items-center justify-center border border-dashed border-white/10">
                                <span className="text-slate-500">Use AI Search or enter a Skill ID to visualize</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
