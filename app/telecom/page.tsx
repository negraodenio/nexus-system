'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { CheckCircle, ArrowRight, Zap, Shield, TrendingUp, Phone, Mail, ChevronDown, AlertTriangle, Target } from 'lucide-react'
import { DynamicMotionDemo } from '@/components/telecom/dynamic-motion-demo'

// ── CONFIG ──────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '351921389999'
const CALENDLY_URL    = 'https://calendly.com/negraodenio/new-meeting'

// Custo real por técnico (valores médios Portugal/Telecom)
function calcROI(techs: number, extraHours: number) {
  const truckRoll        = techs * 80 * 0.30 * 150 * 0.30  // 80 visitas/mês, 30% 2ª visita, €150/visita, -30% com Nexus
  const onboarding       = (techs * 0.15 / 12) * 4800 * 0.50 // 15% turnover, €4800 onboard, -50%
  const productivityGain = techs * extraHours * 20            // horas extra × €20/h
  return Math.round(truckRoll + onboarding + productivityGain)
}

// ── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || !ref.current) return
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (val) => {
        if (ref.current) ref.current.textContent = prefix + Math.round(val).toLocaleString('en-US') + suffix
      }
    })
    return controls.stop
  }, [isInView, value, prefix, suffix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

// ── GHOST HAND DEMO (CSS-animated simulation) ─────────────────────────────────
function GhostHandDemo() {
  const [phase, setPhase] = useState<'scanning' | 'error' | 'correcting' | 'ok'>('scanning')
  const [score, setScore] = useState(42)

  useEffect(() => {
    const seq = [
      { p: 'scanning' as const, s: 42, delay: 0 },
      { p: 'error' as const,    s: 38, delay: 2000 },
      { p: 'correcting' as const, s: 61, delay: 4000 },
      { p: 'ok' as const,       s: 94, delay: 6500 },
      { p: 'scanning' as const, s: 42, delay: 9000 },
    ]
    const timers = seq.map(({ p, s, delay }) =>
      setTimeout(() => { setPhase(p); setScore(s) }, delay)
    )
    const loop = setInterval(() => {
      seq.forEach(({ p, s, delay }) =>
        setTimeout(() => { setPhase(p); setScore(s) }, delay)
      )
    }, 10000)
    return () => { timers.forEach(clearTimeout); clearInterval(loop) }
  }, [])

  const phaseConfig = {
    scanning:   { label: 'Scanning equipment…', color: '#60a5fa', ring: '#3b82f6' },
    error:      { label: 'Deviation detected: Loose PON cable', color: '#f87171', ring: '#ef4444' },
    correcting: { label: 'AI guiding: tighten LC/APC connector', color: '#fb923c', ring: '#f97316' },
    ok:         { label: '✓ Procedure validated', color: '#4ade80', ring: '#22c55e' },
  }
  const cfg = phaseConfig[phase]

  // Simplified hand skeleton points (normalized 0-100)
  const JOINTS = [
    [50,80],[50,65],[50,52],[50,42],[50,33],   // thumb col
    [60,72],[62,56],[64,44],[65,35],            // index
    [65,70],[68,53],[70,41],[71,32],            // middle
    [70,70],[73,54],[74,43],[75,35],            // ring
    [75,72],[77,57],[78,48],[79,40],            // pinky
  ]
  const BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]]

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-[#070f1a] shadow-2xl shadow-blue-900/30" style={{ aspectRatio: '16/10' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Router silhouette (suggested) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-16 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-3">
        {['LOS','PON','POWER'].map((l, i) => (
          <div key={l} className="flex flex-col items-center gap-1">
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: phase === 'error' && i === 0 ? '#ef4444' : '#22c55e', opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
            />
            <span className="font-mono text-[8px] text-white/30">{l}</span>
          </div>
        ))}
      </div>

      {/* Ghost Hand SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Bones */}
        {BONES.map(([a, b], i) => (
          <motion.line key={i}
            x1={JOINTS[a][0]} y1={JOINTS[a][1]}
            x2={JOINTS[b][0]} y2={JOINTS[b][1]}
            stroke={cfg.color} strokeWidth="0.5" strokeLinecap="round"
            animate={{ stroke: cfg.color, opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.05 }}
          />
        ))}
        {/* Joints */}
        {JOINTS.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="1.2"
            animate={{ fill: cfg.color, r: phase === 'error' && i < 5 ? [1.2, 2, 1.2] : 1.2 }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.03 }}
          />
        ))}
        {/* Error highlight on thumb when in error phase */}
        {phase === 'error' && (
          <motion.circle cx={50} cy={42} r="4" fill="none" stroke="#ef4444" strokeWidth="0.8"
            animate={{ r: [3, 5, 3], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </svg>

      {/* Status HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-4">
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm text-xs font-mono font-bold"
          style={{ background: `${cfg.ring}15`, borderColor: `${cfg.ring}40`, color: cfg.color }}
          key={phase}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        >
          {phase === 'error' && <AlertTriangle className="w-3 h-3" />}
          {phase === 'ok' && <CheckCircle className="w-3 h-3" />}
          {phase === 'scanning' && <motion.div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />}
          {cfg.label}
        </motion.div>

        {/* Score */}
        <motion.div
          className="flex flex-col items-center px-3 py-2 rounded-lg border backdrop-blur-sm"
          style={{ background: '#00000080', borderColor: 'rgba(255,255,255,0.1)' }}
          animate={{ borderColor: `${cfg.ring}60` }}
        >
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">SCORE</span>
          <motion.span
            className="text-2xl font-black"
            style={{ color: cfg.color }}
            key={score}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {score}
          </motion.span>
        </motion.div>
      </div>

      {/* Corner badge */}
      <div className="absolute bottom-4 right-4 font-mono text-[9px] text-white/20 uppercase tracking-widest">
        NEXUS · FIELD AI · LIVE
      </div>
    </div>
  )
}

// ── ROI CALCULATOR ────────────────────────────────────────────────────────────
function ROICalculator() {
  const [techs, setTechs] = useState(20)
  const [extraH, setExtraH] = useState(4)
  const savings = calcROI(techs, extraH)

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between font-mono text-xs text-blue-400 uppercase mb-3">
              <span>Field Technicians</span>
              <span className="text-white font-bold text-base">{techs}</span>
            </div>
            <input type="range" min="1" max="200" value={techs}
              onChange={e => setTechs(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[10px] text-white/20 mt-1"><span>1</span><span>200</span></div>
          </div>

          <div>
            <div className="flex justify-between font-mono text-xs text-cyan-400 uppercase mb-3">
              <span>Recovered hours/tech/month</span>
              <span className="text-white font-bold text-base">{extraH}h</span>
            </div>
            <input type="range" min="1" max="20" value={extraH}
              onChange={e => setExtraH(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[10px] text-white/20 mt-1"><span>1h</span><span>20h</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Truck Rolls', val: `€${Math.round(techs * 80 * 0.30 * 150 * 0.30).toLocaleString('en-US')}` },
              { label: 'Onboarding', val: `€${Math.round((techs * 0.15 / 12) * 4800 * 0.5).toLocaleString('en-US')}` },
              { label: 'Productivity', val: `€${Math.round(techs * extraH * 20).toLocaleString('en-US')}` },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="font-mono text-[10px] text-white/40 uppercase mb-1">{m.label}</div>
                <div className="font-bold text-sm text-blue-300">{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">Estimated monthly savings</div>
          <motion.div
            key={savings}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white mb-2"
          >
            €{savings.toLocaleString('en-US')}
          </motion.div>
          <div className="text-blue-400 font-mono text-sm">with {techs} technicians</div>
          <div className="mt-6 text-xs text-white/30 leading-relaxed">
            Based on: €150/truck roll · 30% repeat visit rate<br />
            15% annual turnover · €4,800 onboarding cost
          </div>

          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=I+would+like+to+calculate+ROI+with+${techs}+technicians`}
            target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
            Validate with actual data
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── LEAD FORM ─────────────────────────────────────────────────────────────────
function LeadForm() {
  const [form, setForm] = useState({ name: '', company: '', email: '', techs: '10' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Hello! I'd like to initiate a Nexus Field AI pilot.\n\nName: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nTechnicians: ${form.techs}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    setSent(true)
  }

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">Request sent!</h3>
      <p className="text-slate-400">We will contact you within 2 hours.</p>
    </motion.div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
        { label: 'Company / Operator', key: 'company', type: 'text', placeholder: 'Ex: Global Telecom, NetCloud Europe...' },
        { label: 'Work Email', key: 'email', type: 'email', placeholder: 'john@yourcompany.com' },
      ].map(f => (
        <div key={f.key}>
          <label className="block font-mono text-xs text-white/50 uppercase tracking-widest mb-2">{f.label}</label>
          <input
            type={f.type} required placeholder={f.placeholder}
            value={form[f.key as keyof typeof form]}
            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      ))}
      <div>
        <label className="block font-mono text-xs text-white/50 uppercase tracking-widest mb-2">Number of Techs</label>
        <select value={form.techs} onChange={e => setForm(p => ({ ...p, techs: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
          {['< 10', '10–50', '50–200', '200+'].map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
        </select>
      </div>
      <button type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95">
        Explore Nexus for your Team →
      </button>
      <p className="text-center text-xs text-white/30">
        No commitment. If there is no measurable impact, you don't continue.
      </p>
    </form>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function TelecomLanding() {
  return (
    <div className="min-h-screen text-white selection:bg-blue-500 selection:text-white"
      style={{
        backgroundColor: '#070B14',
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
        fontFamily: 'Inter, sans-serif',
      }}>

      <header className="fixed top-0 w-full z-50 border-b border-white/5"
        style={{ background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black text-lg tracking-tighter">
            NEXUS<span className="text-blue-500">·</span>FIELD<span className="text-blue-400"> AI</span>
            <span className="text-xs font-normal text-white/30 ml-3 border-l border-white/10 pl-3 tracking-normal">Telecom Edition</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-4 py-2">
              View Demo
            </a>
            <a href="#piloto"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 transition-all">
              Start Pilot
            </a>
          </div>
        </div>
      </header>

      <main className="pt-16">

        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
                {/* HERO COPY */}
                <div className="text-center space-y-8 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            Field AI · Mobile First
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] mb-8">
                            O técnico vê.<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">A IA corrige.</span><br/>
                            Instanteamente.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                            Reduza erros de campo e elimine o retrabalho em tempo real. <br className="hidden md:block"/>
                            <span className="text-white">Funciona em qualquer smartphone.</span> Sem hardware extra, sem fricção.
                        </p>
                    </motion.div>
                </div>
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 to-transparent pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(59,130,246,0.12), transparent)' }} />

          <div className="max-w-5xl z-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8 font-mono text-[10px] tracking-[0.2em] uppercase text-blue-400 border border-blue-500/20 px-4 py-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Nexus Field AI · Real-Time Validation · Telecom Edition
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 text-left">
              {[
                { 
                  role: 'Field Technician', 
                  benefit: 'Zero errors. AR-guided precision that turns every technician into a senior expert.',
                  icon: <Zap className="w-4 h-4 text-blue-400" />
                },
                { 
                  role: 'Core Specialist', 
                  benefit: 'Global control. Deploy and audit physical protocols as easily as pushing code.',
                  icon: <Target className="w-4 h-4 text-cyan-400" />
                },
                { 
                  role: 'End User', 
                  benefit: 'Zero downtime. Experience the reliability of first-time resolution service.',
                  icon: <Shield className="w-4 h-4 text-emerald-400" />
                }
              ].map((p, i) => (
                <div key={i} className="p-5 border border-white/5 bg-white/[0.02] hover:border-blue-500/30 transition-all rounded-2xl group">
                  <div className="flex items-center gap-2 mb-3">
                    {p.icon}
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">{p.role}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-white transition-colors">{p.benefit}</p>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=I+would+like+to+see+the+Nexus+Field+AI+demo`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-5 text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95">
                <Phone className="w-4 h-4" />
                View 10 min demo
              </a>
              <a href="#roi"
                className="flex items-center gap-2 border border-white/10 hover:bg-white/5 font-bold px-10 py-5 text-sm uppercase tracking-widest transition-all text-slate-300">
                Calculate team ROI
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-px border border-white/5 max-w-2xl mx-auto overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                { v: '-50%', l: 'Field Errors' },
                { v: '-60%', l: 'Onboarding Time' },
                { v: '-30%', l: 'Repeat Visits' },
              ].map((m, i) => (
                <div key={i} className="py-6 text-center" style={{ background: '#070B14' }}>
                  <div className="text-2xl font-black text-blue-400 mb-1">{m.v}</div>
                  <div className="font-mono text-[10px] text-white/40 uppercase">{m.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6" style={{ background: '#0a101c' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Real-Time Validation</div>
              <h2 className="text-4xl font-black tracking-tighter">The technician sees. The AI corrects. Instantly.</h2>
            </div>

            <DynamicMotionDemo skillId="5ca8fef5-8189-460c-9b39-cde2c40ffbb6" />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Zap className="w-5 h-5" />, title: '<100ms Detection', desc: 'Deviation is identified before causing an error.' },
                { icon: <Target className="w-5 h-5" />, title: 'Step-by-step guide', desc: 'Visual and vocal feedback precisely during execution.' },
                { icon: <Shield className="w-5 h-5" />, title: 'Immutable log', desc: 'Every intervention logged for ISO auditing.' },
              ].map((f, i) => (
                <div key={i} className="p-6 border border-white/5 hover:border-blue-500/30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-blue-400 mb-4">{f.icon}</div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">The Real Problem</div>
              <h2 className="text-4xl font-black tracking-tighter mb-8 leading-tight">
                Every repeat visit<br />costs <span className="text-red-400">€150</span> and 1 unhappy customer.
              </h2>
              <ul className="space-y-4">
                {[
                  '30% of malfunctions require an avoidable repeat visit',
                  'Onboarding a new tech: 6–8 weeks of in-person shadowing',
                  'Senior knowledge is not transferable via PDF documents',
                  'Quality audits lack objective evidence of execution',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-400 mt-0.5 font-bold">×</span>
                    <span className="text-slate-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">The Nexus Solution</div>
              <ul className="space-y-4">
                {[
                  'Real-time tech guidance — without calling L2 support',
                  'New tech reaches senior performance in 2–3 weeks',
                  'The best expert "teaches" once → copies to 1000 techs',
                  'Cryptographic audit trail of every procedure — audit-ready',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="roi" className="py-24 px-6" style={{ background: '#0a101c' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">ROI Calculator</div>
              <h2 className="text-4xl font-black tracking-tighter">How much will you save with {' '}
                <span style={{ color: '#3b82f6' }}>your team?</span>
              </h2>
            </div>
            <ROICalculator />
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Track Record</div>
              <h2 className="text-4xl font-black tracking-tighter">Measurable results,<br />not promises.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/5 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                { v: 50, suffix: '%', label: 'Field Errors' },
                { v: 60, suffix: '%', label: 'Onboarding Time' },
                { v: 30, suffix: '%', label: 'Repeat Visits' },
                { v: 100, suffix: '%', label: 'Audit-Ready' },
              ].map((m, i) => (
                <div key={i} className="p-10 text-center" style={{ background: '#070B14' }}>
                  <div className="text-4xl font-black text-blue-400 mb-2">
                    <AnimatedNumber value={m.v} suffix={m.suffix} />
                  </div>
                  <div className="font-mono text-[10px] text-white/40 uppercase">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 grid md:grid-cols-4 gap-px border border-white/5 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                { n: '01', title: 'Aim', desc: 'Technician points camera at equipment' },
                { n: '02', title: 'Identify', desc: 'AI diagnoses the issue in <2 seconds' },
                { n: '03', title: 'Guide', desc: 'AR overlay shows the correct procedure' },
                { n: '04', title: 'Log', desc: 'Resolution saved with immutable proof' },
              ].map((s, i) => (
                <div key={i} className="p-8" style={{ background: '#070B14' }}>
                  <div className="font-mono text-blue-500 text-xs mb-4">{s.n}</div>
                  <h3 className="font-black text-lg mb-2 uppercase tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="piloto" className="py-24 px-6" style={{ background: '#0a101c' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">Limited Offer</div>
                <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">
                  30-Day Pilot<br />with your team.
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  1-week deployment. Measurable results by the end of the pilot.
                  <strong className="text-white"> If there is no demonstrable impact, you walk away.</strong>
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Guided onboarding for the whole team',
                    'Real-time metric dashboard',
                    'Direct support via dedicated channels',
                    'ROI report by the end of the pilot',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-6 border border-blue-500/20 bg-blue-500/5">
                  <div className="font-mono text-xs text-blue-400 uppercase mb-2">Pilot investment</div>
                  <div className="text-3xl font-black text-white">€1.500 <span className="text-slate-500 text-lg font-normal">/ 30 days</span></div>
                  <div className="text-xs text-slate-500 mt-1">or performance-based rev-share</div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-8">
                <div className="font-mono text-xs text-white/50 uppercase tracking-widest mb-6">Start Pilot</div>
                <LeadForm />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2">Prefer to speak directly?</div>
              <h3 className="text-2xl font-black">Response in under 2 hours.</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-4 text-sm uppercase tracking-widest transition-all">
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a href={`mailto:hello@nexusmotion.pt?subject=Nexus Field AI Pilot`}
                className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-slate-300 font-bold px-6 py-4 text-sm uppercase tracking-widest transition-all">
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 text-sm uppercase tracking-widest transition-all">
                <TrendingUp className="w-4 h-4" />
                Book demo
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 px-6" style={{ background: '#070B14' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            © 2026 Nexus Motion · nexusmotion.pt · All rights reserved
          </div>
          <div className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            NXM-PAT-001-2026 (PCT Pending) · EU AI Act Compliant
          </div>
        </div>
      </footer>
    </div>
  )
}
