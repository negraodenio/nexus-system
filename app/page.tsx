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

const NICHES = [
  { icon: '👨‍👧', title: 'Pai + Filho', tagline: 'Ensine o que sabe.', desc: 'Um pai ensina o filho a montar, consertar ou fazer qualquer coisa. O Nexus transforma esse conhecimento em orientação que o filho consegue seguir.', color: '#38BDF8' },
  { icon: '🔧', title: 'Encanador', tagline: 'O seu conhecimento não precisa de ficar só consigo.', desc: 'Um profissional grava como troca uma torneira. Outro profissional — ou um cliente — segue o passo a passo guiado pelo Nexus.', color: '#2563EB' },
  { icon: '🥖', title: 'Padaria', tagline: 'Transforme experiência em padrão.', desc: 'O padeiro experiente ensina uma preparação. O novo funcionário é guiado durante a execução. Muito mais eficaz do que um manual.', color: '#2563EB' },
  { icon: '🏭', title: 'Manutenção', tagline: 'Menos dependência de especialistas.', desc: 'Um técnico experiente demonstra um procedimento. Outros técnicos reproduzem-no com orientação em tempo real.', color: '#2563EB' },
  { icon: '📡', title: 'Telecom', tagline: 'Leve a experiência dos melhores técnicos para toda a equipa.', desc: 'A experiência dos seus melhores técnicos, disponível para toda a equipa. Reduza erros, acelere a formação.', color: '#38BDF8' },
  { icon: '🏠', title: 'Dia a dia', tagline: 'Quando precisa de fazer, o Nexus está consigo.', desc: 'Trocar uma torneira. Montar um móvel. Configurar o modem. Instalar uma peça. Pequenas reparações do quotidiano.', color: '#38BDF8' },
]

const JOURNEY_STEPS = [
  { icon: AlertTriangle, label: 'Não sei fazer isto.', desc: 'Tem um problema. Não sabe como resolver.', emotion: 'frustration' },
  { icon: Smartphone, label: 'Abre o Nexus.', desc: 'Aponta a câmara para as suas mãos.', emotion: 'curiosity' },
  { icon: Eye, label: 'Vê a orientação.', desc: 'Alguém faz. Entende o que precisa de fazer.', emotion: 'understanding' },
  { icon: Hand, label: 'Tenta por si mesmo.', desc: 'O Nexus guia os seus movimentos em tempo real.', emotion: 'action' },
  { icon: Target, label: 'Melhora a cada vez.', desc: 'A pontuação mostra o progresso. Cada tentativa fica melhor.', emotion: 'growth' },
  { icon: Check, label: 'Conclui a tarefa.', desc: 'Fez. Aprendeu. Pode voltar a fazer sozinho.', emotion: 'completion' },
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
    <div className="min-h-screen text-white selection:bg-blue-500 selection:text-white overflow-x-hidden" style={{
      backgroundColor: '#0A0F1A',
      backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.015) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-blue-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50" style={{ background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(24px)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/nexus/nexus-brand-logo.png"
              alt="Nexus Motion"
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold font-mono">
            <a href="#como-funciona" className="hover:text-blue-400 transition-colors">Como Funciona</a>
            <a href="#nichos" className="hover:text-blue-400 transition-colors">Nichos</a>
            <a href="#pessoas" className="hover:text-blue-400 transition-colors">Pessoas</a>
            <a href="#empresas" className="hover:text-blue-400 transition-colors">Empresas</a>
            <a href="#tecnologia" className="hover:text-blue-400 transition-colors">Tecnologia</a>
          </nav>

          <div className="flex items-center gap-4">
            <AuthButton />
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[11px] uppercase px-5 py-3 tracking-wider transition-all active:scale-95 rounded-none">
                Entrar
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">

        {/* ════════════════════════════════════════════════════════════════════
            1. HERO — ONE PERSON KNOWS. NEXUS MAKES IT TEACHABLE.
            ════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 overflow-hidden border-b border-white/5">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/images/nexus/nexus-hero-father-son.png"
              alt="Pai e filho a aprender com Nexus Motion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1A] via-[#0A0F1A]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-transparent to-[#0A0F1A]/50" />
          </div>

          <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-12 py-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6 border border-blue-500/30 px-4 py-2 bg-blue-950/30 backdrop-blur-sm"
              >
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-blue-400 font-bold">
                  Physical Intelligence Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] mb-6"
              >
                ONE PERSON KNOWS.
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  NEXUS MAKES IT TEACHABLE.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed"
              >
                Turn real-world expertise into guided action.
                <br className="hidden md:block" />
                Veja como alguém faz. Ou faça você mesmo, com orientação em tempo real.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <a href="#como-funciona" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-none flex items-center gap-2">
                    Ver Como Funciona
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
                <a href="#nichos" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto border border-white/20 hover:bg-white/5 font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all text-white rounded-none hover:border-blue-500/30">
                    Ver Situações Reais
                  </button>
                </a>
              </motion.div>

              {/* Value props bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16 flex flex-wrap gap-8 text-[10px] text-white/50 font-mono uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400/60" />
                  <span>Apenas o telemóvel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400/60" />
                  <span>Orientado por AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400/60" />
                  <span>Aprender fazendo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400/60" />
                  <span>Conhecimento partilhável</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            2. REAL-LIFE GRID — FROM EVERYDAY TO PROFESSIONAL
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
                FROM EVERYDAY SKILLS<br />
                <span style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>TO PROFESSIONAL EXPERTISE.</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mt-4 max-w-2xl mx-auto">
                From changing a faucet at home to training the next generation of professionals,
                Nexus helps turn know-how into something people can actually learn and do.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-lg border border-white/10">
              <img
                src="/images/nexus/nexus-real-life-grid.png"
                alt="Pessoas a usar Nexus Motion para aprender e executar competências reais com orientação no telemóvel"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            3. EMOTIONAL JOURNEY — NÃO SEI → CONSIGO
            ════════════════════════════════════════════════════════════════════ */}
        <section id="como-funciona" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">A Jornada</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
                NÃO SABE COMO FAZER.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>AGORA SABE.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5 border border-white/5">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={i} className="p-6 md:p-8 text-center hover:bg-white/[0.02] transition-all group border border-transparent hover:border-blue-500/20">
                  <div className={`w-12 h-12 mx-auto mb-4 flex items-center justify-center border transition-colors ${
                    i === 0 ? 'border-white/10 text-white/30' :
                    i === JOURNEY_STEPS.length - 1 ? 'border-blue-500/40 text-blue-400 bg-blue-950/30' :
                    'border-blue-500/20 text-blue-500/50 group-hover:text-blue-400 group-hover:border-blue-500/40'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className={`font-mono text-xs font-bold uppercase tracking-wider mb-2 ${
                    i === 0 ? 'text-white/30' :
                    i === JOURNEY_STEPS.length - 1 ? 'text-blue-400' :
                    'text-white/70 group-hover:text-blue-400'
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
            4. SITUAÇÕES REAIS — OS NICHOS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="nichos" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Situações Reais</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">ONDE O NEXUS MUDA A VIDA.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                O Nexus não é uma ferramenta abstrata. Resolve problemas reais de pessoas reais.
                Veja como se encaixa na sua vida e no seu trabalho.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {NICHES.map((niche, i) => (
                <div key={i} className="p-8 md:p-10 hover:bg-white/[0.02] transition-all group border border-transparent hover:border-blue-500/20 relative">
                  <div className="text-4xl mb-4">{niche.icon}</div>
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{niche.title}</h3>
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
            5. PARA PESSOAS — APRENDA QUALQUER COISA FAZENDO
            ════════════════════════════════════════════════════════════════════ */}
        <section id="pessoas" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Para Pessoas</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                APRENDA QUALQUER COISA FAZENDO.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                O pai que quer ensinar o filho. O vizinho que sabe consertar algo. Você que quer aprender a fazer uma reparação qualquer.
                O Nexus transforma qualquer conhecimento prático em orientação que funciona.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Montar móveis IKEA sem dor de cabeça',
                  'Trocar uma torneira ou reparar um cano',
                  'Configurar um modem ou roteador',
                  'Aprender uma receita de padeiro',
                  'Instalar algo que comprou na internet',
                  'Aprender um hobby de alguém que sabe',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border border-blue-500/20 bg-blue-950/10">
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-2 font-bold">A ideia é simples:</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  Alguém sabe fazer. Nexus transforma esse saber em orientação.
                  <br />
                  Você executa. Nexus guia. Você aprende.
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-blue-500/20 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-6 font-bold">COMO FUNCIONA PARA VOCÊ</div>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Alguém grava', desc: 'Um familiar, amigo ou profissional mostra como fazer.' },
                    { step: '02', title: 'Nexus entende', desc: 'Transforma o vídeo em passos claros e orientação.' },
                    { step: '03', title: 'Você assiste', desc: 'Vê a orientação antes de tentar.' },
                    { step: '04', title: 'Você tenta', desc: 'Nexus guia os seus movimentos enquanto faz.' },
                    { step: '05', title: 'Você consegue', desc: 'Completou a tarefa. Pode fazer de novo sozinho.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-white/5 hover:border-blue-500/20 transition-all group" style={{ background: '#0A0F1A' }}>
                      <div className="w-8 h-8 flex items-center justify-center border border-blue-500/20 bg-blue-950/20 font-mono text-[10px] text-blue-400 font-bold flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">{item.title}</div>
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
            6. PARA EMPRESAS — TRANSFORME EXPERIÊNCIA EM ESCALA
            ════════════════════════════════════════════════════════════════════ */}
        <section id="empresas" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="border border-white/5 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-6 font-bold">O SEU MELHOR FUNCIONÁRIO ENSINA TODOS</div>
                <div className="space-y-4">
                  {[
                    { icon: Wrench, title: 'Encanador experiente', desc: 'Grava como faz. Toda a equipa aprende.' },
                    { icon: Cpu, title: 'Técnico de manutenção', desc: 'Demonstra o procedimento. Outros reproduzem.' },
                    { icon: Plug, title: 'Técnico de telecom', desc: 'A experiência vai para toda a equipa.' },
                    { icon: Hammer, title: 'Operário de construção', desc: 'O conhecimento fica na empresa, não na cabeça de um.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.01] hover:border-blue-500/20 transition-all group">
                      <item.icon className="w-5 h-5 text-blue-500/40 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
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
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Para Empresas</div>
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
                    <div className="text-2xl font-black text-blue-400 font-mono">{item.value}</div>
                    <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            7. COMPARAÇÃO — NÃO É SÓ VÍDEO
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">A Diferença</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">NÃO É SÓ VÍDEO. É ORIENTAÇÃO.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#0A0F1A' }}>
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">YouTube / Formação Tradicional</div>
                <h3 className="text-3xl font-black text-white/30 mb-6 line-through">ASSISTIR</h3>
                <ul className="space-y-3">
                  {[
                    'Assiste passivamente',
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

              <div className="p-8 md:p-12 border-l border-blue-500/20" style={{ background: '#0A0F1A' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Nexus</div>
                <h3 className="text-3xl font-black mb-6" style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>VER → TENTAR → GUIA → CONSEGUIR</h3>
                <ul className="space-y-3">
                  {[
                    'Assiste e entende',
                    'Tenta por si mesmo com orientação',
                    'Nexus guia cada movimento',
                    'Verificação em tempo real',
                    'Conhecimento fica consigo',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/70 text-xs leading-relaxed font-medium">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            8. TECNOLOGIA — PARA QUEM QUER SABER MAIS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="tecnologia" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Tecnologia</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">COMO FUNCIONA POR BAIXO.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                O visitante normal não precisa de saber isto. Mas se quiser entender a tecnologia, está aqui.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#0D1321' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Pipeline</div>
                <div className="space-y-3">
                  {[
                    { step: 'detect()', desc: 'Rastreamento de mãos + estimativa de pose', icon: Hand },
                    { step: 'decompose()', desc: 'Segmentação de passos por AI', icon: Cpu },
                    { step: 'skeletonize()', desc: 'Geração do Esqueleto Dourado', icon: Sparkles },
                    { step: 'align()', desc: 'Correspondência de pose em tempo real', icon: Target },
                    { step: 'verify()', desc: 'Comparação + prova de execução', icon: Shield },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-white/5 hover:border-blue-500/20 transition-all group flex items-center gap-4" style={{ background: '#0D1321' }}>
                      <item.icon className="w-4 h-4 text-blue-500/40 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono font-bold text-[13px] text-blue-400 group-hover:text-blue-300 transition-colors">{item.step}</div>
                        <div className="text-[10px] text-white/40 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-12" style={{ background: '#0D1321' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Dispositivos</div>
                <div className="space-y-3">
                  {[
                    { tier: 'BÁSICO', desc: 'Câmara padrão + esqueleto 2D', hardware: 'Qualquer smartphone' },
                    { tier: 'ESPACIAL', desc: 'Câmara depth + esqueleto 3D', hardware: 'Dispositivo LiDAR / ToF' },
                    { tier: 'PROFISSIONAL', desc: 'Captura completa com Stera SDK', hardware: 'Dispositivo compatível Stera' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[11px] text-blue-400 font-bold uppercase tracking-wider">{item.tier}</div>
                        <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                      </div>
                      <div className="font-mono text-[9px] text-white/30 text-right">{item.hardware}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 border border-white/5 bg-white/[0.01]">
                  <p className="text-white/50 text-xs leading-relaxed">
                    A câmara padrão funciona em todo o lado. As câmaras depth adicionam 3D. O Stera SDK oferece o pipeline profissional completo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            9. CTA FINAL
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 text-center relative overflow-hidden" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_60%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto z-10 relative">
            <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Comece Agora</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
              O QUE VAI ENSINAR<br />
              <span style={{
                background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
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
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-none">
                  Pedir Uma Demonstração
                </button>
              </a>
              <a href="#empresas" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/20 hover:bg-white/5 font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all text-white rounded-none hover:border-blue-500/30">
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
      <footer className="border-t border-white/5 py-12 px-6" style={{ background: '#0D1321' }}>
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/nexus/nexus-brand-logo.png"
                alt="Nexus Motion"
                className="h-6 w-auto"
              />
            </Link>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
              © 2026 Nexus Motion · nexusmotion.pt · Tecnologia proprietária em desenvolvimento
            </span>
          </div>

          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest font-bold">
            <a href="#como-funciona" className="text-white/40 hover:text-blue-400 transition-colors">Como Funciona</a>
            <a href="#nichos" className="text-white/40 hover:text-blue-400 transition-colors">Nichos</a>
            <a href="#pessoas" className="text-white/40 hover:text-blue-400 transition-colors">Pessoas</a>
            <a href="#empresas" className="text-white/40 hover:text-blue-400 transition-colors">Empresas</a>
            <a href="#tecnologia" className="text-white/40 hover:text-blue-400 transition-colors">Tecnologia</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
