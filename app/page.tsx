'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import { AuthButton } from '@/components/auth-button'
import {
  Brain,
  Shield,
  Activity,
  Cpu,
  Database,
  Layers,
  Lock,
  ChevronRight,
  ArrowRight,
  Check,
  AlertTriangle,
  Terminal,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileText,
  Eye,
  Hand,
  Smartphone,
  Camera,
  Target,
  Zap,
  BookOpen,
  Wrench,
  Building,
  GraduationCap,
  Hammer,
  Car,
  Plug,
  Store,
} from 'lucide-react'

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  )
}

const NICHES = [
  { icon: '👨‍👧', title: 'Pai + Filho', tagline: 'Ensine o que você sabe.', desc: 'Um pai ensina o filho a montar, consertar ou fazer qualquer coisa. O Nexus transforma esse conhecimento em orientação que o filho consegue seguir.', color: '#10b981' },
  { icon: '🔧', title: 'Encanador', tagline: 'Seu conhecimento não precisa ficar só com você.', desc: 'Um profissional grava como troca uma torneira. Outro profissional — ou um cliente — segue o passo a passo guiado pelo Nexus.', color: '#3b82f6' },
  { icon: '🥖', title: 'Padaria', tagline: 'Transforme experiência em padrão.', desc: 'O padeiro experiente ensina uma preparação. O novo funcionário é guiado durante a execução. Muito mais eficaz que um manual.', color: '#f59e0b' },
  { icon: '🏭', title: 'Manutenção', tagline: 'Menos dependência de especialistas.', desc: 'Um técnico experiente demonstra um procedimento. Outros técnicos reproduzem com orientação em tempo real.', color: '#8b5cf6' },
  { icon: '📡', title: 'Telecom', tagline: 'Leve a experiência dos melhores técnicos para toda a equipa.', desc: 'A experiência dos seus melhores técnicos, disponível para toda a equipa. Reduza erros, acelere a formação.', color: '#06b6d4' },
  { icon: '🏠', title: 'Dia a dia', tagline: 'Quando você precisa fazer, o Nexus está com você.', desc: 'Trocar uma torneira. Montar móvel. Arrumar o modem. Instalar uma peça. Pequenas reparações do quotidiano.', color: '#ec4899' },
]

const JOURNEY_STEPS = [
  { icon: AlertTriangle, label: 'Não sei fazer isso.', desc: 'Você tem um problema. Não sabe como resolver.', emotion: 'frustration' },
  { icon: Smartphone, label: 'Abre o Nexus.', desc: 'Aponta a câmera para as suas mãos.', emotion: 'curiosity' },
  { icon: Eye, label: 'Assiste a orientação.', desc: 'Vê alguém fazendo. Entende o que precisa fazer.', emotion: 'understanding' },
  { icon: Hand, label: 'Tenta você mesmo.', desc: 'Nexus guia os seus movimentos em tempo real.', emotion: 'action' },
  { icon: Target, label: 'Melhora a cada vez.', desc: 'A pontuação mostra o progresso. Cada tentativa fica melhor.', emotion: 'growth' },
  { icon: Check, label: 'Conclui a tarefa.', desc: 'Fez. Aprendeu. Pode fazer de novo sozinho.', emotion: 'completion' },
]

export default function NexusLanding() {
  const { scrollYProgress } = useScroll()
  const [activeNiche, setActiveNiche] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNiche((prev) => (prev + 1) % NICHES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden" style={{
      backgroundColor: '#0A0A0F',
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.012) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-emerald-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-emerald-950/30 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Brain className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-lg font-black tracking-widest text-white">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold font-mono">
            <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">Como Funciona</a>
            <a href="#nichos" className="hover:text-emerald-400 transition-colors">Nichos</a>
            <a href="#pessoas" className="hover:text-emerald-400 transition-colors">Pessoas</a>
            <a href="#empresas" className="hover:text-emerald-400 transition-colors">Empresas</a>
            <a href="#tecnologia" className="hover:text-emerald-400 transition-colors">Tecnologia</a>
          </nav>

          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="pt-20">

        {/* ════════════════════════════════════════════════════════════════════
            1. HERO — YOUTUBE MOSTRA. NEXUS ENSINA A FAZER.
            ════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

          <div className="max-w-4xl z-10 flex flex-col items-center pt-16 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8 border border-emerald-500/20 px-4 py-2 bg-emerald-950/20 backdrop-blur-sm rounded-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-emerald-400 font-bold">
                APRENDA FAZENDO
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.92] mb-6 max-w-4xl"
            >
              YOUTUBE MOSTRA.
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                NEXUS ENSINA A FAZER.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              Veja como alguém faz. Ou faça você mesmo, com orientação em tempo real.
              <br className="hidden md:block" />
              Nexus guia os seus movimentos enquanto você executa a tarefa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16"
            >
              <a href="#como-funciona" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-none">
                  Veja Como Funciona
                </button>
              </a>
              <a href="#nichos" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  Ver Situações Reais →
                </button>
              </a>
            </motion.div>

            {/* Hero Visual — Real Life Scenario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full max-w-4xl border border-white/5 overflow-hidden relative"
              style={{ background: 'rgba(255,255,255,0.01)', aspectRatio: '16/7' }}
            >
              <img
                src="/images/nexus/hero-skeleton.svg"
                alt="Nexus guiando alguém a fazer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent pointer-events-none" />
              {/* Overlay text — real life */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mb-1 font-bold">SITUAÇÃO REAL</div>
                  <div className="text-white/80 text-sm font-medium">Precisa trocar uma torneira? Nexus guia cada passo.</div>
                </div>
                <div className="font-mono text-[10px] text-white/30">NEXUS IN ACTION</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            2. EMOTIONAL JOURNEY — NÃO SEI → CONSIGO
            ════════════════════════════════════════════════════════════════════ */}
        <section id="como-funciona" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">A Jornada</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
                NÃO SEI COMO FAZER.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>AGORA SEI.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5 border border-white/5">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={i} className="p-6 md:p-8 text-center hover:bg-white/[0.02] transition-all group border border-transparent hover:border-emerald-500/20">
                  <div className={`w-12 h-12 mx-auto mb-4 flex items-center justify-center border transition-colors ${
                    i === 0 ? 'border-white/10 text-white/30' :
                    i === JOURNEY_STEPS.length - 1 ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' :
                    'border-emerald-500/20 text-emerald-500/50 group-hover:text-emerald-400 group-hover:border-emerald-500/40'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className={`font-mono text-xs font-bold uppercase tracking-wider mb-2 ${
                    i === 0 ? 'text-white/30' :
                    i === JOURNEY_STEPS.length - 1 ? 'text-emerald-400' :
                    'text-white/70 group-hover:text-emerald-400'
                  } transition-colors`}>
                    {step.label}
                  </div>
                  <div className={`text-[10px] leading-relaxed ${
                    i === 0 ? 'text-white/20' : 'text-white/40'
                  }`}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            3. SITUAÇÕES REAIS — OS NICHOS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="nichos" className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Situações Reais</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">ONDE O NEXUS MUDA A VIDA.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                O Nexus não é uma ferramenta abstrata. Ele resolve problemas reais de pessoas reais.
                Veja como ele se encaixa na sua vida e no seu trabalho.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {NICHES.map((niche, i) => (
                <div key={i} className="p-8 md:p-10 hover:bg-white/[0.02] transition-all group border border-transparent hover:border-emerald-500/20 relative">
                  <div className="text-4xl mb-4">{niche.icon}</div>
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{niche.title}</h3>
                  <div className="font-mono text-xs font-bold uppercase tracking-wider mb-3" style={{ color: niche.color }}>
                    {niche.tagline}
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{niche.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            4. PARA PESSOAS — APRENDA QUALQUER COISA FAZENDO
            ════════════════════════════════════════════════════════════════════ */}
        <section id="pessoas" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Para Pessoas</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                APRENDA QUALQUER COISA FAZENDO.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                O pai que quer ensinar o filho. O vizinho que sabe consertar algo. Você que quer aprender a fazer uma reparação qualquer.
                O Nexus transforma qualquer conhecimento prático em orientação que funciona.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Montar móveisIKEA sem dor de cabeça',
                  'Trocar uma torneira ou reparar um cano',
                  'Configurar um modem ou roteador',
                  'Aprender uma receita de padeiro',
                  'Instalar algo que comprou na internet',
                  'Aprender um hobby de alguém que sabe',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border border-emerald-500/20 bg-emerald-950/10">
                <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mb-2 font-bold">A ideia é simples:</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  Alguém sabe fazer. Nexus transforma esse saber em orientação.
                  <br />
                  Você executa. Nexus guia. Você aprende.
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-emerald-500/20 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-6 font-bold">COMO FUNCIONA PARA VOCÊ</div>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Alguém grava', desc: 'Um familiar, amigo ou profissional mostra como fazer.' },
                    { step: '02', title: 'Nexus entende', desc: 'Transforma o vídeo em passos claros e orientação.' },
                    { step: '03', title: 'Você assiste', desc: 'Vê a orientação antes de tentar.' },
                    { step: '04', title: 'Você tenta', desc: 'Nexus guia os seus movimentos enquanto faz.' },
                    { step: '05', title: 'Você consegue', desc: 'Completou a tarefa. Pode fazer de novo sozinho.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-white/5 hover:border-emerald-500/20 transition-all group" style={{ background: '#07070B' }}>
                      <div className="w-8 h-8 flex items-center justify-center border border-emerald-500/20 bg-emerald-950/20 font-mono text-[10px] text-emerald-400 font-bold flex-shrink-0 group-hover:border-emerald-500/40 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">{item.title}</div>
                        <div className="text-white/50 text-xs leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            5. PARA EMPRESAS — TRANSFORME EXPERIÊNCIA EM ESCALA
            ════════════════════════════════════════════════════════════════════ */}
        <section id="empresas" className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="border border-white/5 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-6 font-bold">O SEU MELHOR FUNCIONÁRIO ENSINA TODOS</div>
                <div className="space-y-4">
                  {[
                    { icon: Wrench, title: 'Encanador experiente', desc: 'Grava como faz. Toda a equipa aprende.' },
                    { icon: Cpu, title: 'Técnico de manutenção', desc: 'Demonstra o procedimento. Outros reproduzem.' },
                    { icon: Plug, title: 'Técnico de telecom', desc: 'A experiência vai para toda a equipa.' },
                    { icon: Hammer, title: 'Operário de construção', desc: 'O conhecimento fica na empresa, não na cabeça de um.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.01] hover:border-emerald-500/20 transition-all group">
                      <item.icon className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-xs text-white/70 font-bold">{item.title}</div>
                        <div className="text-white/40 text-[10px] mt-1">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Para Empresas</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                TRANSFORME EXPERIÊNCIA EM ESCALA.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                Os seus melhores profissionais guardam conhecimento valioso. Nexus captura isso uma vez e escala para toda a equipa.
                Treine mais rápido. Reduza erros. Prove conformidade.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Formação', value: '5x mais rápida', desc: 'Novos colaboradores aprendem mais depressa' },
                  { label: 'Erros', value: '-80%', desc: 'Orientação previne erros' },
                  { label: 'Conformidade', value: '100%', desc: 'Cada execução é verificada' },
                  { label: 'Perda de conhecimento', value: '€0', desc: 'O saber fica na empresa' },
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                    <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{item.value}</div>
                    <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            6. COMPARAÇÃO — NÃO É SÓ VÍDEO
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">A Diferença</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">NÃO É SÓ VÍDEO. É ORIENTAÇÃO.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">YouTube / Treino Tradicional</div>
                <h3 className="text-3xl font-black text-white/30 mb-6 line-through">ASSISTIR</h3>
                <ul className="space-y-3">
                  {[
                    'Você assiste passivamente',
                    'Não sabe se está a fazer bem',
                    'Esqueceu o passo seguinte',
                    'Não há verificação',
                    'Conhecimento fica no vídeo',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-500/50 mt-1 font-mono text-[12px] font-bold">✕</span>
                      <p className="text-white/30 text-xs leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 md:p-12 border-l border-emerald-500/20" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Nexus</div>
                <h3 className="text-3xl font-black mb-6" style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>VER → TENTAR → GUIA → CONSEGUIR</h3>
                <ul className="space-y-3">
                  {[
                    'Você assiste e entende',
                    'Tenta você mesmo com orientação',
                    'Nexus guia cada movimento',
                    'Verificação em tempo real',
                    'Conhecimento fica com você',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/70 text-xs leading-relaxed font-medium">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            7. TELECOM — CASO REAL MEO
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Caso Real — Telecom</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                A EXPERIÊNCIA DOS MELHORES TÉCNICOS, PARA TODA A EQUIPA.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                Um técnico experiente da MEO sabe resolver problemas que outros demoram horas a aprender.
                Com Nexus, essa experiência fica disponível para toda a equipa — guia em tempo real, reduz erros, acelera a formação.
              </p>

              <div className="space-y-4">
                {[
                  'O técnico mais experiente grava o procedimento',
                  'Nexus transforma em orientação guiada',
                  'Novos técnicos são guiados durante a execução',
                  'Redução de erros e chamadas de retorno',
                  'Conformidade verificada em cada intervenção',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-emerald-500/20 overflow-hidden" style={{ background: '#020205' }}>
                <img
                  src="/images/nexus/golden-skeleton.svg"
                  alt="Orientação em tempo real para técnicos"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            8. TECNOLOGIA — PARA QUEM QUER SABER MAIS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="tecnologia" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Tecnologia</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">COMO FUNCIONA POR BAIXO.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                O visitante normal não precisa de saber isto. Mas se quiser entender a tecnologia, está aqui.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Pipeline</div>
                <div className="space-y-3">
                  {[
                    { step: 'detect()', desc: 'Rastreamento de mãos + estimativa de pose', icon: Hand },
                    { step: 'decompose()', desc: 'Segmentação de passos por AI', icon: Cpu },
                    { step: 'skeletonize()', desc: 'Geração do Esqueleto Dourado', icon: Sparkles },
                    { step: 'align()', desc: 'Correspondência de pose em tempo real', icon: Target },
                    { step: 'verify()', desc: 'Comparação + prova de execução', icon: Shield },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-white/5 hover:border-emerald-500/20 transition-all group flex items-center gap-4" style={{ background: '#07070B' }}>
                      <item.icon className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono font-bold text-[13px] text-emerald-400 group-hover:text-emerald-300 transition-colors">{item.step}</div>
                        <div className="text-[10px] text-white/40 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-12" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Dispositivos</div>
                <div className="space-y-3">
                  {[
                    { tier: 'BÁSICO', desc: 'Câmera padrão + esqueleto 2D', hardware: 'Qualquer smartphone' },
                    { tier: 'ESPACIAL', desc: 'Câmera depth + esqueleto 3D', hardware: 'Dispositivo LiDAR / ToF' },
                    { tier: 'PROFISSIONAL', desc: 'Captura completa com Stera SDK', hardware: 'Dispositivo compatível Stera' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">{item.tier}</div>
                        <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                      </div>
                      <div className="font-mono text-[9px] text-white/30 text-right">{item.hardware}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 border border-white/5 bg-white/[0.01]">
                  <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">Normal</div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Standard camera works everywhere. Depth cameras add 3D. Stera SDK gives you the full professional pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            9. CTA FINAL — O QUE VAI ENSINAR AO NEXUS?
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto z-10 relative">
            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">COMECE AGORA</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
              O QUE VAI ENSINAR<br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AO NEXUS?</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              Cada especialista tem conhecimento que vale ser capturado.
              Cada habilidade merece ser ensinada com precisão.
              Comece a construir a sua biblioteca de habilidades hoje.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a href="#nichos" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-none">
                  Ver Situações Reais
                </button>
              </a>
              <a href="#empresas" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  Para Empresas →
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12 px-6" style={{ background: '#07070B' }}>
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1 bg-emerald-950/20 border border-emerald-500/20">
                <Brain className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-base font-black tracking-widest text-white">NEXUS</span>
            </Link>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
              © 2026 Nexus Motion · nexusmotion.pt · NXM-PAT-001-2026 (PCT Pending)
            </span>
          </div>

          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest font-bold">
            <a href="#como-funciona" className="text-white/40 hover:text-emerald-400 transition-colors">Como Funciona</a>
            <a href="#nichos" className="text-white/40 hover:text-emerald-400 transition-colors">Nichos</a>
            <a href="#pessoas" className="text-white/40 hover:text-emerald-400 transition-colors">Pessoas</a>
            <a href="#empresas" className="text-white/40 hover:text-emerald-400 transition-colors">Empresas</a>
            <a href="#tecnologia" className="text-white/40 hover:text-emerald-400 transition-colors">Tecnologia</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
