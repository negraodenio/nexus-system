'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
    Zap, Brain, Activity, ShieldCheck, 
    ArrowRight, ChevronRight, Play, CheckCircle,
    Building2, Factory, Wrench, Quote, Mail, Phone,
    ChevronDown, Sparkles, Globe, Wallet
} from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import { AuthButton } from '@/components/auth-button'

export default function NexusLanding() {
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const metrics = [
        { value: "94%", label: "Redução no tempo de treinamento" },
        { value: "67%", label: "Menos erros procedimentais" },
        { value: "3.2x", label: "ROI no primeiro ano" },
        { value: "99.9%", label: "Uptime Biomecânico" }
    ]

    const faqs = [
        {
            q: "O que é Motion as Code?",
            a: "É o paradigma de tratar o movimento humano com o mesmo rigor de um software. Cada 'skill' física é versionada, auditada e corrigida em 'runtime' pelo Nexus Motion OS."
        },
        {
            q: "Como funciona a predição neural?",
            a: "O Nexus utiliza sinais EMG processados via RAG Muscular para antecipar a intenção do movimento até 200ms antes dele ser completado fisicamente."
        },
        {
            q: "O sistema opera offline?",
            a: "Sim. O Nexus Edge utiliza modelos locais (Gemma-2B) para garantir que a inteligência física esteja disponível mesmo em ambientes sem conectividade 5G."
        }
    ]

    return (
        <div className="min-h-screen bg-[#050B14] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050B14]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 text-blue-500">
                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full" />
                            <Brain className="w-full h-full relative z-10" />
                        </div>
                        <span className="text-xl font-black tracking-tight uppercase italic">Nexus<span className="text-blue-500">Motion</span></span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
                        <a href="#features" className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-white transition-colors">How it Works</a>
                        <a href="#metrics" className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-white transition-colors">ROI</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <AuthButton />
                        <Button variant="default" className="bg-blue-600 hover:bg-blue-500 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl" asChild>
                            <Link href="/dashboard">Access OS</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-52 pb-32 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] mb-12 uppercase">
                        <Sparkles className="w-3 h-3" />
                        Physical Intelligence OS · 2026
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black max-w-5xl tracking-tighter leading-[0.9] uppercase italic mb-8">
                        Motion <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">as Code</span>
                    </h1>
                    
                    <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Transforme movimento humano em inteligência programável. O <span className="text-white font-bold">Nexus Motion</span> é a infraestrutura definitiva para versionar, auditar e otimizar a performance física empresarial.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
                        <Button size="lg" className="bg-white text-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl group shadow-2xl shadow-blue-500/10">
                            Get Initial Build
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="outline" size="lg" className="border-white/10 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl backdrop-blur-xl group">
                            <Play className="w-4 h-4 mr-2" />
                            Watch Runtime
                        </Button>
                    </div>
                </motion.div>

                {/* Simulated Terminal / Code Preview */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="mt-24 w-full max-w-4xl relative group"
                >
                     <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                     <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 text-left font-mono text-sm overflow-hidden shadow-2xl">
                        <div className="flex gap-1.5 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-slate-400 space-y-1">
                            <p><span className="text-blue-400">import</span> {"{ MotionRuntime }"} <span className="text-blue-400">from</span> <span className="text-green-400">"@nexus/motion"</span>;</p>
                            <p>&nbsp;</p>
                            <p><span className="text-slate-500">// Initialize Physical SDLC</span></p>
                            <p><span className="text-blue-400">const</span> skill = <span className="text-blue-400">new</span> <span className="text-amber-400">MotionRuntime</span>({"{ skillId: 'SOP-4A' }"});</p>
                            <p>&nbsp;</p>
                            <p>skill.<span className="text-blue-300">attach</span>(intent {"=>"} {"{"}</p>
                            <p>&nbsp;&nbsp;<span className="text-blue-400">if</span> (intent.<span className="text-amber-300">alignment</span> {"<"} <span className="text-purple-400">0.95</span>) {"{"}</p>
                            <p>&nbsp;&nbsp;&nbsp;&nbsp;intent.<span className="text-blue-300">applyPatch</span>(<span className="text-green-400">'haptic-correction'</span>);</p>
                            <p>&nbsp;&nbsp;{"}"}</p>
                            <p>{"}"});</p>
                        </div>
                     </div>
                </motion.div>
            </section>

            {/* FEATURES */}
            <section id="features" className="px-6 py-32 bg-[#03070E] relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-blue-400 text-sm font-black tracking-widest uppercase mb-4 block">Physical Stack</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter">Core Infrastructure</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                        {
                            icon: <Brain className="text-blue-400" />,
                            title: "Neural Prediction",
                            desc: "Antecipe movimentos até 200ms antes da execução física via BCI RAG."
                        },
                        {
                            icon: <Activity className="text-cyan-400" />,
                            title: "Real-time Patching",
                            desc: "Corrija drifts biomecânicos em tempo real com o Motor Correction Engine."
                        },
                        {
                            icon: <Zap className="text-amber-400" />,
                            title: "Motion Generation",
                            desc: "Gere builds de skills procedurais em segundos via Motion GPT v3."
                        },
                        {
                            icon: <ShieldCheck className="text-green-400" />,
                            title: "Immutability",
                            desc: "Auditabilidade de execução física via Biomechanical Ledger (Polygon)."
                        }
                        ].map((f, i) => (
                        <Card key={i} className="hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group p-4">
                            <CardContent className="p-6">
                            <div className="mb-6 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">{f.icon}</div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2 italic">{f.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="px-6 py-32 text-center bg-[#050B14]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-16 uppercase italic">The Logical Flow</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                    {[
                        { title: "Intent Capture", desc: "Monitoramento de EMG e sinais neurais via Neural Intelligence Layer." },
                        { title: "Predict & Optimize", desc: "O motor de IA compara a execução com o Gold Master Build em tempo real." },
                        { title: "Dynamic Correction", desc: "Aplicação imediata de patches motores via feedback háptico e visual." }
                    ].map((step, i) => (
                        <div key={i} className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl group hover:border-blue-500/20 transition-all">
                            <h3 className="text-3xl font-black text-blue-500/30 group-hover:text-blue-500 transition-colors mb-4">0{i + 1}</h3>
                            <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </section>

            {/* METRICS (ROI) */}
            <section id="metrics" className="py-32 px-6 bg-[#03070E] relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-green-400 text-sm font-black tracking-widest uppercase mb-4 block">Proven Performance</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic">Audited Enterprise Metrics</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map((m, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center hover:bg-white/[0.04] hover:border-green-500/30 transition-all">
                                <div className="text-5xl font-black text-green-400 mb-2">{m.value}</div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="px-6 py-32 bg-[#050B14]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-20 uppercase italic">OS Vertical Solutions</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Industrial Runtime", desc: "Padronização de montagem e manutenção em linhas de produção 5G.", icon: <Factory className="w-10 h-10 text-blue-400" /> },
                        { title: "Surge-Ready Healthcare", desc: "Protocolos cirúrgicos versionados e treinados via runtime cinemático.", icon: <Activity className="w-10 h-10 text-cyan-400" /> },
                        { title: "Elite Performance", desc: "Otimização de performance esportiva baseada em Neuromuscular RAG.", icon: <Zap className="w-10 h-10 text-amber-400" /> }
                    ].map((use, i) => (
                        <Card key={i} className="hover:y--2 transition-all cursor-default">
                        <CardContent className="p-10">
                            <div className="mb-6">{use.icon}</div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 italic">{use.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-light">{use.desc}</p>
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-32 px-6 bg-[#03070E]">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-white uppercase italic">Protocol Support</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                <button 
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="font-bold text-white pr-4">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 mt--2">
                                        <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-48 bg-gradient-to-b from-[#050B14] to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                        Deploy Your Physical <br/><span className="text-blue-500">Excellence.</span>
                    </h2>
                    <p className="mt-6 text-slate-400 text-lg mb-12">
                        Be part of the move to the first Physical Intelligence OS. 
                        Alpha testing slots now open for industry leads.
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl shadow-2xl shadow-blue-500/20">
                            Join Beta Protocol
                        </Button>
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 px-6 bg-black border-t border-white/5 text-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-black uppercase tracking-widest text-white">Nexus<span className="text-blue-500">Motion</span></span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">
                        © 2026 Nexus Motion — nexusmotion.pt
                    </div>
                    <div className="flex gap-6">
                        <Globe className="w-5 h-5 text-slate-700 hover:text-white transition-colors cursor-pointer" />
                        <Wallet className="w-5 h-5 text-slate-700 hover:text-white transition-colors cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
