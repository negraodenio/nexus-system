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
  FileText
} from 'lucide-react'

// ── Verticals Data ──
const VERTICALS = [
  {
    id: 'smart-cities',
    name: 'Smart Cities',
    tag: 'URBAN MONITORING · TRAFFIC · CROWD DENSITY',
    description: 'Nexus transforms dense urban telemetry into actionable operational intelligence. Streamlining municipal response, public safety, and energy grid utilization across multiple departments.',
    metrics: [
      { label: 'MTTR reduction', value: '-50%' },
      { label: 'Fewer Site Visits', value: '67%' },
      { label: 'Audit Compliance', value: '100%' }
    ],
    diagram: 'Ingesting 1,200+ events/sec → Anomaly Correlator → Localized AI Insight → Immutable Ledger'
  },
  {
    id: 'telecom-ops',
    name: 'Telecom Ops',
    tag: 'NETWORK EVENTS · FIELD OPERATIONS · SLA MONITORING',
    description: 'Keep complex infrastructure online. Correlate cellular tower telemetry, local weather anomalies, and technician dispatch actions in real-time, preventing SLA penalties before they trigger.',
    metrics: [
      { label: 'Dispatch Speed', value: '4.5x' },
      { label: 'Field Errors', value: '-90%' },
      { label: 'SLA Monitoring', value: 'Real-time' }
    ],
    diagram: '5G Cell Tower Telemetry → Predictive AI Router → Corrective Action Dispatch → Attestation Signed'
  },
  {
    id: 'facilities',
    name: 'Facilities',
    tag: 'OCCUPANCY · ENERGY · MAINTENANCE · INCIDENTS',
    description: 'Maximize corporate real estate utilization. Monitor workplace occupancy patterns, dynamic HVAC usage, and structural safety incidents, turning buildings into low-energy smart spaces.',
    metrics: [
      { label: 'Workplace Injuries', value: '-40%' },
      { label: 'Energy Compliance', value: '94%' },
      { label: 'Hardware Cost', value: '$0 extra' }
    ],
    diagram: 'IoT Sensor Array → Cosine Similarity Search → AI Spatial Analysis → Building Automation Trigger'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    tag: 'SAFETY MONITORING · PPE COMPLIANCE · QUALITY CONTROL',
    description: 'Proactively enforce strict factory safety and quality standard operating procedures. Record operational pipelines, verify PPE compliance, and flag assembly defects at the edge with absolute speed.',
    metrics: [
      { label: 'System Uptime', value: '99.9%' },
      { label: 'Defect Detection', value: '<2s' },
      { label: 'Standard Compliance', value: 'ISO-Ready' }
    ],
    diagram: 'Edge Video Ingestion → RAG Pattern Matching → Immediate Severity Warning → SQL RLS Immutability'
  }
]

export default function NexusLanding() {
  const { scrollYProgress } = useScroll()
  const [activeVertical, setActiveVertical] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const autoPlayRef = useRef<(() => void) | null>(null)

  // Rotating Verticals Tab Logic
  useEffect(() => {
    autoPlayRef.current = () => {
      setActiveVertical((prev) => (prev + 1) % VERTICALS.length)
    }
  })

  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(() => {
      if (autoPlayRef.current) autoPlayRef.current()
    }, 3000)
    return () => clearInterval(timer)
  }, [isAutoPlay])

  const activeV = VERTICALS[activeVertical]

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden" style={{
      backgroundColor: '#0A0A0F',
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.015) 1px, transparent 1px)',
      backgroundSize: '45px 45px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* ── Scroll Progress Bar ── */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-emerald-500 z-[100] origin-left" 
        style={{ scaleX: scrollYProgress }} 
      />

      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-emerald-950/30 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Brain className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-lg font-black tracking-widest text-white">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold font-mono">
            <Link href="/public-sector" className="text-emerald-400 hover:text-emerald-300 font-extrabold tracking-widest border-r border-white/10 pr-6">Public Sector</Link>
            <a href="#technology" className="hover:text-emerald-400 transition-colors">Technology</a>
            <Link href="/operations" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Operations</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </Link>
            <a href="#verticals" className="hover:text-emerald-400 transition-colors">Verticals</a>
            <a href="#patent" className="hover:text-emerald-400 transition-colors">Patent</a>
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

      {/* ── HERO SECTION ── */}
      <main className="pt-20">
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
          
          <div className="max-w-5xl z-10 flex flex-col items-center pt-12 pb-16">
            {/* Live Kicker Badge */}
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
                COMPLIANT WITH PRR C19-i08 & ARPGU · LIVE · LISBOA
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-6 max-w-4xl"
            >
              Trusted Urban &<br />
              <span style={{ 
                background: 'linear-gradient(90deg, #34d399, #10b981)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Operational Intelligence.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed font-medium"
            >
              The open, NGSI-LD / FIWARE-compliant Urban Management Platform (PGU) designed for Portuguese municipalities to capture 100% of C19-i08 PRR funds — with no vendor lock-in.
            </motion.p>

            {/* Call to Actions */}
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
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  View Smart City Demo →
                </button>
              </Link>
            </motion.div>

            {/* Pipeline Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full max-w-4xl border border-white/5 p-6 md:p-8" 
              style={{ background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6 text-left border-b border-white/5 pb-3 flex items-center justify-between">
                <span>System Pipeline Execution Sequence</span>
                <span className="text-white/20 font-normal">NXM-CORE-v1.4</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
                {[
                  { step: '01', name: 'detect()', desc: 'IoT & Telemetry Ingest' },
                  { step: '02', name: 'correlate()', desc: 'RAG Pattern Match' },
                  { step: '03', name: 'analyze()', desc: 'Hybrid AI Reasoning' },
                  { step: '04', name: 'orchestrate()', desc: 'Automated Dispatch' },
                  { step: '05', name: 'attest()', desc: 'Immutable Ledger Sign' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 border border-white/5 hover:border-emerald-500/20 transition-all group" style={{ background: '#07070B' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] text-white/30 group-hover:text-emerald-500 transition-colors font-bold">{item.step}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                    </div>
                    <div className="font-mono font-bold text-[13px] text-emerald-400 group-hover:text-emerald-300 transition-colors mb-1">{item.name}</div>
                    <div className="text-[10px] text-white/40 leading-tight">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── THE PROBLEM SECTION ── */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* The Left Side Column */}
            <div className="lg:col-span-5">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Operational Vulnerability</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                Operations fail silently.<br />Compliance fails loudly.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-lg">
                Without cryptographic linkage between sensors, real-time context, and frontline decisions, enterprise operations remain highly vulnerable to unchecked blind spots, high MTTR, and catastrophic liability issues.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Invisible Failures: Systems crash, SLAs trigger, and telemetry stays uncorrelated for hours.',
                  'Unverified Action: Technician reports are handwritten, lack validation, and prompt repeat visits.',
                  'Silent Compliance Breaches: Zero cryptographic proof that safety protocols were executed.',
                  'Siloed Telemetry: IoT arrays, camera streams, and incident tickets never merge into a unified timeline.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 font-mono text-[12px] font-bold">✕</span>
                    <p className="text-white/70 text-xs leading-relaxed font-medium">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparison Table / Matrix Column */}
            <div className="lg:col-span-7 border border-white/5 p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="font-mono text-[10px] text-emerald-500 mb-6 uppercase tracking-widest font-bold flex items-center justify-between">
                <span>BUSINESS ACCELERATION MATRIX</span>
                <span className="text-white/20">VS LEGACY</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      <th className="pb-4 font-mono">OPERATIONAL VECTOR</th>
                      <th className="pb-4 font-mono">LEGACY APPROACH</th>
                      <th className="pb-4 font-mono text-emerald-400">NEXUS CAPABILITY</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {[
                      ['Record Veracity', 'Manual logs & paper reports', 'Immutable attestation signed at edge'],
                      ['Alert Strategy', 'Reactive sirens & notifications', 'Predictive AI cross-correlation'],
                      ['Audit Readiness', 'Subjective paper trail compilation', 'Mathematical proof via Polygon ledger'],
                      ['Data Utilization', 'Siloed database & single-stream logs', 'Unified real-time event pipeline'],
                    ].map(([indicator, old, now], i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="py-4 font-bold text-white/70 font-mono text-[11px]">{indicator}</td>
                        <td className="py-4 text-white/40 font-mono line-through pr-4">{old}</td>
                        <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{now}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        {/* ── TECH STACK (2x2 GRID) ── */}
        <section id="technology" className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="max-w-3xl mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">Architecture & Design</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Cryptographically Proving Operations.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                The Nexus system core integrates state-of-the-art AI orchestration with immutable database security. Every physical event is verified, compiled, and recorded permanently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
              {[
                {
                  step: '01',
                  category: 'DETECT',
                  title: 'Real-Time Event Ingestion',
                  desc: 'Unify your distributed operations. Seamlessly ingest massive data streams from IoT node arrays, legacy SCADA networks, environmental sensors, IP cameras, and proprietary software APIs directly into a ultra-low-latency unified event bus.',
                  techs: ['Kafka Event Bus', 'HTTP/MQTT Webhook Gateways', 'SCADA Integrators']
                },
                {
                  step: '02',
                  category: 'CORRELATE',
                  title: 'Neuromuscular RAG Engine',
                  desc: 'Search, map, and isolate events in real-time. Power your incident detection with high-dimension pgvector, IVFFLAT indexing, and high-performance cosine similarity searches, safely isolated with strict multi-tenant Row Level Security (RLS).',
                  techs: ['SupaBase PostgreSQL', 'pgvector & IVFFLAT', 'Cosine Similarity Model']
                },
                {
                  step: '03',
                  category: 'ANALYZE',
                  title: 'Hybrid AI Router',
                  desc: 'Scale intelligence dynamically. Nexus orchestrates queries using MiniMax M2.7 for complex linguistic reasoning and logic checks, paired with Google Gemini 1.5 Flash for vision-native telemetry analysis, customizable directly from the dashboard.',
                  techs: ['MiniMax M2.7 Reasoning', 'Gemini 1.5 Flash Vision', 'Hot-swappable AI Router']
                },
                {
                  step: '04',
                  category: 'ATTEST',
                  title: 'Immutable Compliance Ledger',
                  desc: 'Absolute proof of operational compliance. Row Level Security prevents manual updates or deletion, while every key incident triggers a cryptographic content-hash anchored to IPFS and committed securely onto the Polygon blockchain.',
                  techs: ['PostgreSQL RLS Lockouts', 'IPFS Decentralized Storage', 'Polygon Blockchain Anchor']
                }
              ].map((tech, idx) => (
                <div key={idx} className="p-8 md:p-12 hover:bg-white/[0.01] transition-all flex flex-col justify-between" style={{ backgroundColor: '#0A0A0F' }}>
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-emerald-500 text-xs font-bold tracking-widest bg-emerald-950/40 px-3 py-1 border border-emerald-500/10">
                        {tech.step} // {tech.category}
                      </span>
                      <span className="text-white/10 font-mono text-[10px] font-bold">SECURE_NODE_{idx+1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 font-mono uppercase">{tech.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed mb-8">{tech.desc}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3 font-bold">INTEGRATIONS</div>
                    <div className="flex flex-wrap gap-2">
                      {tech.techs.map((t, i) => (
                        <span key={i} className="text-[9px] font-mono font-bold text-white/60 bg-white/5 px-2.5 py-1 border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION CONTROL PREVIEW SECTION ── */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              <div className="lg:col-span-5">
                <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">OPERATIONAL INTELLIGENCE</div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                  Mission Control.<br />The Palantir for cities and telecom.
                </h2>
                <p className="text-white/50 text-xs leading-relaxed mb-8">
                  Nexus Mission Control merges complex city-scale telemetry, incident tracking, and AI anomaly engines into one unified, low-latency operating system. Proactively alert dispatched crews, isolate degradation trends, and secure compliance proof with ease.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Interactive maps tracking physical coordinates',
                    'Dynamic operational timelines updating live',
                    'Manual action acknowledgement overrides',
                    'Cryptographic hash generation for compliance audits'
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

              {/* Graphical Terminal Interface Representation */}
              <div className="lg:col-span-7 border border-emerald-500/20 p-4 md:p-6" style={{ background: '#020205' }}>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 animate-pulse" />
                    <span className="font-mono text-[10px] text-white/30 ml-2 font-bold uppercase tracking-wider">LISBOA_DASHBOARD_LIVE // NXM-PREVIEW</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="font-mono text-[9px] text-emerald-400 font-bold">ONLINE</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-white/80 space-y-3 leading-relaxed">
                  <div className="text-white/30">[20:14:15] INGESTING IoT DATA STREAMS FROM 20 ZONES...</div>
                  
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">ALERT: POWER GRID ANOMALY [CRITICAL]</div>
                      <div className="text-[10px] text-red-400/80 mt-1">Sensor SNS-0024 in Marquês de Pombal reported voltage drop of 18%.</div>
                      <div className="text-[9px] text-white/30 mt-2 font-bold">AI ROUTER MATCH: SEVERITY ENGINE OVERRIDE TRIGGERED</div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 flex items-start gap-3">
                    <Brain className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">AI INSIGHT GENERATED [MINIMAX-M2.7]</div>
                      <div className="text-[10px] text-emerald-300/80 mt-1 font-sans">"Voltage pattern matches 98.4% prior grid failure signature FM-1294 from 14 days ago. Automatic crew routing suggested. Compliance attestation queued."</div>
                    </div>
                  </div>

                  <div className="p-2 border border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] text-white/40">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
                      <span>POLYGON TX BLOCKCHAIN SIGNATURE QUEUED: 0x48e11a...</span>
                    </div>
                    <span className="text-emerald-500/80 font-bold">READY</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── VERTICALS TAB SECTION ── */}
        <section id="verticals" className="py-24 px-6 border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">OPERATIONAL DIVERSITY</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">ENGINEERED FOR MULTIPLE VERTICALS</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                Nexus powers infrastructure, operations, and compliance tracking globally across crucial industries. Select an operations sector below to inspect real-time performance indicators.
              </p>
            </div>

            {/* Vertical Select Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-8">
              {VERTICALS.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVertical(idx)
                    setIsAutoPlay(false) // Pause auto-rotation when user clicks
                  }}
                  className="py-5 font-mono text-[11px] font-bold uppercase tracking-widest text-center transition-all rounded-none border-none outline-none"
                  style={{
                    backgroundColor: activeVertical === idx ? '#07070B' : '#0A0A0F',
                    color: activeVertical === idx ? '#10b981' : 'rgba(255,255,255,0.4)',
                    borderBottom: activeVertical === idx ? '2px solid #10b981' : 'none'
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>

            {/* Active Vertical Details Panel */}
            <div className="border border-white/5 p-8 md:p-12 relative overflow-hidden" style={{ background: '#07070B' }}>
              <div className="absolute top-0 right-0 p-3 font-mono text-[9px] text-white/10 uppercase tracking-widest font-bold">
                VERTICAL_ENGINE_SYS
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                  <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-3">
                    {activeV.tag}
                  </div>
                  <h3 className="text-3xl font-bold uppercase text-white mb-6 tracking-tight">
                    Optimizing {activeV.name} Operations
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    {activeV.description}
                  </p>

                  <div className="p-4 border border-emerald-500/10 bg-emerald-950/10 flex flex-col md:flex-row items-center gap-4">
                    <Terminal className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 font-bold">ATTESATION TRANSACTION PIPELINE</div>
                      <div className="font-mono text-[11px] text-emerald-400 font-medium leading-relaxed">{activeV.diagram}</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                  <div className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-1">REALIZED METRICS SUMMARY</div>
                  
                  {activeV.metrics.map((metric, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-white/[0.01] flex justify-between items-center">
                      <span className="font-mono text-white/50 text-[11px] uppercase tracking-wider">{metric.label}</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── METRICS STRIP ── */}
        <section className="py-12 px-6 border-b border-white/5" style={{ background: '#0A0A0F' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono">
            {[
              { title: 'OPERATIONAL SECTORS', val: '4 Verticais' },
              { title: 'LIVE DEPLOYED NODES', val: '264 Sensores' },
              { title: 'AVERAGE NODE HEALTH', val: '99.2% Uptime' },
              { title: 'COMPLIANCE AUDIT RATE', val: '100% Imutável' }
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-bold mb-2">{m.title}</span>
                <span className="text-xl font-black text-white">{m.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── BLOCKCHAIN ATTESTATION SECTION ── */}
        <section id="patent" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#07070B' }}>
          <div className="max-w-4xl mx-auto border border-emerald-500/20 p-8 md:p-12 relative" style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, transparent 100%)'
          }}>
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-white/20 font-bold">
              PATENT REF: NXM-PAT-001-2026
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-none mb-6">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase mb-6 max-w-2xl">
                Mathematical proof that operations were executed correctly.
              </h2>
              
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl mb-10">
                Nexus locks down compliance auditing. Two-layer immutability prevents manual editing: advanced Row Level Security blocks direct updates/deletions at the database layer, while immediate event-hashes are permanently signed onto the Polygon blockchain network.
              </p>

              {/* 4 Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
                {[
                  'Immutable SQL (RLS)',
                  'IPFS Content Hash',
                  'Polygon TX Anchor',
                  'EU AI Act Compliant'
                ].map((badge, idx) => (
                  <div key={idx} className="p-3 border border-white/5 bg-black/40 font-mono text-[10px] text-white/70 font-bold uppercase tracking-wider">
                    {badge}
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 font-mono text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold border border-emerald-500/10 px-4 py-2 bg-emerald-950/10">
                <span>PCT Pending Registration Phase</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CALL TO ACTION ── */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto z-10 relative">
            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">GET STARTED</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
              Deploy Trusted Intelligence.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              The infrastructure for operational certainty is ready. Launch Mission Control or request a developer integration build key.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-none">
                  Enter Mission Control — It's Free
                </button>
              </Link>
              <Link href="/operations" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/10 hover:bg-white/5 font-bold px-8 py-4.5 text-xs uppercase tracking-widest transition-all text-white/80 rounded-none hover:border-emerald-500/30">
                  Request Enterprise Demo
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6" style={{ background: '#07070B' }}>
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo & Patent */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1 bg-emerald-950/20 border border-emerald-500/20">
                <Brain className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-base font-black tracking-widest text-white">NEXUS</span>
            </Link>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
              © 2026 Nexus · nexusmotion.pt · NXM-PAT-001-2026 (PCT Pending)
            </span>
          </div>

          {/* Footer links */}
          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest font-bold">
            <Link href="/operations" className="text-white/40 hover:text-emerald-400 transition-colors">Operations</Link>
            <Link href="/verify" className="text-white/40 hover:text-emerald-400 transition-colors">Verify</Link>
            <Link href="/dashboard" className="text-white/40 hover:text-emerald-400 transition-colors">Dashboard</Link>
          </div>

        </div>
      </footer>
    </div>
  )
}
