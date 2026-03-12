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
        <div className="min-h-screen bg-[#101822] text-white p-6 font-sans">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/progress" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/app" className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-purple-500/20 transition-colors hidden sm:block">
                        Cognitive Adapter
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        The Physical Graph
                    </h1>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-center gap-4">
                <button
                    onClick={() => setMode('search')}
                    className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${mode === 'search'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <Search className="w-5 h-5" />
                    AI Search
                </button>
                <button
                    onClick={() => setMode('record')}
                    className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${mode === 'record'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <Video className="w-5 h-5" />
                    Recorder
                </button>
                <button
                    onClick={() => setMode('play')}
                    className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${mode === 'play'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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
                        <div className="bg-[#1c242f] border border-slate-700 p-6 rounded-xl">
                            <h2 className="text-xl font-semibold mb-2 text-center">🔍 Busca Inteligente de Skills</h2>
                            <p className="text-slate-400 text-sm text-center mb-6">
                                Descreva o que você quer aprender. A IA encontra skills similares.
                            </p>
                            <SkillSearch onSelectSkill={handleSelectSkill} />
                        </div>
                    </div>
                )}

                {mode === 'record' && (
                    <div className="space-y-4">
                        <div className="bg-[#1c242f] border border-slate-700 p-4 rounded-xl text-center">
                            <h2 className="text-xl font-semibold mb-2">📹 Capture a New Skill</h2>
                            <p className="text-slate-400 text-sm">
                                Ensure your hand is visible. This will record skeletal data to train the Physical Graph.
                            </p>
                        </div>
                        <SkillRecorder />
                    </div>
                )}

                {mode === 'play' && (
                    <div className="space-y-4">
                        <div className="bg-[#1c242f] border border-slate-700 p-4 rounded-xl">
                            <h2 className="text-xl font-semibold mb-4 text-center">▶️ Replay a Skill Asset</h2>
                            <div className="flex gap-2 max-w-md mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter Skill ID (UUID)..."
                                    value={skillIdToPlay}
                                    onChange={(e) => setSkillIdToPlay(e.target.value)}
                                    className="flex-1 bg-[#151c26] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {skillIdToPlay ? (
                            <SkillPlayer skillId={skillIdToPlay} />
                        ) : (
                            <div className="h-96 bg-black/40 rounded-2xl flex items-center justify-center border border-dashed border-slate-700">
                                <span className="text-slate-500">Use AI Search or enter a Skill ID to visualize</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
