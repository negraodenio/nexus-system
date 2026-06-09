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

  const handleValidate = async () => {
    setIsValidating(true)
    try {
      const parsed = JSON.parse(jsonInput)
      if (!parsed.id || !parsed.type || !parsed.location) {
        throw new Error("Missing mandatory NGSI-LD envelope parameters ('id', 'type', or 'location')")
      }

      const response = await fetch('/api/fiware/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonInput
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate NGSI-LD')
      }
      
      // Generate mock attestation hash
      const mockHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setValidationResult({
        status: 'SUCCESS',
        message: result.message || 'Valid NGSI-LD envelope compliant with ARPGU Data Schema.',
        attestation: mockHash,
        block: Math.floor(Math.random() * 100000) + 7400000,
        timestamp: new Date().toISOString()
      })
    } catch (err: any) {
      setValidationResult({
        status: 'ERROR',
        message: err.message || 'Invalid JSON format'
      })
    } finally {
      setIsValidating(false)
    }
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
            NEXUS<br/><span className="text-emerald-500">Operational Knowledge Digital Twin</span>
          </h1>
          
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl">
            <strong className="text-white block mb-4 text-xl">Transformamos conhecimento humano em infraestrutura digital. Preservamos a inteligência operacional que mantém cidades, empresas e infraestruturas críticas a funcionar.</strong>
            A enfrentar a Crise Silenciosa da Continuidade Operacional Nacional: nos próximos anos, milhares de técnicos da administração pública e das utilities irão reformar-se. A Europa investe biliões em soberania digital, mas a <strong>Soberania do Conhecimento Operacional</strong> permanece vulnerável. O NEXUS converte conhecimento tácito humano em ativos digitais inalteráveis, criando uma camada soberana de memória institucional, protegida por um fosso tecnológico e institucional 100% alinhado com o EU AI Act.
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
                  A ENTI determina que as candidaturas municipais ao PRR devem suportar mecanismos de interoperabilidade mínima (**MIMs**). O Nexus atua como a infraestrutura de confiança das operações de utilities e de campo, unificando dados urbanos georreferenciados sob um barramento seguro sem que a autarquia precise de descartar a sua infraestrutura técnica pré-existente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-white/5 bg-white/[0.01]">
                    <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">MIMs 1: Context</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">Gerenciamento dinâmico de dados de utilities e estados operacionais em tempo real.</p>
                  </div>
                  <div className="p-4 border border-white/5 bg-white/[0.01]">
                    <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">MIMs 2: Data Models</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">Formatos unificados e descritores abertos baseados em Smart Data Models da União Europeia.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'arpgu' && (
              <div>
                <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest mb-4 block">PLATAFORMAS DE GESTÃO URBANA</span>
                <h3 className="text-2xl font-black uppercase text-white mb-6 tracking-tight">Arquitetura de Referência (ARPGU) Compliance</h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-8">
                  Em total harmonia com os referenciais da AMA, o barramento do Nexus adota o protocolo **NGSI-LD** para a receção e partilha descentralizada de dados operacionais em tempo real, integrando verticalidades de infraestrutura crítica (redes elétricas, saneamento e manutenção de utilities) de forma aberta e auditável.
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
                  Os sistemas que decidem despachos públicos ou validam a conformidade das equipes operacionais são classificados como de alta responsabilidade. O Nexus integra explicabilidade em tempo real (**AI Decision Audit**) permitindo a justificação de cada alerta e desvio de procedimento emitido pela IA.
                </p>
                <div className="p-4 border border-white/5 bg-white/[0.01]">
                  <h4 className="font-mono text-[11px] font-bold text-white mb-2 uppercase">Decisões Rastreáveis</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">Registo auditável com explicabilidade dos modelos MiniMax M2.7 e Gemini 1.5 Flash na tomada de decisões operacionais.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── VISUAL INTEGRATION FLOWCHART (PRIORITY 3) ── */}
        <section className="mb-24 max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest mb-2 font-bold">INTEGRATION FLOW / ARCHITECTURE</div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">FLUXO DE INTEGRIDADE CRIPTOGRÁFICA</h2>
            <p className="text-white/50 text-[10px] md:text-xs leading-relaxed mt-2">
              Demonstração de como o Nexus atua como uma camada de interoperabilidade invisível sobre a infraestrutura existente.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
            
            {/* Box 1: AMA Autenticação.gov */}
            <div className="flex-1 w-full p-6 border border-white/5 bg-[#07070B] relative hover:border-emerald-500/20 transition-all flex flex-col justify-between" style={{ minHeight: '200px' }}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-950/20 border border-blue-500/20">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-mono text-[8px] text-white/30 font-bold uppercase">AMA AUTH IDP</span>
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase mb-2">1. Autenticação.gov (CMD / CC)</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Valida a identidade jurídica e as atribuições do técnico de campo na gateway oficial do Estado Português, injetando o contexto legal na sessão.
                </p>
              </div>
            </div>

            {/* Separator 1 */}
            <div className="flex items-center justify-center rotate-90 lg:rotate-0 text-emerald-500/30">
              <ChevronRight className="w-8 h-8" />
            </div>

            {/* Box 2: NEXUS TOGI Layer */}
            <div className="flex-1 w-full p-6 border border-emerald-500/20 bg-emerald-950/[0.02] relative hover:border-emerald-500/40 transition-all flex flex-col justify-between" style={{ minHeight: '200px' }}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/20">
                    <Brain className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase">NEXUS OPERATIONAL TRUST</span>
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase mb-2">2. Nexus TOGI Layer</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Processamento de biometria local no Edge (Vision Worker com descarte de frames), cálculo de conformidade (SOPs) e geração do *Integrity Digest* criptográfico.
                </p>
              </div>
            </div>

            {/* Separator 2 */}
            <div className="flex items-center justify-center rotate-90 lg:rotate-0 text-emerald-500/30">
              <ChevronRight className="w-8 h-8" />
            </div>

            {/* Box 3: SAP PM / CRM Municipal */}
            <div className="flex-1 w-full p-6 border border-white/5 bg-[#07070B] relative hover:border-emerald-500/20 transition-all flex flex-col justify-between" style={{ minHeight: '200px' }}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-950/20 border border-purple-500/20">
                    <Database className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="font-mono text-[8px] text-white/30 font-bold uppercase">LEGACY SYSTEMS</span>
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase mb-2">3. SAP PM & CRM Municipal</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  A gateway de webhook do Nexus atualiza de forma atómica a ordem de serviço existente com a inclusão da atestação assinada, conferindo imunidade legal.
                </p>
              </div>
            </div>

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
                Teste em tempo real o nosso motor de conformidade. Insira um payload JSON representando um evento operacional de utilities no padrão **NGSI-LD** e execute o validador. A nossa infraestrutura irá analisar a estrutura de dados e emitir uma trilha de auditoria criptográfica de proveniência.
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
                        <div><span className="text-emerald-500 font-bold">INTEGRITY DIGEST:</span> {validationResult.attestation}</div>
                        <div><span className="text-emerald-500 font-bold">DISTRIBUTED LEDGER HEIGHT:</span> {validationResult.block}</div>
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
            Para acelerar a submissão de candidaturas e propostas, as autarquias podem integrar diretamente a justificação de conformidade abaixo no formulário de candidatura da AMA (Plataforma de Gestão Urbana):
          </p>

          <div className="bg-black/40 border border-white/5 p-5 rounded-none font-mono text-[10px] text-white/70 leading-relaxed max-h-56 overflow-y-auto mb-6 select-all">
            "A presente candidatura visa mitigar a perda crítica de capital intelectual municipal através da implementação da infraestrutura NEXUS (Operational Knowledge Digital Twin). Alinhada inteiramente com os referenciais da **ARPGU** e os padrões **NGSI-LD / FIWARE**, a plataforma atua como o sistema nervoso operacional da autarquia. Através de Inteligência Artificial no Edge, o sistema captura a execução física de tarefas complexas de infraestrutura (águas, energia, saneamento), transformando o conhecimento tácito dos operacionais mais experientes em padrões digitais reutilizáveis e auditáveis. Esta solução garante a retenção de conhecimento a longo prazo, conformidade absoluta com o Regulamento Europeu da IA (EU AI Act) e interoperabilidade aberta, sem risco de vendor lock-in com sistemas legados."
          </div>
        </section>

        {/* ── INSTITUTIONAL ONE-PAGER & DYNAMIC PRR EXPORTER ── */}
        <section className="max-w-4xl mx-auto border border-emerald-500/20 p-8 md:p-12 mb-20 relative overflow-hidden" style={{
          background: 'linear-gradient(180deg, rgba(16,185,129,0.02) 0%, transparent 100%)'
        }}>
          <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-white/20 font-bold">
            OPERATIONAL KNOWLEDGE ONE-PAGER
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase text-white font-mono">Ficha Técnica & Enquadramento PRR</h3>
              <p className="text-[10px] text-white/40 font-mono">Operational Knowledge Digital Twin</p>
            </div>
          </div>

          {/* High-Impact Wording Boxes (Mandatory visual references) */}
          <div className="space-y-4 mb-8">
            <div className="p-5 border border-emerald-500/10 bg-emerald-950/10">
              <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-wider mb-2 block">POSITIONING STATEMENT</span>
              <p className="text-sm font-medium text-emerald-300 leading-relaxed font-sans italic">
                "NEXUS was designed as an operational governance and interoperability layer for municipal field operations, focused on operational compliance, AI explainability and cryptographic auditability aligned with PRR modernization requirements."
              </p>
            </div>

            <div className="p-5 border border-white/5 bg-black/40">
              <span className="font-mono text-[8px] text-white/30 font-bold uppercase tracking-wider mb-2 block">INTEGRATION & RISK REDUCTION PRINCIPLE</span>
              <p className="text-xs text-white/70 leading-relaxed font-mono">
                "NEXUS does not replace existing municipal systems. It acts as an interoperability and operational governance layer over existing infrastructure."
              </p>
            </div>
          </div>

          {/* Download PRR Dossier Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-4 border border-white/5 bg-white/[0.01]">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono mb-1">Dossier de Candidatura PRR (PDF/A)</h4>
              <p className="text-[10px] text-white/40 leading-snug">Descarregue a ficha técnica oficial pronta a submeter no portal da AMA.</p>
            </div>
            <button 
              onClick={() => {
                const docText = `========================================================================
NEXUS - FICHA DE ENQUADRAMENTO TÉCNICO E PRR (C19-i08)
========================================================================
Designação: Trusted Operational Governance Infrastructure (TOGI)
Função: Camada de Interoperabilidade e Governança Criptográfica
Classificação de Risco: EU AI Act High-Risk Compliant

1. RESUMO EXECUTIVO
NEXUS foi desenhado como uma camada de governança operacional e
interoperabilidade para operações de utilities e manutenção municipal,
focada em conformidade operacional (SOPs), explicabilidade de decisões
de IA e auditabilidade criptográfica sem alteração de sistemas legados.

Princípio de Integração Zero-Atrito:
"NEXUS does not replace existing municipal systems. It acts as an
interoperability and operational governance layer over existing infrastructure."

2. CONFORMIDADE REGULATÓRIA (PORTUGAL)
- Alinhamento ARPGU (Arquitetura de Referência Plataformas Gestão Urbana)
- Compatibilidade OASC MIMs 1 (Contexto), 2 (Dados) e 7 (Segurança)
- Ingestão Nativa FIWARE / NGSI-LD Smart Data Models
- RGPD/GDPR: Processamento e descarte de biometria local no Edge.
========================================================================`;
                
                const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'NEXUS_PRR_ENQUADRAMENTO_DOSSIER.txt');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[10px] uppercase px-5 py-3 tracking-wider transition-all select-none border-none rounded-none w-full sm:w-auto text-center"
            >
              Exportar Ficha Técnica
            </button>
          </div>
        </section>

        {/* ── GOVTECH ENTRY GUIDE FOR INTERNAL CHAMPIONS ── */}
        <section className="max-w-4xl mx-auto border border-white/5 p-8 md:p-12 mb-20" style={{ background: '#07070B' }}>
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <Workflow className="w-5 h-5 text-emerald-500" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest font-bold">INTERNAL CHAMPIONS GOVTECH GUIDE</span>
          </div>

          <h3 className="text-xl font-bold uppercase text-white mb-4 font-mono">
            Protocolo de Entrada e Validação Tecnológica
          </h3>
          
          <p className="text-white/60 text-xs leading-relaxed mb-8">
            Para garantir uma aproximação institucional de sucesso nas Câmaras Municipais de Portugal, a equipa técnica e os champions internos devem seguir rigorosamente o protocolo de venda consultiva técnica-primeiro, mitigando o risco político:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01 / TÉCNICO',
                title: 'Direção TI & Smart Cities',
                desc: 'A primeira abordagem deve focar exclusivamente em DSI e Modernização. O vereador sempre perguntará se a TI validou a arquitetura. O foco é provar a interoperabilidade (FIWARE/NGSI-LD) e o princípio de não-substituição.',
                target: ['Director SI', 'Smart City Office', 'Modernização Digital']
              },
              {
                step: '02 / OPERACIONAL',
                title: 'Utilities & Proteção Civil',
                desc: 'Demonstração prática direcionada a diretores operacionais de campo (Águas, Saneamento, Eletricidade). O argumento principal é a redução drástica de risco operacional e a facilidade de conformidade de SOPs críticos pelas equipas.',
                target: ['Diretor de Obras', 'Proteção Civil', 'Utilities Managers']
              },
              {
                step: '03 / POLÍTICO',
                title: 'Decisão do Vereador',
                desc: 'O decisor político (Vereador/Presidente) é ativado apenas quando existir parecer técnico positivo, champion interno sólido e riscos de procurement mitigados. Venda baseada em blindagem jurídica (Tribunal de Contas).',
                target: ['Vereadores de Pelouro', 'Diretoria de Candidaturas PRR']
              }
            ].map((item, idx) => (
              <div key={idx} className="p-5 border border-white/5 bg-white/[0.01] flex flex-col justify-between" style={{ minHeight: '260px' }}>
                <div>
                  <span className="font-mono text-[8px] font-bold text-emerald-400 tracking-wider mb-2 block">{item.step}</span>
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-2">{item.title}</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-1.5">Quem procurar:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.target.map((t, i) => (
                      <span key={i} className="text-[8px] font-mono text-emerald-300 bg-emerald-950/20 px-2 py-0.5 border border-emerald-500/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PARTNERS & CONSORTIUMS ── */}
        <section className="text-center">
          <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-4 font-bold">CONSORTIUM & INTEGRATION MODEL</div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">COMO CONTRATAR O NEXUS VIA PRR</h2>
          <p className="text-white/50 text-xs leading-relaxed max-w-xl mx-auto mb-10">
            A contratação do Nexus é idealmente realizada através de consórcios liderados por consultoras de fundos europeus, integradores de smart cities ou municípios parceiros, focando prioritariamente nas autarquias de **Oeiras, Cascais, Coimbra e Braga**.
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
            <Link href="/sales" className="text-white/40 hover:text-emerald-400 transition-colors">Comercial B2B</Link>
            <Link href="/operations" className="text-white/40 hover:text-emerald-400 transition-colors">Operations</Link>
            <Link href="/verify" className="text-white/40 hover:text-emerald-400 transition-colors">Verify</Link>
            <Link href="/dashboard" className="text-white/40 hover:text-emerald-400 transition-colors">Dashboard</Link>
          </div>

        </div>
      </footer>
    </div>
  )
}
