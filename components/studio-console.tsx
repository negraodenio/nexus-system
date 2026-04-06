'use client'

import React, { useState } from 'react'
import { Sparkles, Terminal, Cpu, Database, Save, Play } from 'lucide-react'

interface StudioConsoleProps {
    onGenerate: (prompt: string) => void
    onSave: () => void
    isGenerating: boolean
    recipe: any | null
}

export function StudioConsole({ onGenerate, onSave, isGenerating, recipe }: StudioConsoleProps) {
    const [prompt, setPrompt] = useState('')

    return (
        <div className="flex flex-col h-full bg-[#101822]/80 backdrop-blur-xl border-l border-white/5 p-6 min-w-[380px] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Nexus Studio</h2>
                    <p className="text-[10px] text-amber-500/70 font-mono uppercase tracking-[0.2em]">Motion GPT V3.0</p>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Prompt Area */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Motion Architecture Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the movement (e.g., 'A precise circular motion for surgical suturing with slight wrist rotation')..."
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none font-medium leading-relaxed"
                    />
                </div>

                {/* Generator Action */}
                <button
                    onClick={() => onGenerate(prompt)}
                    disabled={isGenerating || !prompt}
                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                        isGenerating 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98]'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                            Architecting Motion...
                        </>
                    ) : (
                        <>
                            <Cpu className="w-5 h-5" />
                            Generate Cinematic Skill
                        </>
                    )}
                </button>

                {/* Recipe Display */}
                {recipe && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-black/60 rounded-xl p-4 border border-white/5 space-y-2">
                            <h3 className="text-amber-400 font-bold text-xs uppercase">{recipe.skillName}</h3>
                            <p className="text-[11px] text-slate-400 italic leading-normal">
                                "{recipe.reasoning}"
                            </p>
                            <div className="flex gap-4 pt-2 border-t border-white/5 mt-2">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500">Frames</div>
                                    <div className="text-xs font-mono text-white">{recipe.duration}</div>
                                </div>
                                <div className="text-center border-l border-white/5 pl-4">
                                    <div className="text-[10px] text-slate-500">Model</div>
                                    <div className="text-xs font-mono text-white">M2.7-GPT</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSave}
                            className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Bake to Marketplace
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Meta */}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-600">
                <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    RAG-FRAGMENTS: ONLINE
                </div>
                <span>LATENCY: 1.4s</span>
            </div>
        </div>
    )
}
