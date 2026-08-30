'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import { AuthButton } from '@/components/auth-button'
import {
  Shield,
  Cpu,
  ArrowRight,
  Check,
  AlertTriangle,
  Sparkles,
  Eye,
  Hand,
  Smartphone,
  Target,
  Wrench,
  Plug,
  Hammer,
} from 'lucide-react'

const NICHES = [
  { icon: '👨‍👧', title: 'Father + Son', tagline: 'Teach what you know.', desc: 'A father teaches his son to build, fix, or make something. Nexus turns that knowledge into guidance the son can actually follow.', color: '#38BDF8' },
  { icon: '🔧', title: 'Plumber', tagline: "Your knowledge doesn't have to stay with you.", desc: 'A professional records how to replace a faucet. Another professional — or a customer — follows the step-by-step guided by Nexus.', color: '#2563EB' },
  { icon: '🥖', title: 'Bakery', tagline: 'Turn experience into standard.', desc: 'An experienced baker teaches a preparation. The new employee is guided during execution. Far more effective than a manual.', color: '#2563EB' },
  { icon: '🏭', title: 'Maintenance', tagline: 'Less dependence on specialists.', desc: 'An experienced technician demonstrates a procedure. Other technicians reproduce it with real-time guidance.', color: '#2563EB' },
  { icon: '📡', title: 'Telecom', tagline: 'Bring the best experience to the whole team.', desc: 'Your best technicians experience, available to the entire team. Reduce errors, accelerate training.', color: '#38BDF8' },
  { icon: '🏠', title: 'Everyday', tagline: 'When you need to do something, Nexus is with you.', desc: 'Replace a faucet. Assemble furniture. Set up a modem. Install a part. Small everyday repairs.', color: '#38BDF8' },
]

const JOURNEY_STEPS = [
  { icon: AlertTriangle, label: "I don't know how to do this.", desc: 'You have a problem. You don\'t know how to solve it.', emotion: 'frustration' },
  { icon: Smartphone, label: 'Open Nexus.', desc: 'Point your camera at your hands.', emotion: 'curiosity' },
  { icon: Eye, label: 'See the guidance.', desc: 'Someone does it. You understand what to do.', emotion: 'understanding' },
  { icon: Hand, label: 'Try it yourself.', desc: 'Nexus guides your movements in real time.', emotion: 'action' },
  { icon: Target, label: 'Improve each time.', desc: 'The score shows your progress. Every attempt gets better.', emotion: 'growth' },
  { icon: Check, label: 'Complete the task.', desc: "Done. You learned. You can do it again on your own.", emotion: 'completion' },
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

      {/* HEADER */}
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
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#niches" className="hover:text-blue-400 transition-colors">Use Cases</a>
            <a href="#for-people" className="hover:text-blue-400 transition-colors">For People</a>
            <a href="#for-business" className="hover:text-blue-400 transition-colors">For Business</a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">Technology</a>
          </nav>

          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="pt-20">

        {/* 1. HERO */}
        <section className="relative min-h-[90vh] md:min-h-[95vh] flex flex-col justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0">
            <img
              src="/images/nexus/NovafotoPaieFilho.png"
              alt="Father and son learning with Nexus Motion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1A] via-[#0A0F1A]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-transparent to-[#0A0F1A]/50" />
          </div>

          <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-12 py-20 md:py-24">
            <div className="max-w-xl lg:max-w-2xl">
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
                className="font-black tracking-tighter leading-[0.95] mb-6"
              >
                <span className="block text-[clamp(2.5rem,6vw,5.5rem)]">ONE PERSON KNOWS.</span>
                <span className="block text-[clamp(2.5rem,6vw,5.5rem)]" style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>NEXUS MAKES IT</span>
                <span className="block text-[clamp(2.5rem,6vw,5.5rem)]">TEACHABLE.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-white/70 max-w-lg mb-10 leading-relaxed"
              >
                Turn real-world expertise into guided action.
                <br />
                Watch someone do it. Then do it yourself, with real-time guidance.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-none flex items-center gap-2">
                    See How It Works
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
                <a href="#niches" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto border border-white/20 hover:bg-white/5 font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all text-white rounded-none hover:border-blue-500/30">
                    Real-Life Use Cases
                  </button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 md:mt-16 flex flex-wrap gap-6 md:gap-8 text-[10px] text-white/50 font-mono uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400/60" />
                  <span>Just your phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400/60" />
                  <span>AI-guided</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400/60" />
                  <span>Learn by doing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400/60" />
                  <span>Shareable knowledge</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. REAL-LIFE GRID */}
        <section className="py-16 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-black tracking-tight leading-none uppercase">
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
                src="/images/nexus/Comofazer.png"
                alt="People using Nexus Motion to learn and perform real-world skills with smartphone guidance"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">The Journey</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none uppercase">
                DON'T KNOW HOW.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>NOW YOU DO.</span>
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

        {/* 4. USE CASES */}
        <section id="niches" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Real Situations</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none uppercase">WHERE NEXUS CHANGES LIVES.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                Nexus isn't an abstract tool. It solves real problems for real people.
                See how it fits into your life and your work.
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

        {/* 5. FOR PEOPLE */}
        <section id="for-people" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">For People</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-tight mb-6">
                LEARN ANYTHING BY DOING.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                The father who wants to teach his son. The neighbor who knows how to fix something.
                The person who wants to learn a repair.
                Nexus turns any practical knowledge into guidance that works.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Assemble IKEA furniture without the headache',
                  'Replace a faucet or fix a pipe',
                  'Set up a modem or router',
                  'Learn a baker\'s recipe',
                  'Install something you bought online',
                  'Learn a hobby from someone who knows',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-none" />
                    <span className="text-white/80 text-xs font-mono">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border border-blue-500/20 bg-blue-950/10">
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-2 font-bold">The idea is simple:</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  Someone knows how. Nexus turns that knowledge into guidance.
                  <br />
                  You execute. Nexus guides. You learn.
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-blue-500/20 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-6 font-bold">HOW IT WORKS FOR YOU</div>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Someone records', desc: 'A family member, friend, or professional shows how to do it.' },
                    { step: '02', title: 'Nexus understands', desc: 'Turns the video into clear steps and guidance.' },
                    { step: '03', title: 'You watch', desc: 'See the guidance before you try.' },
                    { step: '04', title: 'You try', desc: 'Nexus guides your movements as you do it.' },
                    { step: '05', title: 'You succeed', desc: 'Completed the task. You can do it again on your own.' },
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

        {/* 6. FOR BUSINESS */}
        <section id="for-business" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="border border-white/5 p-6 md:p-8 relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-6 font-bold">YOUR BEST EMPLOYEE TEACHES EVERYONE</div>
                <div className="space-y-4">
                  {[
                    { icon: Wrench, title: 'Experienced plumber', desc: 'Records how they do it. The whole team learns.' },
                    { icon: Cpu, title: 'Maintenance technician', desc: 'Demonstrates the procedure. Others reproduce it.' },
                    { icon: Plug, title: 'Telecom technician', desc: 'The experience goes to the whole team.' },
                    { icon: Hammer, title: 'Construction worker', desc: 'Knowledge stays with the company, not with one person.' },
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
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">For Business</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-tight mb-6">
                TURN EXPERTISE INTO SCALE.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Your best professionals hold valuable knowledge. Nexus captures it once and scales it across the entire team.
                Train faster. Reduce errors. Prove compliance.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Training', value: '5x faster', desc: 'New hires reach competence faster' },
                  { label: 'Errors', value: '-80%', desc: 'Guidance prevents mistakes' },
                  { label: 'Compliance', value: '100%', desc: 'Every execution is verified' },
                  { label: 'Knowledge loss', value: '$0', desc: 'Expertise stays with the company' },
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

        {/* 7. COMPARISON */}
        <section className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">The Difference</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none uppercase">NOT JUST VIDEO. IT'S GUIDANCE.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#0A0F1A' }}>
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">YouTube / Traditional Training</div>
                <h3 className="text-3xl font-black text-white/30 mb-6 line-through">WATCH</h3>
                <ul className="space-y-3">
                  {[
                    'You watch passively',
                    'You don\'t know if you\'re doing it right',
                    'You forgot the next step',
                    'No verification',
                    'Knowledge stays in the video',
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
                }}>WATCH → TRY → GUIDE → SUCCEED</h3>
                <ul className="space-y-3">
                  {[
                    'You watch and understand',
                    'You try it yourself with guidance',
                    'Nexus guides every movement',
                    'Real-time verification',
                    'Knowledge stays with you',
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

        {/* 8. TECHNOLOGY */}
        <section id="technology" className="py-24 px-6 border-b border-white/5" style={{ backgroundColor: '#0D1321' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Technology</div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-none uppercase">HOW IT WORKS UNDERNEATH.</h2>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                You don't need to know this to use Nexus. But if you want to understand the technology, it's here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-5xl mx-auto">
              <div className="p-8 md:p-12" style={{ background: '#0D1321' }}>
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Pipeline</div>
                <div className="space-y-3">
                  {[
                    { step: 'detect()', desc: 'Hand tracking + pose estimation', icon: Hand },
                    { step: 'decompose()', desc: 'AI step segmentation', icon: Cpu },
                    { step: 'skeletonize()', desc: 'Golden Skeleton generation', icon: Sparkles },
                    { step: 'align()', desc: 'Real-time pose matching', icon: Target },
                    { step: 'verify()', desc: 'Execution comparison + proof', icon: Shield },
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
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Devices</div>
                <div className="space-y-3">
                  {[
                    { tier: 'SMARTPHONE', desc: 'Standard camera + 2D skeleton', hardware: 'Any smartphone', note: 'All you need to start' },
                    { tier: 'DEPTH / LIDAR', desc: 'Depth camera + 3D skeleton', hardware: 'LiDAR / ToF device', note: 'Enhanced experience' },
                    { tier: 'PROFESSIONAL', desc: 'Full Stera SDK capture', hardware: 'Stera-compatible device', note: 'Professional pipeline' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-mono text-[11px] text-blue-400 font-bold uppercase tracking-wider">{item.tier}</div>
                        <div className="font-mono text-[9px] text-white/30">{item.hardware}</div>
                      </div>
                      <div className="text-[10px] text-white/40">{item.desc}</div>
                      <div className="text-[9px] text-blue-400/60 mt-1 font-mono">{item.note}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 border border-blue-500/20 bg-blue-950/10">
                  <p className="text-white/60 text-xs leading-relaxed">
                    Nexus works with any smartphone. No special equipment needed.
                    The more advanced the device, the richer the experience — but you can start right now with what you have.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA */}
        <section className="py-24 md:py-32 px-6 text-center relative overflow-hidden" style={{ backgroundColor: '#0A0F1A' }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_60%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto z-10 relative">
            <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-4 font-bold">Get Started</div>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-tighter uppercase mb-6 leading-none">
              WHAT WILL YOU<br />
              <span style={{
                background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>TEACH NEXUS?</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              Every expert has knowledge worth capturing.
              Every skill deserves to be taught with precision.
              Start building your skill library today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a href="#niches" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-none">
                  Request a Demo
                </button>
              </a>
              <a href="#for-business" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-white/20 hover:bg-white/5 font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all text-white rounded-none hover:border-blue-500/30">
                  For Business →
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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
              © 2026 Nexus Motion · nexusmotion.pt · Proprietary technology in development
            </span>
          </div>

          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest font-bold">
            <a href="#how-it-works" className="text-white/40 hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#niches" className="text-white/40 hover:text-blue-400 transition-colors">Use Cases</a>
            <a href="#for-people" className="text-white/40 hover:text-blue-400 transition-colors">For People</a>
            <a href="#for-business" className="text-white/40 hover:text-blue-400 transition-colors">For Business</a>
            <a href="#technology" className="text-white/40 hover:text-blue-400 transition-colors">Technology</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
