'use client'

import { AuthButton } from '@/components/auth-button'
import { Brain, Sparkles, Play, Zap, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101822] text-white font-sans overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-[#101822]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-blue-500">
              <Brain className="w-full h-full" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nexus</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">O Problema</a>
            <a href="#solution" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Solução</a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Preços</a>
          </nav>
          <div className="flex items-center gap-4">
            <AuthButton />
            <a
              href="/skills?skillId=3bdb03d9-9322-46be-a825-03b9a6c3c4f0"
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse"
            >
              🚀 DEMO MODE
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
            v1.0 Beta Pública
          </span>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tighter mb-6">
            Pare de Ler Manuais. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Comece a Fazer.
            </span>
          </h1>

          <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            <span className="text-white font-semibold">Nexus</span> é o primeiro Sistema Operacional para o mundo físico.
            Transforme conhecimento tácito em guias visuais com IA que funciona offline.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/app" className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
              <Play className="w-5 h-5" />
              Baixar para Android
            </Link>
            <Link href="/marketplace" className="flex items-center gap-2 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all">
              Explorar Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#101822] to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl shadow-blue-500/10">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden group">
              {/* Video Background Mockup */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-8 left-8 text-left z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-xs font-mono font-bold uppercase">Ghost Mechanic Active</span>
                </div>
                <p className="text-white font-bold text-lg">Substituindo Correia do Alternador</p>
                <p className="text-slate-400 text-sm">IA identificou 3 pontos de segurança.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop: Anti-Chatbot */}
      <section id="solution" className="py-20 px-4 lg:px-8 bg-[#1c242f]/50 border-y border-slate-800">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-blue-500 text-sm font-bold tracking-widest uppercase mb-4 block">A Revolução</span>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Chega de Chatbots que Alucinam.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            O ChatGPT gera texto. O Nexus gera <span className="text-white font-bold">ação</span>.
            Não pergunte como consertar. Aponte a câmera e veja *onde* apertar.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#151c26] border border-slate-700 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-500">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Local Cortex</h3>
            <p className="text-slate-400">Sua IA roda direto no chip do celular (Phi-3 Mini). Rápido, privado e funciona sem internet em lugares remotos.</p>
          </div>

          <div className="p-8 rounded-2xl bg-[#151c26] border border-slate-700 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Safety Monitor</h3>
            <p className="text-slate-400">Visão computacional que detecta perigos em tempo real. Alerta se você esquecer o EPI ou colocar a mão onde não deve.</p>
          </div>

          <div className="p-8 rounded-2xl bg-[#151c26] border border-slate-700 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">SOP Wizard</h3>
            <p className="text-slate-400">Teleprompter holográfico para gravar procedimentos perfeitos. Nunca mais esqueça um passo durante a gravação.</p>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-20 px-4 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#101822] to-[#1c242f] -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-green-500 text-sm font-bold tracking-widest uppercase mb-4 block">Marketplace</span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Monetize sua Habilidade Manual.</h2>
            <p className="text-slate-400 text-lg mb-8">
              Seu conhecimento tácito vale ouro. Transforme anos de experiência em ativos digitais que geram renda passiva enquanto você dorme.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">1</div>
                <div>
                  <h4 className="font-bold text-white">Grave</h4>
                  <p className="text-slate-500 text-sm">Use o app para capturar o procedimento.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">2</div>
                <div>
                  <h4 className="font-bold text-white">Mint</h4>
                  <p className="text-slate-500 text-sm">Transforme em um ativo digital único no Nexus.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">3</div>
                <div>
                  <h4 className="font-bold text-white">Lucre</h4>
                  <p className="text-slate-500 text-sm">Venda para empresas ou aprendizes globais.</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-green-300 transition-colors">
                Ver Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="relative z-10 bg-[#151c26] rounded-2xl border border-slate-700 p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <div>
                    <p className="font-bold text-white">Mecânica Avançada</p>
                    <p className="text-xs text-slate-500">por Carlos M.</p>
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">€ 45.00</span>
              </div>
              <div className="aspect-video bg-slate-800 rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white/50" />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>⭐ 4.9 (128 avaliações)</span>
                <span>850+ vendas</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-green-500/20 blur-3xl -z-10 rounded-full opacity-20" />
          </div>
        </div>
      </section>

      {/* Key Differentiator */}
      <section className="py-20 px-4 lg:px-8 bg-blue-500 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
              Contexto, <br />não só Conteúdo.
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Tutoriais tradicionais mostram O QUE fazer. Nexus mostra COMO fazer — com o movimento exato das mãos do expert.
            </p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Vídeo + Skeleton em tempo real</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Busca por linguagem natural</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Integrado com IA explicativa</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 shadow-2xl">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-24 h-24 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section id="features" className="py-20 px-4 lg:px-8 bg-[#101822]">
        <div className="max-w-4xl mx-auto">
          <span className="text-blue-500 text-sm font-bold tracking-widest uppercase mb-4 block">Enterprise</span>
          <h2 className="text-3xl font-bold mb-12">Pronto para Escala</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-[#1c242f] border border-slate-800">
              <Shield className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">White-Label</h3>
              <p className="text-slate-400 text-sm">Sua marca, nossa tecnologia. Integre Nexus no app da sua empresa.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#1c242f] border border-slate-800">
              <Users className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Multi-Tenant</h3>
              <p className="text-slate-400 text-sm">Cada empresa tem seu espaço isolado com controle total de acesso.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#1c242f] border border-slate-800">
              <Zap className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">API Pública</h3>
              <p className="text-slate-400 text-sm">REST + GraphQL. Integre com seus sistemas existentes.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#1c242f] border border-slate-800">
              <Sparkles className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Analytics</h3>
              <p className="text-slate-400 text-sm">Saiba quais skills são mais usadas e onde estão os gaps de treinamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 lg:px-8 bg-[#1c242f]/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-500 text-sm font-bold tracking-widest uppercase mb-4 block">Preços</span>
            <h2 className="text-3xl font-bold">Planos Flexíveis</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-[#1c242f] rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold mb-4">Starter</h3>
              <p className="text-3xl font-black mb-1">Grátis</p>
              <p className="text-slate-500 text-sm mb-6">Para experimentar</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  5 skills gravadas
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Busca por IA
                </li>
              </ul>
              <Link href="/app" className="block w-full py-3 rounded-lg border border-slate-600 font-bold hover:bg-slate-800 transition-colors text-center">
                Começar
              </Link>
            </div>

            <div className="p-8 bg-[#1c242f] rounded-xl border-2 border-blue-500 relative transform md:-translate-y-4 shadow-xl shadow-blue-500/10">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-lg font-bold mb-4 text-blue-400">Pro</h3>
              <p className="text-3xl font-black mb-1">€12<span className="text-base font-normal text-slate-500">/mês</span></p>
              <p className="text-slate-500 text-sm mb-6">Para criadores</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Skills ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Vídeo + Skeleton
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Marketplace
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                Assinar
              </button>
            </div>

            <div className="p-8 bg-[#1c242f] rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold mb-4">Enterprise</h3>
              <p className="text-3xl font-black mb-1">Custom</p>
              <p className="text-slate-500 text-sm mb-6">Para empresas</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  White-label
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  SSO + API
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-slate-600 font-bold hover:bg-slate-800 transition-colors">
                Contato
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <span className="font-bold">Nexus</span>
          </div>
          <div className="flex gap-6 text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between text-sm text-slate-500">
          <p>© 2024 Nexus. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
