'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Brain, 
  Shield, 
  Layers, 
  Cpu, 
  Database, 
  Check, 
  FileText, 
  ArrowLeft, 
  Terminal, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Workflow
} from 'lucide-react'

// ── Standards Mock Data ──
const COMPLIANCE_ITEMS = [
  {
    title: 'ARPGU Interoperability',
    desc: 'Alignment with the Reference Architecture for Urban Management Platforms (ARPGU) of the Portuguese government.',
    status: 'COMPLIANT'
  },
  {
    title: 'FIWARE & NGSI-LD',
    desc: 'Fully compatible event bus structure utilizing standardized FIWARE Smart Data Models and NGSI-LD API ingestion.',
    status: 'NATIVE'
  },
  {
    title: 'OASC MIMs (Minimal Interoperability)',
    desc: 'Integration of MIMs 1 (Context), 2 (Data Models), and 7 (Security) standards promoted by Open & Agile Smart Cities.',
    status: 'CERTIFIED'
  },
  {
    title: 'EU AI Act Explainability',
    desc: 'Explainable AI Decision Audit trace logging to meet safety-critical transparency rules for local government operations.',
    status: 'READY'
  }
]

export default function PublicSectorPage() {
  const [activeTab, setActiveTab] = useState<'enti' | 'arpgu' | 'ai-act'>('enti')
  const [jsonInput, setJsonInput] = useState(
`{
  "id": "urn:ngsi-ld:UrbanDevice:Lisboa:Sensor-382",
  "type": "UrbanDevice",
  "category": ["environmental"],
  "location": {
    "type": "Point",
    "coordinates": [38.7223, -9.1393]
  },
  "airQualityIndex": {
    "type": "Property",
    "value": 84.5
  }
}`
  )
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleValidate = () => {
    setIsValidating(true)
    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonInput)
        if (!parsed.id || !parsed.type || !parsed.location) {
          throw new Error("Missing mandatory NGSI-LD envelope parameters ('id', 'type', or 'location')")
        }
        
        // Generate mock attestation hash
        const mockHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setValidationResult({
          status: 'SUCCESS',
          message: 'Valid NGSI-LD envelope compliant with ARPGU Data Schema.',
          attestation: mockHash,
          block: Math.floor(Math.random() * 100000) + 7400000,
          timestamp: new Date().toISOString()
        })
      } catch (err: any) {
        setValidationResult({
          status: 'ERROR',
          message: err.message || 'Invalid JSON format'
        })
      }
      setIsValidating(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black" style={{
      backgroundColor: '#0A0A0F',
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.015) 1px, transparent 1px)',
      backgroundSize: '45px 45px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* ── HEADER ── */}
      <header className="sticky top-0 w-full z-50 border-b border-white/5" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-emerald-950/30 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                <Brain className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-base font-black tracking-widest text-white">NEXUS</span>
              <span className="font-mono text-[9px] text-emerald-500 font-bold border border-emerald-500/20 px-2 py-0.5 ml-2">PUBLIC SECTOR</span>
            </Link>
          </div>

          <Link href="/operations">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[11px] uppercase px-5 py-3 tracking-wider transition-all active:scale-95 border-none shadow-[0_4px_20px_rgba(16,185,129,0.15)] rounded-none">
              Enter Mission Control
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-16">
        
        {/* ── HERO / TITLE ── */}
        <section className="mb-20 text-center md:text-left max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 border border-emerald-500/20 px-3.5 py-1.5 bg-emerald-950/20 backdrop-blur-sm rounded-none">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-emerald-400 font-bold">
              PRR COMPONENT C19-i08 COMPLIANCE DOSSIER
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight mb-6">
            Trusted Operational Infrastructure for Smart Public Operations
          </h1>
          
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl">
            Nexus provides the open, compliant, and cryptographically audit-ready interoperability bus that allows Portuguese municipalities to capture and deploy 100% of C19-i08 PRR funds.
          </p>
        </section>

        {/* ── DYNAMIC SPEC / DIRECTIVES TAB SECTION ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          <div className="lg:col-span-4 space-y-3">
            <div className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-4">FUNDING & ALIGNMENT CRITERIA</div>
            
            {[
              { id: 'enti', title: 'ENTI Strategy alignment', label: 'Estratégia Territórios Inteligentes' },
              { id: 'arpgu', title: 'ARPGU Framework specs', label: 'Arquitetura de Referência PGU' },
              { id: 'ai-act', title: 'EU AI Act transparency', label: 'IA Responsável e Auditável' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="w-full text-left p-5 border transition-all rounded-none font-mono flex items-center justify-between group"
                style={{
                  backgroundColor: activeTab === tab.id ? '#07070B' : '#0A0A0F',
                  borderColor: activeTab === tab.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                  borderLeftWidth: activeTab === tab.id ? '3px' : '1px',
                  borderLeftColor: activeTab === tab.id ? '#10b981' : 'rgba(255,255,255,0.05)'
                }}
              >
                <div>
                  <div className="text-[9px] text-white/20 uppercase tracking-widest group-hover:text-emerald-500/60 transition-colors mb-1">{tab.title}</div>
                  <div className="text-xs font-bold text-white uppercase group-hover:text-white transition-colors">{tab.label}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 border border-white/5 p-8 md:p-12" style={{ background: '#07070B' }}>
            {activeTab === 'enti' && (
              <div>
                <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest mb-4 block">PORTUGAL DIGITAL DIRECTIVE</span>
                <h3 className="text-2xl font-black uppercase text-white mb-6 tracking-tight">Estratégia Nacional para os Territórios Inteligentes</h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-8">
                  A ENTI determina que as candidaturas municipais ao PRR devem suportar mecanismos de interoperabilidade mínima (**MIMs**). O Nexus é construído sob esse pressuposto, unificando dados urbanos georreferenciados sem que o município precise de deitar fora a sua infraestrutura técnica pré-existente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-white/5 bg-white/[0.01]">
                    <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">MIMs 1: Context</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">Gerenciamento dinâmico de dados geográficos e estados urbanos em tempo real.</p>
                  </div>
                  <div className="p-4 border border-white/5 bg-white/[0.01]">
                    <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">MIMs 2: Data Models</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">Formatos unificados e descritores abertos FIWARE sem risco de vendor lock-in.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'arpgu' && (
              <div>
                <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest mb-4 block">PLATAFORMAS DE GESTÃO URBANA</span>
                <h3 className="text-2xl font-black uppercase text-white mb-6 tracking-tight">Arquitetura de Referência (ARPGU) Compliance</h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-8">
                  Em total harmonia com os referenciais da AMA, o barramento do Nexus adota o protocolo **NGSI-LD** para a receção e partilha descentralizada de dados em tempo real, integrando verticalidades essenciais como trânsito, proteção civil e telecomunicações municipais de forma aberta.
                </p>
                <div className="p-4 border border-emerald-500/10 bg-emerald-950/10 flex items-start gap-4">
                  <Workflow className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-mono text-xs font-bold text-emerald-400 mb-1 uppercase">ARPGU Open Connectors</h4>
                    <p className="text-[10px] text-emerald-300/70 leading-relaxed">Permite a livre exportação e importação de bases de dados via APIs estruturadas, respeitando o princípio de dados abertos.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-act' && (
              <div>
                <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest mb-4 block">REGULAMENTO EUROPEU DA IA</span>
                <h3 className="text-2xl font-black uppercase text-white mb-6 tracking-tight">IA Responsável, Explicável e Auditável</h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-8">
                  Os sistemas inteligentes de inteligência operacional que decidem despachos públicos ou identificam anomalias urbanas são classificados como de alta responsabilidade. O Nexus integra explicabilidade em tempo real (**AI Decision Audit**) permitindo a justificação de cada alerta emitido pela IA.
                </p>
                <div className="p-4 border border-white/5 bg-white/[0.01]">
                  <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">Decisões Rastreáveis</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">Registo auditável com explicabilidade dos modelos MiniMax M2.7 e Gemini 1.5 Flash na tomada de decisões urbanas.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── STANDARDS GRID ── */}
        <section className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest mb-2 font-bold">GOVERNMENT STANDARD FRAMEWORK</div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">CONFORMIDADE REGULATÓRIA NATIVA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPLIANCE_ITEMS.map((item, idx) => (
              <div key={idx} className="p-6 border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[9px] font-bold text-emerald-500 tracking-wider bg-emerald-950/40 px-2.5 py-1 border border-emerald-500/10">
                      {item.status}
                    </span>
                    <span className="text-[8px] font-mono text-white/20 font-bold">NXM-REG-0{idx+1}</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase mb-2">{item.title}</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE NGSI-LD VALIDATOR SIMULATION (SENIOR SHOWCASE) ── */}
        <section className="py-12 px-6 border border-emerald-500/20 mb-24 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, transparent 100%)'
        }}>
          <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-white/20 font-bold">
            MIMs 2 DATA STRUCT VALIDATOR
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 inline-block mb-4">
                <ClipboardCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
                Testador de Interoperabilidade PGU
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Teste em tempo real o nosso motor de conformidade. Insira um payload JSON representando um sensor municipal no padrão **NGSI-LD** e execute o validador. A nossa infraestrutura irá analisar a estrutura de dados e emitir uma trilha de auditoria criptográfica.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[9px] text-emerald-500/80 font-bold uppercase">Government Interop Ready</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-white/5 bg-[#020205] p-4 font-mono">
                <div className="text-[10px] text-white/30 uppercase tracking-wider pb-3 border-b border-white/5 mb-3 flex justify-between items-center">
                  <span>INPUT_PAYLOAD.JSON</span>
                  <span className="text-emerald-500 font-bold">EDITABLE</span>
                </div>
                
                <textarea 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-44 bg-transparent border-none text-[11px] text-white/90 focus:ring-0 focus:outline-none font-mono resize-none"
                  spellCheck="false"
                />

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-[9px] text-white/20">FIWARE-SCHEMA-V2</span>
                  <button 
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[10px] uppercase px-4 py-2 disabled:opacity-50 transition-all"
                  >
                    {isValidating ? 'Validating Schema...' : 'Validate NGSI-LD'}
                  </button>
                </div>

                {validationResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 border text-[10px] ${validationResult.status === 'SUCCESS' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}
                  >
                    <div className="font-bold uppercase tracking-wider mb-1">{validationResult.status}: {validationResult.message}</div>
                    {validationResult.attestation && (
                      <div className="space-y-1 mt-2 text-white/60 font-mono text-[9px]">
                        <div><span className="text-emerald-500 font-bold">LEDGER HASH:</span> {validationResult.attestation}</div>
                        <div><span className="text-emerald-500 font-bold">POLYGON BLOCK:</span> {validationResult.block}</div>
                        <div><span className="text-emerald-500 font-bold">TIMESTAMP:</span> {validationResult.timestamp}</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── PITCH / CANIDACY READY TEMPLATE ── */}
        <section className="max-w-4xl mx-auto border border-white/5 p-8 md:p-12 mb-20" style={{ background: '#07070B' }}>
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <FileText className="w-5 h-5 text-emerald-500" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest font-bold">CANDIDACY TECHNICAL PITCH TEMPLATE</span>
          </div>

          <h3 className="text-xl font-bold uppercase text-white mb-4 font-mono">
            Justificação Técnica para Concursos Públicos e PRR
          </h3>
          
          <p className="text-white/60 text-xs leading-relaxed mb-6">
            Para acelerar a submissão de propostas, os municípios podem integrar diretamente a justificação de conformidade abaixo no formulário de candidatura da AMA:
          </p>

          <div className="bg-black/40 border border-white/5 p-5 rounded-none font-mono text-[10px] text-white/70 leading-relaxed max-h-56 overflow-y-auto">
            "A presente candidatura visa a modernização e transição digital do Município através da implementação da Plataforma de Gestão Urbana **NEXUS**. Alinhada inteiramente com os referenciais da **ARPGU** e os padrões **NGSI-LD / FIWARE**, a plataforma unifica os barramentos de tráfego, telecomunicações e sensores de proteção civil sob um mesmo painel de inteligência operacional em tempo real. Com um inovador sistema de registo de conformidade e auditoria matemática de decisões por ledger digital, a solução garante soberania total de dados municipais, conformidade absoluta com o Regulamento Europeu da IA (EU AI Act) e interoperabilidade aberta sem risco de vendor lock-in."
          </div>
        </section>

        {/* ── PARTNERS & CONSORTIUMS ── */}
        <section className="text-center">
          <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">CONSORTIUM & INTEGRATION MODEL</div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">COMO CONTRATAR O NEXUS VIA PRR</h2>
          <p className="text-white/50 text-xs leading-relaxed max-w-xl mx-auto mb-10">
            A contratação do Nexus é idealmente feita através de consórcios liderados por consultoras de fundos europeus, integradores de smart cities ou municípios parceiros.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { role: 'MUNICIPALITIES', action: 'Direct procurement or intermunicipal consortia (CIM)' },
              { role: 'CONSULTANCIES', action: 'Strategic integration into PRR regional programs' },
              { role: 'INTEGRATORS', action: 'Smart City infrastructure layer partnerships' }
            ].map((p, idx) => (
              <div key={idx} className="p-6 border border-white/5 bg-white/[0.01] hover:border-emerald-500/20 transition-all flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">{p.role}</span>
                <span className="text-[10px] text-white/40 leading-snug">{p.action}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6 mt-24" style={{ background: '#07070B' }}>
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
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
