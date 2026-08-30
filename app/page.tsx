'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
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

// ── Verticals Data ──
const VERTICALS = [
  { id: 'plumbing', name: 'Plumbing', icon: Wrench, tag: 'PIPE JOINTS · LEAK DETECTION · PRESSURE TESTS' },
  { id: 'telecom', name: 'Telecom', icon: Plug, tag: 'FIBER SPLICING · 5G DEPLOYMENT · TOWER MAINTENANCE' },
  { id: 'maintenance', name: 'Maintenance', icon: Hammer, tag: 'HVAC · ELECTRICAL · PREVENTIVE SCHEDULES' },
  { id: 'retail', name: 'Retail', icon: Store, tag: 'STOCK MANAGEMENT · SHELF AUDIT · STORE SETUP' },
  { id: 'automotive', name: 'Automotive', icon: Car, tag: 'DIAGNOSTICS · BRAKE SERVICE · ENGINE REBUILD' },
  { id: 'construction', name: 'Construction', icon: Building, tag: 'FRAMING · WELDING · CONCRETE POUR' },
  { id: 'industrial', name: 'Industrial', icon: Cpu, tag: 'ASSEMBLY · QUALITY CONTROL · PPE COMPLIANCE' },
  { id: 'education', name: 'Education', icon: GraduationCap, tag: 'LAB TECHNIQUES · SAFETY PROTOCOLS · EQUIPMENT' },
  { id: 'home', name: 'Home / DIY', icon: Home, tag: 'FURNITURE ASSEMBLY · PAINTING · GARDENING' },
]

function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  )
}

export default function NexusLanding() {
  const { scrollYProgress } = useScroll()
  const [activeVertical, setActiveVertical] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const STEPS = ['Record', 'Understand', 'Create', 'Guide', 'Execute', 'Verify']

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden" style={{
      backgroundColor: '#0A0A0F',
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.012) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* ── Scroll Progress Bar ── */}
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
            <a href="#knowledge" className="hover:text-emerald-400 transition-colors">Knowledge</a>
            <a href="#platform" className="hover:text-emerald-400 transition-colors">Platform</a>
            <a href="#worlds" className="hover:text-emerald-400 transition-colors">Worlds</a>
            <Link href="/operations" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Mission Control</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </Link>
            <a href="#enterprise" className="hover:text-emerald-400 transition-colors">Enterprise</a>
          </nav>

          <div className="flex items-center gap-4">
            <AuthButton />
            <Link href="/operations">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[11px] uppercase px-5 py-3 tracking-wider transition-all active:scale-95 border-none shadow-[0_4px_20px_rgba(16,185,129,0.15)] rounded-none">
                Enter Mission Control
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">

        {/* ════════════════════════════════════════════════════════════════════
            1. HERO — FROM KNOWLEDGE TO EXECUTION
            ════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

          <div className="max-w-5xl z-10 flex flex-col items-center pt-16 pb-20">
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
                PHYSICAL SKILL PLATFORM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.92] mb-6 max-w-5xl"
            >
              FROM KNOWLEDGE
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                TO EXECUTION.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              The knowledge of experts should be executable.
              Nexus transforms physical skills into digital guidance that anyone can follow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16"
            >
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-none">
                  Enter Mission Control
                </button>
              </Link>
              <a href="#knowledge" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  See How It Works →
                </button>
              </a>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full max-w-4xl border border-white/5 overflow-hidden relative"
              style={{ background: 'rgba(255,255,255,0.01)', aspectRatio: '16/7' }}
            >
              <img
                src="/images/nexus/hero-skeleton.svg"
                alt="Nexus hand skeleton with smartphone"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            2. THE KNOWLEDGE OF EXPERTS SHOULD BE EXECUTABLE
            ════════════════════════════════════════════════════════════════════ */}
        <section id="knowledge" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Core Principle</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                THE KNOWLEDGE OF EXPERTS SHOULD BE EXECUTABLE.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-lg">
                Every trade, every craft, every procedure lives in the hands and minds of experts. Nexus captures that knowledge and turns it into something anyone can follow — step by step, in real time, with verification.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Record', desc: 'Capture an expert performing the skill — video, motion, spatial data.' },
                  { label: 'Understand', desc: 'AI decomposes the performance into discrete steps and reference frames.' },
                  { label: 'Create', desc: 'Generate a Golden Skeleton — the perfect execution reference.' },
                  { label: 'Guide', desc: 'Overlay the Golden Skeleton on the learner in real time.' },
                  { label: 'Execute', desc: 'The learner follows the guide, performing the physical action.' },
                  { label: 'Verify', desc: 'Compare learner execution against the Golden Skeleton. Prove it was done correctly.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 flex items-center justify-center border border-emerald-500/20 bg-emerald-950/20 font-mono text-[10px] text-emerald-400 font-bold flex-shrink-0 group-hover:border-emerald-500/40 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-white/50 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-white/5 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-6 font-bold flex items-center justify-between">
                  <span>SKILL CAPTURE PIPELINE</span>
                  <span className="text-white/20">NXM-CORE-v2.0</span>
                </div>
                <div className="space-y-3">
                  {[
                    { step: 'detect()', desc: 'Hand tracking + pose estimation', icon: Hand },
                    { step: 'decompose()', desc: 'AI step segmentation', icon: Cpu },
                    { step: 'skeletonize()', desc: 'Golden Skeleton generation', icon: Sparkles },
                    { step: 'align()', desc: 'Real-time pose matching', icon: Target },
                    { step: 'verify()', desc: 'Execution comparison + proof', icon: Shield },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-white/5 hover:border-emerald-500/20 transition-all group flex items-center gap-4" style={{ background: '#07070B' }}>
                      <item.icon className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono font-bold text-[13px] text-emerald-400 group-hover:text-emerald-300 transition-colors">{item.step}</div>
                        <div className="text-[10px] text-white/40 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                      <span className="font-mono text-[9px] text-white/20 group-hover:text-emerald-500/40 transition-colors font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            3. FROM VIDEO TO SKILL
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Transformation</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">FROM VIDEO TO SKILL</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                A video is passive. A skill is executable. Nexus transforms raw expert performance into a structured, verifiable, teachable digital asset.
              </p>
            </div>

            {/* Pipeline visual */}
            <div className="w-full max-w-5xl mx-auto border border-white/5 p-6 md:p-8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-6 font-bold">PIPELINE</div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {STEPS.map((step, idx) => (
                  <div key={idx} className={`text-center p-4 border transition-all ${idx === activeStep ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-white/5 bg-white/[0.01]'}`}>
                    <div className={`font-mono text-[10px] font-bold mb-2 ${idx === activeStep ? 'text-emerald-400' : 'text-white/30'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className={`font-mono text-xs font-bold uppercase tracking-wider ${idx === activeStep ? 'text-emerald-400' : 'text-white/50'}`}>
                      {step}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <ChevronRight className="w-3 h-3 text-emerald-500/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            4. THE EXPERT BECOMES THE GUIDE
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Golden Skeleton</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                THE EXPERT BECOMES THE GUIDE.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                Nexus captures the expert&apos;s physical performance and creates a Golden Skeleton — a precise 3D reference of how the skill should be executed. The learner sees this skeleton overlaid on their own body in real time.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Expert performs the skill once — captured with spatial depth',
                  'AI generates the Golden Skeleton reference',
                  'Learner sees the skeleton overlaid on their body',
                  'Real-time alignment scoring guides perfect execution',
                  'Verification proves the skill was performed correctly',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 border border-emerald-500/20 overflow-hidden" style={{ background: '#020205' }}>
              <img
                src="/images/nexus/golden-skeleton.svg"
                alt="Golden Skeleton vs Learner Skeleton"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            5. NOT ANOTHER VIDEO PLATFORM
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Differentiation</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">NOT ANOTHER VIDEO PLATFORM.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              {/* WATCH (Legacy) */}
              <div className="p-8 md:p-12" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">Traditional Approach</div>
                <h3 className="text-3xl font-black text-white/30 mb-6 line-through">WATCH</h3>
                <ul className="space-y-3">
                  {[
                    'Passive video viewing',
                    'No real-time feedback',
                    'No measurement of execution',
                    'No verification of skill transfer',
                    'Knowledge stays in the video',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-500/50 mt-1 font-mono text-[12px] font-bold">✕</span>
                      <p className="text-white/30 text-xs leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EXECUTE (Nexus) */}
              <div className="p-8 md:p-12 border-l border-emerald-500/20" style={{ background: '#07070B' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Nexus Approach</div>
                <h3 className="text-3xl font-black mb-6" style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>UNDERSTAND → FOLLOW → EXECUTE → VERIFY</h3>
                <ul className="space-y-3">
                  {[
                    'Interactive skeleton guidance',
                    'Real-time alignment scoring',
                    '3D measurement of every movement',
                    'Cryptographic proof of execution',
                    'Knowledge becomes an executable Skill',
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
            6. ONE PLATFORM. MANY WORLDS.
            ════════════════════════════════════════════════════════════════════ */}
        <section id="worlds" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Verticals</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">ONE PLATFORM. MANY WORLDS.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                Plumbing. Telecom. Maintenance. Retail. Automotive. Construction. Industrial. Education. Home.
                One platform that understands the physical world across every trade.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5 border border-white/5">
              {VERTICALS.map((v) => (
                <div key={v.id} className="p-6 md:p-8 text-center hover:bg-white/[0.02] transition-all group cursor-pointer border border-transparent hover:border-emerald-500/20">
                  <v.icon className="w-8 h-8 text-emerald-500/40 group-hover:text-emerald-400 mx-auto mb-4 transition-colors" />
                  <div className="font-mono text-xs text-white/70 group-hover:text-emerald-400 font-bold uppercase tracking-wider mb-2 transition-colors">
                    {v.name}
                  </div>
                  <div className="font-mono text-[8px] text-white/25 uppercase tracking-wider leading-relaxed">
                    {v.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            7. YOUR PHONE BECOMES THE GUIDE
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Mobile First</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                YOUR PHONE BECOMES THE GUIDE.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                No special hardware required. The learner opens Nexus on their phone, points the camera at their hands, and sees the Golden Skeleton overlaid on their body in real time. Step-by-step guidance, alignment scoring, and verification — all from the device in their pocket.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Real-time tracking', desc: '21-point hand skeleton at 30fps' },
                  { label: 'Live scoring', desc: 'Alignment % shown on screen' },
                  { label: 'Step guidance', desc: 'Next action displayed contextually' },
                  { label: 'Proof of execution', desc: 'Cryptographic verification record' },
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                    <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-[10px] text-white/40">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
              <img
                src="/images/nexus/phone-guide.svg"
                alt="Phone as guide with hand skeleton"
                className="w-full max-w-sm h-auto"
              />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            8. WHEN THE DEVICE CAN SEE MORE
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Spatial Intelligence</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">WHEN THE DEVICE CAN SEE MORE, NEXUS CAN UNDERSTAND MORE.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                Standard cameras see pixels. Depth cameras see the world. Nexus leverages spatial data when available — but works with any camera.
              </p>
            </div>

            <div className="w-full max-w-5xl mx-auto border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <img
                src="/images/nexus/standard-vs-spatial.svg"
                alt="Standard camera vs spatial depth comparison"
                className="w-full h-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 mt-8 max-w-5xl mx-auto">
              {[
                { title: 'Standard Camera', desc: 'Works everywhere. 2D hand tracking via MediaPipe. Enough for basic guidance.', badge: 'UNIVERSAL' },
                { title: 'Depth / LiDAR', desc: 'When available: 3D metric hand tracking. Spatial reference frames. Richer verification.', badge: 'ENHANCED' },
                { title: 'Stera SDK', desc: 'Professional spatial capture. MCAP recordings. Camera pose. Depth maps. Full pipeline.', badge: 'PROFESSIONAL' },
              ].map((item, i) => (
                <div key={i} className="p-6 md:p-8" style={{ background: '#07070B' }}>
                  <div className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest mb-3 bg-emerald-950/40 px-2 py-1 inline-block border border-emerald-500/10">
                    {item.badge}
                  </div>
                  <h4 className="font-mono text-sm text-white font-bold mb-2">{item.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            9. FOR EVERYONE
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Accessibility</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                FOR EVERYONE.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                You don&apos;t need a LiDAR phone or special hardware. Nexus works with any smartphone camera. The more advanced the device, the richer the experience — but the core platform works everywhere.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Smartphone, label: 'Any Smartphone', desc: 'iOS, Android, any camera' },
                  { icon: Eye, label: 'No Hardware Required', desc: 'Standard camera works' },
                  { icon: Zap, label: 'Instant Setup', desc: 'Open browser, start learning' },
                  { icon: BookOpen, label: 'Any Skill', desc: 'If hands do it, Nexus can teach it' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-white/5 bg-white/[0.01]">
                    <item.icon className="w-5 h-5 text-emerald-500/50 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[11px] text-white/70 font-bold">{item.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-emerald-500/20 p-8 relative" style={{ background: 'rgba(16,185,129,0.02)' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">PLATFORM TIERS</div>
                <div className="space-y-3">
                  {[
                    { tier: 'BASIC', desc: 'Standard camera + 2D skeleton', hardware: 'Any smartphone', color: 'white' },
                    { tier: 'SPATIAL', desc: 'Depth camera + 3D skeleton', hardware: 'LiDAR / ToF device', color: 'emerald' },
                    { tier: 'PROFESSIONAL', desc: 'Full Stera SDK capture', hardware: 'Stera-compatible device', color: 'emerald' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <div className={`font-mono text-[11px] font-bold uppercase tracking-wider ${item.color === 'emerald' ? 'text-emerald-400' : 'text-white/60'}`}>
                          {item.tier}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                      </div>
                      <div className="font-mono text-[9px] text-white/30 text-right">
                        {item.hardware}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            10. FOR BUSINESS — TURN EXPERTISE INTO SCALE
            ════════════════════════════════════════════════════════════════════ */}
        <section id="enterprise" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Enterprise</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                TURN EXPERTISE INTO SCALE.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                Your best technicians hold irreplaceable knowledge. Nexus captures their expertise once and scales it across your entire workforce. Train faster. Verify everything. Prove compliance.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Training Speed', value: '5x faster', desc: 'New hires reach competence faster' },
                  { label: 'Error Reduction', value: '-80%', desc: 'Guided execution prevents mistakes' },
                  { label: 'Compliance', value: '100%', desc: 'Every execution is verified and logged' },
                  { label: 'Knowledge Loss', value: '$0', desc: 'Expertise captured before retirement' },
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                    <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{item.value}</div>
                    <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-white/5 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-6 font-bold flex items-center justify-between">
                  <span>ENTERPRISE CAPABILITIES</span>
                  <span className="text-white/20">NXM-ENT-v1.0</span>
                </div>
                <div className="space-y-3">
                  {[
                    'Skill Library — organize hundreds of procedures across teams',
                    'Expert Capture — record top performers building your knowledge base',
                    'Learner Dashboard — track progress, scores, and certifications',
                    'Compliance Reports — cryptographic proof of skill execution',
                    'Integration API — connect to your LMS, HR, and operations systems',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-white/5 bg-white/[0.01]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/60 text-xs font-mono">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            11. MISSION CONTROL — OPERATIONAL INTELLIGENCE (preserved)
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">OPERATIONAL INTELLIGENCE</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                Mission Control.<br />Operational Intelligence.
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mb-8">
                Nexus Mission Control merges complex telemetry, incident tracking, and AI anomaly engines into one unified operating system. Monitor skills in production. Track compliance. Alert crews in real time.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Interactive dashboards tracking skill execution across teams',
                  'Real-time compliance monitoring and alerting',
                  'Cryptographic verification of every execution',
                  'AI-powered anomaly detection and recommendations',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>

              <Link href="/operations">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[11px] uppercase px-6 py-4 tracking-widest rounded-none shadow-[0_4px_25px_rgba(16,185,129,0.15)] flex items-center gap-2 group">
                  <span>Launch Mission Control</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>

            <div className="lg:col-span-7 border border-emerald-500/20 p-4 md:p-6" style={{ background: '#020205' }}>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 animate-pulse" />
                  <span className="font-mono text-[10px] text-white/30 ml-2 font-bold uppercase tracking-wider">MISSION_CONTROL_LIVE // NXM-PREVIEW</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="font-mono text-[9px] text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>

              <div className="font-mono text-[11px] text-white/80 space-y-3 leading-relaxed">
                <div className="text-white/30">[14:32:08] INGESTING SKILL EXECUTIONS FROM 12 ACTIVE NODES...</div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 flex items-start gap-3">
                  <Brain className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">SKILL CAPTURED [PLUMBING — PIPE JOINT]</div>
                    <div className="text-[10px] text-emerald-300/80 mt-1 font-sans">Expert performance recorded. Golden Skeleton generated. 8 steps decomposed. Ready for learner deployment.</div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 flex items-start gap-3">
                  <Target className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">LEARNER EXECUTION VERIFIED [SCORE: 94%]</div>
                    <div className="text-[10px] text-emerald-300/80 mt-1 font-sans">Alignment verified across 8 steps. Compliance attestation queued for Polygon blockchain.</div>
                  </div>
                </div>

                <div className="p-2 border border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
                    <span>POLYGON ATTESTATION: 0x7f3a...</span>
                  </div>
                  <span className="text-emerald-500/80 font-bold">CONFIRMED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            12. FINAL CTA — WHAT WILL YOU TEACH NEXUS?
            ════════════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto z-10 relative">
            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">GET STARTED</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
              WHAT WILL YOU<br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>TEACH NEXUS?</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              Every expert has knowledge worth capturing. Every skill deserves to be taught with precision.
              Start building your Skill library today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-none">
                  Create Your First Skill
                </button>
              </Link>
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  Enter Mission Control →
                </button>
              </Link>
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
            <Link href="/operations" className="text-white/40 hover:text-emerald-400 transition-colors">Operations</Link>
            <Link href="/verify" className="text-white/40 hover:text-emerald-400 transition-colors">Verify</Link>
            <Link href="/dashboard" className="text-white/40 hover:text-emerald-400 transition-colors">Dashboard</Link>
            <Link href="/public-sector" className="text-white/40 hover:text-emerald-400 transition-colors">Public Sector</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
