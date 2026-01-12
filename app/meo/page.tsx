'use client'

import { Brain, Network, Shield, TrendingUp, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function MeoPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
            {/* MEO Branding Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* MEO Logo Placeholder / Style */}
                        <div className="font-black text-2xl tracking-tighter">
                            <span className="text-white">MEO</span>
                            <span className="text-blue-500">.</span>
                            <span className="font-normal text-slate-400 text-sm ml-3 border-l border-slate-700 pl-3">Enterprise Solutions</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#vision" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Visão</a>
                        <a href="#field-ops" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Field Ops</a>
                        <a href="#partnership" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Parceria & Inovação</a>
                    </nav>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all text-sm">
                        Pitch para Investidores
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Powered by MEO 5G</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tighter">
                            A Próxima Camada da <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                                Infraestrutura Humana.
                            </span>
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                            **Nexus** transforma o conhecimento técnico dos seus especialistas em **Realidade Aumentada Cognitiva**. Reduza o MTTR de campo, acelere o onboarding e venda inovação para seus clientes B2B.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
                                Agendar Demo Executiva
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">
                                Ver Use Cases
                            </button>
                        </div>
                    </div>

                    {/* Core Product Visualization */}
                    <div className="relative group perspective-1000">
                        <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-slate-900 to-black transform transition-transform group-hover:rotate-y-2 group-hover:rotate-x-2">
                            {/* Embed Generated Image Here */}
                            {/* Note: In a real deployment, this path needs to be correct. For this demo, we assume the file serves correctly or we use a public URL. */}
                            <div className="aspect-[4/3] relative">
                                {/* Placeholder for the AI Generated Image */}
                                <Image
                                    src="/nexus_meo_router_diagnostic_1767873857942.png"
                                    alt="Nexus Router Diagnostic AR"
                                    fill
                                    className="object-cover"
                                />

                                {/* UI Overlay Simulation */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-500/20 rounded-lg backdrop-blur-md border border-red-500/50 animate-pulse">
                                            <Zap className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-red-400 font-mono text-xs font-bold uppercase">Falha Detectada: LOS Vermelho</p>
                                            <p className="text-white font-bold">Ação: Verificar Patch Cord Óptico</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/20 blur-[100px] -z-10 rounded-full opacity-50 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* KPI Stats Strip */}
            <section className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">50%</p>
                        <p className="text-slate-400 text-sm">Menos tempo de treino</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">30%</p>
                        <p className="text-slate-400 text-sm">Redução de Truck Rolls</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">Zero</p>
                        <p className="text-slate-400 text-sm">Latência (Edge AI)</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">10GB</p>
                        <p className="text-slate-400 text-sm">Dados/mês por técnico</p>
                    </div>
                </div>
            </section>

            {/* Field Ops Section */}
            <section id="field-ops" className="py-24 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-blue-500 font-bold tracking-widest uppercase text-sm">Excelência Operacional</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">Field Ops 2.0</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Padronize o conhecimento da sua força de campo. Do técnico sênior para o estagiário, instantaneamente.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card
                            icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
                            title="Redução do MTTR"
                            desc="Técnicos guiados por IA resolvem problemas complexos mais rápido, sem precisar ligar para o suporte nível 2."
                        />
                        <Card
                            icon={<Shield className="w-6 h-6 text-blue-400" />}
                            title="Compliance & Segurança"
                            desc="O 'Safety Monitor' valida o uso de EPIs e a execução correta dos passos críticos em tempo real."
                        />
                        <Card
                            icon={<Network className="w-6 h-6 text-blue-400" />}
                            title="Offline-First"
                            desc="Nossa IA (Local Cortex) roda no dispositivo do técnico. Funciona em caves e zonas rurais sem sinal 5G."
                        />
                    </div>
                </div>
            </section>

            {/* Strategic Partnership Section (Altice ecosystems) */}
            <section id="partnership" className="py-24 px-6 bg-gradient-to-b from-blue-900/20 to-black border-t border-white/10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm">Open Innovation</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black">ENTER Program</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Sinergia com Altice Labs.</h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            O Nexus não é apenas um cliente. Somos o parceiro ideal para os eixos estratégicos de inovação da Altice (XR, AI & Future Networks).
                        </p>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-white font-bold block text-lg">5G API Sprint</span>
                                    <span className="text-slate-400">Utilizamos APIs de rede (QoS on Demand) para garantir que o "Ghost Mode" tenha latência zero para técnicos em campo.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-white font-bold block text-lg">Candidato ao AIIA</span>
                                    <span className="text-slate-400">Inovação disruptiva em "Field Operations" pronta para o Altice International Innovation Award.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                                    <Network className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-white font-bold block text-lg">Novo Produto B2B</span>
                                    <span className="text-slate-400">White-label pronto para o portfólio MEO Empresas. Venda Nexus + Fibra para a Indústria Portuguesa.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Altice Labs / Innovation Visual */}
                    <div className="relative h-[500px] w-full bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden group">
                        {/* Background suggesting Lab/Server Room */}
                        <Image
                            src="/nexus_meo_datacenter_5g_1767874392624.png"
                            alt="MEO 5G Data Center"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black to-transparent">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="px-3 py-1 bg-white text-black text-xs font-bold rounded">Powered by</div>
                                <p className="text-xl font-bold text-white">Altice Labs @ Aveiro</p>
                            </div>
                            <p className="text-slate-400 border-l-2 border-cyan-500 pl-4">
                                "Transformar conhecimento em valor."<br />
                                O Nexus materializa essa visão trazendo IA para o mundo físico.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="py-20 text-center border-t border-white/10 bg-slate-950">
                <h2 className="text-3xl font-bold text-white mb-6">Pronto para liderar a revolução cognitiva?</h2>
                <button className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-blue-600/20">
                    Falar com a Equipa Nexus
                </button>
                <p className="mt-8 text-slate-600 text-sm">
                    © 2026 Nexus Physical Graph. Proposta Confidencial para Altice Portugal.
                </p>
            </footer>
        </div>
    )
}

function Card({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}
