'use client'

import { AuthButton } from '@/components/auth-button'
import { Brain, Sparkles, Play, Zap, Users, Shield, ArrowRight, CheckCircle, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
    return (
        <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans overflow-x-hidden selection:bg-blue-500/30">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050B14]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050B14]/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors">
                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-400/40 transition-all duration-500" />
                            <Brain className="w-full h-full relative z-10" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-white">Nexus</span>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
                        <a href="#problem" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors">O Problema</a>
                        <a href="#solution" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors">A Solução</a>
                        <a href="#features" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Enterprise</a>
                        <a href="#pricing" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Planos</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <AuthButton />
                        </div>
                        <a
                            href="/skills?skillId=3bdb03d9-9322-46be-a825-03b9a6c3c4f0"
                            className="relative group bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-[1.02] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity animate-pulse" />
                            <div className="relative flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                <span>DEMO MODE</span>
                            </div>
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 lg:px-8">
                {/* Background Grid & Glows */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide mb-8 hover:bg-blue-500/20 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        NEXUS ENTERPRISE BETA
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black leading-[1.1] tracking-tighter mb-8 text-white">
                        Conhecimento Físico, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Digitalizado.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        O primeiro Sistema Operacional B2B para treinar a sua força de trabalho tática. 
                        Transformamos <strong className="text-slate-200 font-semibold">procedimentos manuais críticos</strong> em guias holográficos interativos guiados por IA.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#pricing" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-colors">
                            Ver Planos Comerciais
                            <ArrowRight className="w-5 h-5" />
                        </a>
                        <Link href="/app" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors group">
                            Agendar Apresentação
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Video/App Showcase Mockup */}
                <div className="w-full max-w-6xl mx-auto mt-20 relative z-20 perspective-1000">
                    <div className="rounded-2xl border border-white/10 bg-[#0A111X] p-2 shadow-2xl shadow-blue-500/10 transform-gpu rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                        <div className="aspect-video rounded-xl bg-slate-900 border border-white/5 overflow-hidden relative group">
                            {/* Realistic Video Placeholder from Unsplash (Tech/Engineering) */}
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-1000"
                                src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
                            />
                            
                            {/* UI Overlay Simulation */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent pointer-events-none" />
                            
                            {/* Tracking Data Overlay (Simulating Kinetic Engine) */}
                            <div className="absolute top-6 right-6 flex flex-col gap-2 scale-75 sm:scale-100 origin-top-right">
                                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-green-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kinetic Engine</span>
                                        <span className="text-white font-mono text-sm">Tracking: Active</span>
                                    </div>
                                </div>
                                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center justify-between gap-6">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Alignment</span>
                                    <span className="text-green-400 font-mono text-lg font-bold">92%</span>
                                </div>
                            </div>

                            {/* Center Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a href="/skills?skillId=3bdb03d9-9322-46be-a825-03b9a6c3c4f0" className="w-20 h-20 rounded-full bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-110 hover:bg-blue-600/50 transition-all cursor-pointer group/btn">
                                    <Play className="w-8 h-8 text-white ml-1 group-hover/btn:text-blue-100" fill="currentColor" />
                                </a>
                            </div>

                            {/* Bottom Info */}
                            <div className="absolute bottom-6 left-6 text-left z-20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                                        Instalação de Fibra
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-md">Guia de Alinhamento de Fusão</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Prop: Anti-Chatbot */}
            <section id="solution" className="py-32 px-4 lg:px-8 bg-[#03070E] relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
                    <span className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4 block">FIM DA ERA CHATBOT</span>
                    <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white tracking-tight">O ChatGPT gera texto.<br/>A IA Física gera <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Ação.</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg/relaxed font-light">
                        Chega de alucinações de modelos de linguagem quando está a operar maquinaria. Não pergunte *como* consertar. Aponte a câmera e a IA mostra-lhe exatamente *onde* apertar.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 relative z-10">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Córtex Local (Offline)</h3>
                        <p className="text-slate-400 font-light leading-relaxed">
                            Processamento neural injetado direto no hardware edge. O Phi-3 Mini corre no telemóvel do técnico. Ultra-rápido e não precisa de internet em instalações remotas.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Monitor Tático EPI</h3>
                        <p className="text-slate-400 font-light leading-relaxed">
                            A câmara vigia o operador. Visão computacional que paralisa o guia e emite alerta vermelho em ms se uma mão desprotegida entrar na zona de perigo.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Teleprompter Holográfico</h3>
                        <p className="text-slate-400 font-light leading-relaxed">
                            Grave procedimentos Standard Operating Procedure (SOPs) perfeitos à primeira. O ecrã guia os movimentos do Master Technician durante a captura.
                        </p>
                    </div>
                </div>
            </section>

            {/* Marketplace Section simplified for B2B */}
            <section className="py-32 px-4 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#03070E] to-[#0A111X]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1">
                        <span className="text-green-400 text-sm font-bold tracking-widest uppercase mb-4 block flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            ECOSSISTEMA NEXUS
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white leading-tight mt-6">
                            Capitalize os seus <br/>Master Technicians.
                        </h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed font-light">
                            Não deixe que reformas estupétem o knowledge base da sua empresa. Transforme os movimentos do seu melhor funcionário num Ativo Digital replicável para as próximas dezenas de contrações.
                        </p>

                        <div className="space-y-8 mt-12">
                            {[
                                { num: '1', title: 'Captura Kinetic', desc: 'Registe em 3D o workflow do seu especialista.' },
                                { num: '2', title: 'RAG Embedding', desc: 'A IA limpa e torna o procedimento consultável textualmente.' },
                                { num: '3', title: 'Distribuição Instantânea', desc: 'Deploy na app dos 500 técnicos de campo no dia seguinte.' }
                            ].map((s) => (
                                <div key={s.num} className="flex gap-6 items-start group">
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white transition-colors">
                                        {s.num}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg mb-1 group-hover:text-blue-400 transition-colors">{s.title}</h4>
                                        <p className="text-slate-500 leading-relaxed font-light">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative z-10 bg-[#050B14]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                            {/* Card Header mockup */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">SOP Corporativo #4A</p>
                                        <p className="text-xs text-slate-500">Manutenção Quadro Elétrico</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                    INTERNAL
                                </span>
                            </div>
                            
                            {/* Video thumb */}
                            <div className="aspect-video bg-slate-900 rounded-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2670&auto=format&fit=crop')] bg-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <Play className="w-5 h-5 text-white ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-white text-xs font-mono font-bold rounded">
                                    04:20 m
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[78%]" />
                                </div>
                                <div className="flex justify-between text-xs font-semibold text-slate-400">
                                    <span>78% Alignment Histórico</span>
                                    <span className="text-blue-400">124 Treinos Hoje</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* B2B Section */}
            <section id="features" className="py-32 px-4 lg:px-8 bg-[#050B14]">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-2xl mx-auto text-center mb-20">
                        <span className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4 block">PLATAFORMA ENTERPRISE</span>
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">Arquitetura de Escala Escarpada.</h2>
                        <p className="text-slate-400 text-lg font-light leading-relaxed">
                            Projetado desde o dia zero para suportar frotas com dezenas de milhares de técnicos de campo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: 'White-Label Total', desc: 'A sua marca. Sem logótipos da Nexus.', color: 'blue' },
                            { icon: Users, title: 'Role-Based Access', desc: 'SSO e controlo granulado. Admin vs. Técnico de Campo.', color: 'emerald' },
                            { icon: Zap, title: 'Local-First Sync', desc: 'Trabalho contínuo em caves sem 5G. Sincroniza em background.', color: 'amber' },
                            { icon: Activity, title: 'Gestor Telemetry', desc: 'Dashboards C-Suite para justificar o ROI da formação.', color: 'purple' }
                        ].map((f, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <f.icon className={`w-8 h-8 text-${f.color}-400 mb-6`} />
                                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 px-4 lg:px-8 bg-[#03070E] relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-blue-500 text-sm font-bold tracking-widest uppercase mb-4 block">INVESTIMENTO</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Retorno Mensurável.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free Tier */}
                        <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">Piloto Local</h3>
                            <p className="text-slate-500 text-sm mb-6">Para pequenos centros</p>
                            <p className="text-5xl font-black text-white mb-8">Grátis</p>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-slate-600 mt-0.5" /> 3 Skills Privadas
                                </li>
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-slate-600 mt-0.5" /> 1 Master Account
                                </li>
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-slate-600 mt-0.5" /> 5 Learner Accounts
                                </li>
                            </ul>
                            <Link href="/app" className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors text-center">
                                Iniciar Piloto
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-1 relative flex flex-col transform md:-translate-y-4">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600 rounded-[26px] opacity-70" />
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-[26px] -z-10" />
                            
                            <div className="relative p-8 bg-[#03070E] rounded-3xl h-full flex flex-col">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-black tracking-widest uppercase px-6 py-2 rounded-full shadow-lg">
                                    O MAIS POPULAR
                                </div>
                                <h3 className="text-xl font-bold text-blue-400 mb-2 mt-4">Growth Fleet</h3>
                                <p className="text-slate-400 text-sm mb-6">Equipas operacionais até 50</p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <p className="text-5xl font-black text-white">€490</p>
                                    <span className="text-slate-500">/mês</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-start gap-4 text-white font-medium">
                                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" /> Skills Privadas Ilimitadas
                                    </li>
                                    <li className="flex items-start gap-4 text-white font-medium">
                                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" /> Motor RAG Ilimitado
                                    </li>
                                    <li className="flex items-start gap-4 text-white font-medium">
                                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" /> Analytics de Progresso
                                    </li>
                                    <li className="flex items-start gap-4 text-white font-medium">
                                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" /> Suporte Dedicado
                                    </li>
                                </ul>
                                <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25">
                                    Assinar Plano
                                </button>
                            </div>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">Enterprise Scale</h3>
                            <p className="text-slate-500 text-sm mb-6">Operadores Nacionais +100</p>
                            <p className="text-5xl font-black text-white mb-8">Custom</p>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> Contrato SLA (99.99%)
                                </li>
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> Active Directory SSO
                                </li>
                                <li className="flex items-start gap-4 text-slate-400 font-light">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> Instalação On-Premises (opcional)
                                </li>
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors text-center text-white">
                                Falar com Vendas
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 lg:px-8 bg-[#03070E] border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-500" />
                        <span className="font-bold text-white">Nexus</span>
                    </div>
                    <div className="flex gap-8 text-slate-500 text-sm font-medium">
                        <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Documentação API</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Relatório Transparência IA</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
