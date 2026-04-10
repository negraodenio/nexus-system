'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import { AuthButton } from '@/components/auth-button'
import { Brain, CheckCircle } from 'lucide-react'

const VERTICALS = [
    {
        tag: 'TELECOM & 5G',
        title: 'Reduce Repeat Visits',
        desc: 'Field teams accelerate diagnostics with Augmented Reality overlays. The AI corrects procedure technique exactly in real-time, preventing rework.',
        metrics: [{ v: '-50%', l: 'Resolution Time' }, { v: '67%', l: 'Fewer Repeat Visits' }, { v: '100%', l: 'ROI Tracking' }],
        imgAlt: 'Telecom technician operating infrastructure',
        imgSrc: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        badge: 'LIVE_DEPLOYMENT'
    },
    {
        tag: 'INDUSTRY & MANUFACTURING',
        title: 'SOP Compliance Control',
        desc: 'Identify safety non-compliance and ergonomic errors in real-time across your factories, generating immutable evidence for ISO/OSHA audits.',
        metrics: [{ v: '< 2s', l: 'Risk Detection' }, { v: 'ISO', l: 'Audit-Ready' }, { v: '99%', l: 'AI Uptime' }],
        imgAlt: 'Smart factory manufacturing floor',
        imgSrc: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80',
        badge: 'READY FOR PILOT'
    },
    {
        tag: 'TECHNICAL EDUCATION',
        title: 'Accelerated Onboarding',
        desc: 'Record your senior technician. The new hire trains against the "Digital Master" independently, learning in weeks what previously took months.',
        metrics: [{ v: '80%', l: 'Faster Learning' }, { v: '3.2x', l: '1st Year ROI' }, { v: '∞', l: 'Scalability' }],
        imgAlt: 'Student learning with interactive digital system',
        imgSrc: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80',
        badge: 'BETA_ACTIVE'
    },
    {
        tag: 'HEALTH & REHAB',
        title: 'Home Physiotherapy',
        desc: 'Your patient exercises at home and the connected camera reports posture deviations in real-time. Direct clinical reports with zero hardware costs.',
        metrics: [{ v: '24/7', l: 'Continuous Eval' }, { v: '100%', l: 'Clinical Data' }, { v: 'ZERO', l: 'Extra Hardware' }],
        imgAlt: 'Patient with AI technology',
        imgSrc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
        badge: 'BETA_CONCEPT'
    }
]

export default function NexusLanding() {
    const { scrollYProgress } = useScroll()
    const [activeVertical, setActiveVertical] = useState(0)
    const [tick, setTick] = useState(0)

    useEffect(() => {
        const t = setInterval(() => setTick(p => p + 1), 5000)
        return () => clearInterval(t)
    }, [])
    useEffect(() => { setActiveVertical(tick % VERTICALS.length) }, [tick])

    const v = VERTICALS[activeVertical]

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black" style={{
            backgroundColor: '#0A0A0F',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            fontFamily: 'Inter, sans-serif'
        }}>

            <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-emerald-500 z-[100] origin-left" style={{ scaleX: scrollYProgress }} />

            <header className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-black tracking-tighter text-emerald-500">NEXUSMOTION</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 font-bold text-xs tracking-widest uppercase">
                        {[['How it Works', '#technology'], ['Sectors', '#verticals'], ['Advantage', '#economy'], ['Certification', '#patent']].map(([label, href]) => (
                            <a key={label} href={href} className="text-slate-400 hover:text-white transition-colors">{label}</a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <AuthButton />
                        <Link href="/telecom">
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase px-6 py-3 tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                                View Telecom Demo
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-20">

                <section className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center overflow-hidden">
                    <div className="max-w-5xl z-10">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 mb-10 font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-400 border border-emerald-500/20 px-4 py-2 bg-emerald-500/5 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            B2B Platform for Frontline Operations
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
                            Physical Intelligence<br />
                            <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                that Guides Operations.
                            </span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                            The first Physical Intelligence Operating System. Using a standard smartphone camera, we diagnose complex issues, validate technician execution, and accelerate flawless work. 
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
                            <Link href="/telecom">
                                <button className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-10 py-5 text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95">
                                    View Use Cases
                                </button>
                            </Link>
                            <Link href="/dashboard">
                                <button className="border border-white/10 hover:bg-white/5 font-bold px-10 py-5 text-sm uppercase tracking-widest transition-all text-slate-300">
                                    Executive Access →
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                            className="w-full max-w-2xl mx-auto border border-white/5 rounded-2xl overflow-hidden p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-4">Automatic Operational Pipeline</div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-bold text-sm text-slate-400">
                                <div className="text-center"><div className="text-2xl mb-2 text-white">📸</div>1. Camera Observes</div>
                                <div className="text-emerald-500 hidden sm:block">→</div>
                                <div className="text-center"><div className="text-2xl mb-2 text-white">⚙️</div>2. AI Diagnoses</div>
                                <div className="text-emerald-500 hidden sm:block">→</div>
                                <div className="text-center"><div className="text-2xl mb-2 text-white">📊</div>3. Execution Logged</div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="py-32 px-8" style={{ background: '#0e0e14' }}>
                    <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4">The Corporate Problem</div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-10">
                                Critical knowledge in<br />your company is lost.
                            </h2>
                            <ul className="space-y-6">
                                {[
                                    'Onboarding is Slow: New technicians require weeks shadowing seniors before gaining autonomy.',
                                    'Rework Costs Money: Procedures executed incorrectly result in duplicate truck rolls and customer dissatisfaction.',
                                    'Knowledge at Risk: 30 Years of mastery evaporate when the lead expert moves jobs or retires.',
                                    'No Hard Proof: Evaluating who complies and who ignores safety protocols relies on guesswork, not clear data.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <span className="text-red-400 mt-0.5 text-lg font-bold flex-shrink-0">×</span>
                                        <p className="text-slate-400 font-medium leading-relaxed">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-white/5 p-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="font-mono text-[10px] text-emerald-500 mb-8 uppercase tracking-widest">Business_Acceleration_Matrix</div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest font-bold">
                                        <th className="pb-4">Indicator</th>
                                        <th className="pb-4">Traditional Method</th>
                                        <th className="pb-4 text-emerald-400">With Nexus AI</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[
                                        ['Onboarding Time', 'Months of shadowing', 'Weeks of guided training'],
                                        ['Error Correction', 'Call Helpline / L2', 'Instant (AR AI Overlay)'],
                                        ['Hardware Costs', '$50,000+ VR simulators', '$0 (Just the phone camera)'],
                                        ['Quality Audit', 'Subjective paper trails', '100% Immutable proof logs'],
                                    ].map(([v, old, now], i) => (
                                        <tr key={i} className="border-b border-white/5">
                                            <td className="py-5 font-bold text-white/70 text-xs">{v}</td>
                                            <td className="py-5 text-slate-500 line-through text-xs font-mono">{old}</td>
                                            <td className="py-5 text-emerald-400 font-bold text-xs">{now}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section id="technology" className="py-32 px-8">
                    <div className="max-w-screen-2xl mx-auto">
                        <div className="mb-16">
                            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">A Business-Ready Tool</div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">No Expensive Hardware.<br />Real Results.</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/5 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {[
                                { n: '01', t: 'Zero Hardware', d: 'Our Engine understands the world using standard smartphone cameras. You don\'t need to buy expensive VR headsets or limiting sensors to deploy across your entire operation.', icon: '📸' },
                                { n: '02', t: 'Augmented Reality Guide', d: 'Faced with a faulty cable or incorrect assembly, the assistant shows on-screen exactly how to rotate, pull, and fix it — no need to browse boring 50-page PDF manuals.', icon: '🦾   ' },
                                { n: '03', t: 'Works Offshore and Offline', d: 'Many critical jobs occur in basements and ships without high-speed Wi-Fi. Our Edge AI model runs on the smartphone itself, guiding employees 100% offline.', icon: '🔌' },
                                { n: '04', t: 'Proof of Procedure', d: 'Tired of regulatory fines or lawsuits? Nexus data is cryptographically anchored, proving the exact date, time, and maneuver your technician utilized on site.', icon: '🔐' },
                            ].map((card) => (
                                <div key={card.n} className="p-12 hover:bg-white/[0.02] transition-colors group relative" style={{ background: '#0A0A0F' }}>
                                    <div className="absolute top-12 right-12 text-3xl opacity-20 filter grayscale">{card.icon}</div>
                                    <div className="font-mono text-emerald-500 mb-8 font-bold text-sm">{card.n}</div>
                                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter w-[85%]">{card.t}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed w-[90%]">{card.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="verticals" className="py-32 px-8" style={{ background: '#0e0e14' }}>
                    <div className="max-w-screen-2xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <h2 className="text-5xl font-black tracking-tight leading-none uppercase">Adopting Sectors</h2>
                            <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase font-bold">
                                {VERTICALS.map((vert, i) => (
                                    <button key={i} onClick={() => { setActiveVertical(i); }}
                                        className="px-5 py-2.5 transition-all outline-none rounded"
                                        style={{
                                            background: activeVertical === i ? '#10b981' : 'transparent',
                                            color: activeVertical === i ? '#000' : 'rgba(255,255,255,0.4)',
                                            border: `1px solid ${activeVertical === i ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                                        }}>
                                        {vert.tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-7">
                                <div className="relative aspect-video overflow-hidden border border-white/5 rounded-2xl" style={{ background: '#131318' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={v.imgSrc} alt={v.imgAlt}
                                        className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0F 0%, transparent 80%)' }} />
                                    <div className="absolute bottom-8 left-8">
                                        <span className="bg-emerald-500 text-black px-3 py-1 font-mono font-bold text-[10px] uppercase mb-4 inline-block">{v.badge}</span>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter">{v.title}</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-5 space-y-8">
                                <p className="text-xl text-slate-300 leading-relaxed font-medium">{v.desc}</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {v.metrics.map((m, j) => (
                                        <div key={j} className="p-5 border border-white/5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <div className="font-mono text-emerald-400 text-xl font-bold mb-1">{m.v}</div>
                                            <div className="font-mono text-[10px] text-white/40 uppercase">{m.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <Link href={activeVertical === 0 ? '/telecom' : '#contact'}>
                                    <button className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all mt-2 text-emerald-400 rounded-lg">
                                        Analyze Use Case →
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="economy" className="py-32 px-8">
                    <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">Operational Model</div>
                            <h2 className="text-5xl font-black tracking-tight leading-none mb-10 uppercase">
                                Cut Costs. <br /><span style={{ color: '#10b981' }}>Reduce Errors.</span>
                            </h2>
                            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                                A 30-day baseline contract lets you test Nexus on your front lines risk-free. We deliver daily KPIs with productivity improvement reports, fewer truck rolls, and real-time cost optimizations.
                            </p>
                            
                            <ul className="space-y-4">
                                {[
                                    '1 unified contract supports all enterprise training platforms',
                                    'Your best senior experts never have to leave the production line',
                                    'Billing based purely on active users and resolved service tickets'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { v: '$0', l: 'In Complex Hardware and VR Simulators' },
                                { v: '24/7', l: 'Digital Teacher Always by Your Tech\'s Side' },
                                { v: '3X', l: 'The ROI on Your Field Diagnostic Operations' },
                                { v: 'Pilot', l: 'Risk-Free One Month Trial with Your Team' },
                            ].map((card, i) => (
                                <div key={i} className="p-8 border border-white/5 flex flex-col justify-between aspect-square rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="text-5xl font-black text-emerald-500 mb-3">{card.v}</div>
                                    <div className="font-mono text-xs text-white/50 uppercase leading-relaxed font-bold">{card.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="patent" className="py-32 px-8 mb-10">
                    <div className="max-w-4xl mx-auto border border-emerald-500/20 p-12 text-center relative rounded-3xl" style={{ background: 'rgba(16,185,129,0.02)' }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full">
                            SIMPLIFIED AUDITS
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8 uppercase text-white">
                            Undeniable proof of<br />every field intervention.
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">
                            Say goodbye to paper checklists that nobody actually validates. Our ledger records cryptographic proofs regarding the physical job, preventing losses in warranty claims and litigation.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {['Fully compliant with the EU AI Act', 'Ready for ISO (45001) and OSHA standards', 'Strict Image Privacy and Anonymization'].map((b, i) => (
                                <span key={i} className="px-4 py-3 border border-white/10 bg-white/5 font-mono text-[10px] text-white/50 rounded-lg">{b}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contact" className="py-40 px-8 text-center" style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #0e0e14 100%)' }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-8 font-bold">B2B Pilot Slots Open</div>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-none uppercase">
                            Test Risk-Free.<br />Measure Impact in <span style={{ color: '#10b981' }}>30 days.</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                            Let our systems work for you today. We deploy rapidly so your operations team can start validating on the front line immediately.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/telecom">
                                <button className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-12 py-5 text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] rounded-xl active:scale-95">
                                    Simulate ROI in Telecom
                                </button>
                            </Link>
                            <a href="mailto:hello@nexusmotion.pt">
                                <button className="border border-white/10 hover:bg-white/5 font-bold px-12 py-5 text-sm uppercase tracking-widest transition-all text-slate-300 rounded-xl">
                                    Schedule Executive Meeting
                                </button>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/5 py-12" style={{ background: '#0A0A0F' }}>
                <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-screen-2xl mx-auto gap-6">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-black text-white">NEXUS<span className="text-emerald-500">MOTION</span></span>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                            © 2026 Nexus Motion · Advanced Operator Solutions.<br /> nexusmotion.pt
                        </p>
                    </div>
                    <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest font-bold">
                        <Link href="/telecom" className="text-slate-500 hover:text-emerald-400 transition-colors">Telecom AI</Link>
                        <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 transition-colors">Enter OS</Link>
                        <Link href="/verify" className="text-slate-500 hover:text-emerald-400 transition-colors">Verify Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
