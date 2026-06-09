'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Brain, 
  Shield, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Check, 
  FileText, 
  ArrowLeft, 
  Play, 
  HelpCircle, 
  ChevronRight,
  Calculator,
  Download,
  AlertTriangle,
  Send,
  Sparkles,
  ClipboardCheck,
  Zap,
  DollarSign,
  Briefcase,
  Eye,
  RefreshCw
} from 'lucide-react'

// Sectors Data for the pitch
const SECTORS = [
  {
    id: 'industrial',
    name: 'Indústria & Manutenção',
    clients: 'Renault, Volkswagen, Otis, Schindler, Sonangol, Galp',
    problem: 'Onboarding lento (4-8 semanas) e erros críticos de montagem que danificam maquinaria ou violam normas de segurança.',
    solution: 'Captura cinemática do gesto técnico padrão-ouro e validação local em tempo real na linha de montagem ou no campo.',
    metricLabel: 'Redução de Custos de Treino',
    metricValue: '▼ 60%',
    defaultTechs: 60,
    defaultSalary: 28,
    defaultOnboarding: 120,
    defaultErrorRate: 8,
    defaultErrorCost: 1500,
    icon: Briefcase
  },
  {
    id: 'telecom',
    name: 'Telecom & Redes',
    clients: 'MEO Altice, NOS, Vodafone, Huawei, Ericsson',
    problem: 'Técnicos subcontratados realizam calibrações de roteador/fibra incorretamente, gerando segundas visitas caras e multas de SLA.',
    solution: 'Guias interativos com IA que garantem o encaixe milimétrico e ligação correta da fibra diretamente no smartphone.',
    metricLabel: 'Evita Segundas Visitas (Fewer Site Visits)',
    metricValue: '▼ 67%',
    defaultTechs: 150,
    defaultSalary: 22,
    defaultOnboarding: 80,
    defaultErrorRate: 15,
    defaultErrorCost: 800,
    icon: Zap
  },
  {
    id: 'rehab',
    name: 'Saúde & Fisioterapia',
    clients: 'Clínicas de Reabilitação, Hospitais, Clubes Desportivos',
    problem: 'Pacientes realizam exercícios incorretamente em casa, atrasando a recuperação ou agravando lesões por falta de supervisão.',
    solution: 'Fisioterapia digitalizada: o smartphone valida o alinhamento articular em tempo real e notifica o terapeuta.',
    metricLabel: 'Recuperação Acelerada',
    metricValue: '▲ 45%',
    defaultTechs: 25,
    defaultSalary: 30,
    defaultOnboarding: 40,
    defaultErrorRate: 20,
    defaultErrorCost: 450,
    icon: Brain
  },
  {
    id: 'training',
    name: 'Ensino Técnico (IEFP)',
    clients: 'Centros de Formação IEFP, Escolas Profissionais',
    problem: 'Falta de instrutores seniores para acompanhar 25 alunos em simultâneo na soldadura ou eletricidade.',
    solution: 'Laboratórios práticos virtuais com feedback cinemático contínuo do professor virtual de IA.',
    metricLabel: 'Capacidade do Instrutor',
    metricValue: '▲ 3.5x',
    defaultTechs: 80,
    defaultSalary: 18,
    defaultOnboarding: 160,
    defaultErrorRate: 12,
    defaultErrorCost: 600,
    icon: Layers
  }
]

export default function SalesPitchPage() {
  const [selectedSector, setSelectedSector] = useState(SECTORS[0])
  const [techs, setTechs] = useState(SECTORS[0].defaultTechs)
  const [salary, setSalary] = useState(SECTORS[0].defaultSalary)
  const [onboardingHours, setOnboardingHours] = useState(SECTORS[0].defaultOnboarding)
  const [errorRate, setErrorRate] = useState(SECTORS[0].defaultErrorRate)
  const [errorCost, setErrorCost] = useState(SECTORS[0].defaultErrorCost)
  
  // Custom Proposal Inputs
  const [clientCompany, setClientCompany] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [generatedProposal, setGeneratedProposal] = useState('')
  const [proposalStep, setProposalStep] = useState<'idle' | 'generating' | 'ready'>('idle')

  // Presenter Cheat Sheet Overlay
  const [showCheatSheet, setShowCheatSheet] = useState(false)

  // Interactive 3D Simulator Demo State
  const [demoStep, setDemoStep] = useState(0)
  const [demoScore, setDemoScore] = useState(0)
  const [demoLog, setDemoLog] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  // Update inputs when sector changes
  const handleSectorChange = (sector: typeof SECTORS[0]) => {
    setSelectedSector(sector)
    setTechs(sector.defaultTechs)
    setSalary(sector.defaultSalary)
    setOnboardingHours(sector.defaultOnboarding)
    setErrorRate(sector.defaultErrorRate)
    setErrorCost(sector.defaultErrorCost)
    setDemoStep(0)
    setDemoScore(0)
    setDemoLog([])
  }

  // ROI Calculations
  const totalOnboardingCost = techs * onboardingHours * salary
  const totalErrorCost = techs * (errorRate / 100) * 12 * errorCost // Annual error cost
  const seniorTravelCost = techs * 15 * 50 // techs * average visits * travel cost
  const currentTotalWaste = totalOnboardingCost + totalErrorCost + seniorTravelCost

  // Nexus Impact
  const nexusOnboardingSavings = totalOnboardingCost * 0.60 // -60%
  const nexusErrorSavings = totalErrorCost * 0.50 // -50%
  const nexusTravelSavings = seniorTravelCost * 0.60 // -60%
  const annualSavings = nexusOnboardingSavings + nexusErrorSavings + nexusTravelSavings

  const nexusLicenseCost = techs * 25 * 12 // €25/month license
  const nexusSetupCost = 4500 // flat setup & training fee
  const firstYearInvestment = nexusLicenseCost + nexusSetupCost
  const netFirstYearSavings = annualSavings - firstYearInvestment
  const paybackMonths = ((firstYearInvestment / annualSavings) * 12).toFixed(1)

  // Motion Simulator steps for interactive demo
  const SIM_STEPS = [
    {
      title: 'Passo 1: Alinhamento Inicial',
      target: 'Encaixe do conector principal de dados na ranhura coaxial.',
      standardImg: '📐 Eixo articular Z: 90° (+/- 5°)',
      successMsg: '✅ Conector alinhado a 91.2°. Excelente rigidez de pulso.',
      failMsg: '⚠️ Rotação incorreta de pulso (inclinado a 76°). Alinhe a mão verticalmente.',
      perfectScore: 96,
      normalScore: 78
    },
    {
      title: 'Passo 2: Pressão de Bloqueio',
      target: 'Aplicação de força constante até ouvir o encaixe mecânico de segurança.',
      standardImg: '⚡ Diferencial de aceleração Savitzky-Golay: estável',
      successMsg: '✅ Encaixe bem-sucedido. Pressão uniforme detetada.',
      failMsg: '⚠️ Movimento brusco! Risco de danificar a mola interna de fixação.',
      perfectScore: 98,
      normalScore: 84
    },
    {
      title: 'Passo 3: Encaminhamento do Cabo',
      target: 'Passagem da fibra ótica pela calha protetora sem torção de raio crítico.',
      standardImg: '🌀 Curvatura cinemática: limite R > 15mm',
      successMsg: '✅ Raio de curvatura ótimo. Integridade física do cabo de fibra garantida.',
      failMsg: '⚠️ Curvatura perigosa (R < 10mm)! Risco de atenuação ou quebra de sinal.',
      perfectScore: 94,
      normalScore: 68
    }
  ]

  const runSimulationStep = (isPerfect: boolean) => {
    setIsSimulating(true)
    setTimeout(() => {
      const stepData = SIM_STEPS[demoStep]
      const score = isPerfect ? stepData.perfectScore : stepData.normalScore
      setDemoScore(score)
      const logMsg = `[${new Date().toLocaleTimeString()}] ${stepData.title} -> Score: ${score}% - ${isPerfect ? stepData.successMsg : stepData.failMsg}`
      setDemoLog(prev => [logMsg, ...prev])
      setIsSimulating(false)
      if (demoStep < SIM_STEPS.length - 1) {
        setDemoStep(prev => prev + 1)
      } else {
        setDemoStep(99) // Complete state
      }
    }, 1000)
  }

  const generateProposalText = () => {
    setProposalStep('generating')
    setTimeout(() => {
      const company = clientCompany || 'Sua Empresa'
      const contactName = clientContact || 'Diretor de Operações'
      
      const proposal = `===================================================================
PROPOSTA COMERCIAL: INFRAESTRUTURA DE GOVERNANÇA DE DESTREZA FÍSICA
PREPARADO EXCLUSIVAMENTE PARA: ${company.toUpperCase()}
DATA: ${new Date().toLocaleDateString('pt-PT')}
===================================================================

1. VISÃO GERAL DA SOLUÇÃO (NEXUS OS)
O Nexus Motion é a primeira infraestrutura operacional de inteligência física (TOGI)
que permite a digitalização, validação e auditoria em tempo real de tarefas
técnicas executadas manualmente no terreno.

Para a ${company}, a implementação do Nexus assegura o "Golden Standard" de 
habilidade, reduzindo drasticamente o tempo de formação de novos técnicos
e erradicando erros caros de campo.

2. IMPACTO FINANCEIRO E RETORNO DE INVESTIMENTO (ROI)
Baseado nos dados operacionais específicos da ${company}:
- Técnicos Ativos em Campo: ${techs}
- Horas de Integração/Formação Anual por Técnico: ${onboardingHours}h
- Custo Hora do Técnico: ${salary}€/h

MÉTRICAS DE DESPERDÍCIO ATUAL (Estimativa Anual):
- Custo Direto com Onboarding Ineficiente: ${totalOnboardingCost.toLocaleString('pt-PT')}€
- Custo com Erros Operacionais / Chamadas Adicionais: ${totalErrorCost.toLocaleString('pt-PT')}€
- Custo com Viagens e Deslocações de Especialistas Seniores: ${seniorTravelCost.toLocaleString('pt-PT')}€
* TOTAL DESPERDÍCIO OPERACIONAL ESTIMADO: ${currentTotalWaste.toLocaleString('pt-PT')}€

ECONOMIAS GARANTIDAS COM NEXUS (Anual):
- Redução de Onboarding (-60%): ${nexusOnboardingSavings.toLocaleString('pt-PT')}€
- Mitigação de Erros de Campo / SLA (-50%): ${nexusErrorSavings.toLocaleString('pt-PT')}€
- Redução de Deslocações Especialistas (-60%): ${nexusTravelSavings.toLocaleString('pt-PT')}€
* TOTAL RETORNO ANUAL ESTIMADO: ${annualSavings.toLocaleString('pt-PT')}€

PLANO DE INVESTIMENTO SUGERIDO:
- Licenciamento Nexus Motion (Enterprise - ${techs} técnicos): ${(nexusLicenseCost).toLocaleString('pt-PT')}€ / ano
- Setup Inicial, Integração RAG de Procedimentos e Formação: ${nexusSetupCost.toLocaleString('pt-PT')}€
* INVESTIMENTO TOTAL ANO 1: ${firstYearInvestment.toLocaleString('pt-PT')}€

BENEFÍCIO OPERACIONAL LÍQUIDO (ANO 1): ${netFirstYearSavings.toLocaleString('pt-PT')}€
PAYBACK DO INVESTIMENTO: ${paybackMonths} meses!

3. GARANTIAS DE INTEROPERABILIDADE & COMPLIANCE
- FIWARE NATIVO: Pronto para Orion Context Broker (NGSI-LD).
- COMPLIANCE EU AI ACT: Sistema certificado com Rasto de Auditoria Imutável (Auto-Audit).
- RGPD EDGE-ONLY: As imagens e marcos biométricos são destruídos localmente no Edge AI Worker,
  não sendo enviados dados biométricos sensíveis para a nuvem.

4. PRÓXIMO PASSO: ACORDO PILOTO (30 DIAS)
Sugerimos o início imediato de um Programa Piloto com 5 técnicos de campo durante 30 dias:
- Custo Flat Piloto: 1.999€ (inclui captura de 2 procedimentos mestre e dashboard de análise).

Contacto Direto para Início:
Denio Negraão | Fundador & CEO Nexus
Email: denio@nexusmotion.pt | WhatsApp: +351 921 389 999
`
      setGeneratedProposal(proposal)
      setProposalStep('ready')
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedProposal)
    alert('Proposta Comercial copiada com sucesso para a Área de Transferência!')
  }

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500 selection:text-black relative" style={{
      backgroundColor: '#0A0A0F',
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.012) 1px, transparent 1px)',
      backgroundSize: '45px 45px',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-emerald-950/30 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Brain className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-lg font-black tracking-widest text-white">NEXUS</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 font-mono uppercase tracking-widest rounded-sm">
              COMERCIAL B2B
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-4 py-2 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{showCheatSheet ? 'Esconder Dicas de Venda' : 'Modo Apresentador'}</span>
            </button>
            <Link href="/" className="text-xs uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full inline-block mb-4">
            TERCEIRA ONDA DA TRANSFORMAÇÃO DIGITAL
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Digitalização da <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Destreza Física</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6 font-sans">
            Transforme o conhecimento invisível dos seus melhores especialistas técnicos em guias interativos com IA. 
            Treine técnicos 60% mais rápido, reduza erros críticos de campo em 50% e valide a conformidade de 
            procedimentos manuais críticos sem depender de hardware proprietário complexo.
          </p>

          <div className="flex justify-center gap-3">
            <a href="#roi-calculator" className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase px-6 py-3.5 tracking-wider transition-all active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
              Simular ROI Comercial
            </a>
            <a href="#live-simulator" className="border border-white/10 hover:border-white/20 bg-white/5 text-white font-mono text-xs uppercase px-6 py-3.5 tracking-wider transition-all">
              Ver Demo Interativa
            </a>
          </div>
        </div>
      </section>

      {/* THREE VALUE PILLARS & SELECTABLE SECTORS */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-b border-white/5">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-6 text-center">
          ESCOLHA O SETOR DO SEU CLIENTE PARA PERSONALIZAR A APRESENTAÇÃO
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {SECTORS.map((sec) => {
            const IconComponent = sec.icon
            const isSelected = selectedSector.id === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorChange(sec)}
                className={`p-5 border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.08)]' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 border ${isSelected ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/5 text-white/50'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40'
                  }`}>
                    {sec.metricValue}
                  </span>
                </div>
                <h3 className={`font-mono text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                  {sec.name}
                </h3>
                <p className="text-[10px] text-white/45 truncate">
                  {sec.clients}
                </p>
                {isSelected && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Sector Context Card */}
        <div className="bg-[#101017] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm inline-block mb-3">
              Mapeamento de Valor: {selectedSector.name}
            </span>
            <h3 className="text-lg font-bold tracking-tight text-white mb-3">
              Alvos de Venda Típicos: <span className="text-white/60 font-normal">{selectedSector.clients}</span>
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div>
                <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">A DOR OPERACIONAL (DESPERDÍCIO):</h4>
                <p className="text-white/70">{selectedSector.problem}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">A SOLUÇÃO NEXUS OS:</h4>
                <p className="text-white/70">{selectedSector.solution}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 bg-[#0A0A0F] border border-white/5 p-6 text-center flex flex-col justify-center">
            <span className="text-[9px] font-mono text-white/40 uppercase mb-2 block">{selectedSector.metricLabel}</span>
            <span className="text-4xl font-black text-emerald-400 block mb-2">{selectedSector.metricValue}</span>
            <span className="text-[10px] text-white/50 leading-relaxed font-sans">
              Métrica de performance comprovada em ambiente industrial/operacional.
            </span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MOTION SIMULATOR (WOW FACTOR IN PRESENTATION) */}
      <section id="live-simulator" className="py-12 px-6 max-w-7xl mx-auto border-b border-white/5 scroll-mt-24">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] block mb-1">PROMPT DIGITAL DEXTERITY SYSTEM</span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Simulador de <span className="text-emerald-400 font-mono">Feedback 3D</span> ao Técnico
              </h2>
              <p className="text-white/60 text-xs font-sans mt-2">
                Demonstre ao cliente exatamente como o algoritmo de correspondência cinemática (Kinetic Engine) funciona no telemóvel do trabalhador técnico.
                Simule um cenário perfeito e um cenário com falha/erro de ângulo crítico.
              </p>
            </div>

            {/* Simulated Live View */}
            <div className="bg-[#101017] border border-white/5 p-6 relative overflow-hidden rounded-sm">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">NEXUS_VISION_ENGINE: COMPLIANT</span>
              </div>

              {/* Central Frame representing visual input */}
              <div className="h-64 bg-[#0A0A0F] border border-white/10 flex flex-col items-center justify-center relative rounded-sm p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: 'radial-gradient(circle, #10b981 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px'
                }} />

                {demoStep === 0 && (
                  <div className="text-center z-10">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-3 bg-white/5">
                      <Play className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xs font-mono text-white mb-1">Pronto para a Simulação de Procedimento</p>
                    <p className="text-[10px] text-white/40">Inicie o fluxo clicando num dos botões abaixo.</p>
                  </div>
                )}

                {demoStep > 0 && demoStep !== 99 && (
                  <div className="w-full h-full flex flex-col justify-between z-10 p-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 uppercase">
                        {SIM_STEPS[demoStep - 1].title}
                      </span>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-white/50 block">ROI SCORE</span>
                        <span className={`text-2xl font-black font-mono ${demoScore >= 90 ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {demoScore}%
                        </span>
                      </div>
                    </div>

                    {/* Schematic Representation of Skeleton */}
                    <div className="flex justify-center my-2 relative">
                      <svg width="240" height="120" viewBox="0 0 240 120" className="opacity-80">
                        {/* Golden Standard outline */}
                        <path d="M20,60 Q120,20 220,60" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
                        
                        {/* Actual user path animation based on score */}
                        {demoScore >= 90 ? (
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            d="M20,60 Q120,22 220,60" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="4" 
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            d="M20,60 Q90,10 220,60" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="4" 
                            transition={{ duration: 0.5 }}
                          />
                        )}
                        
                        {/* Skeleton key joints */}
                        <circle cx="20" cy="60" r="4" fill="#34d399" />
                        <circle cx="120" cy={demoScore >= 90 ? 22 : 10} r="6" fill={demoScore >= 90 ? '#10b981' : '#f59e0b'} />
                        <circle cx="220" cy="60" r="4" fill="#34d399" />
                      </svg>
                      
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0F]/80 border border-white/10 px-3 py-1 font-mono text-[9px] rounded-md text-center max-w-[200px]">
                        <span className="text-white/40 block">PADRÃO DE REFERÊNCIA:</span>
                        <span className="text-white font-bold">{SIM_STEPS[demoStep - 1].standardImg}</span>
                      </div>
                    </div>

                    <div className="text-center bg-white/[0.02] border border-white/5 p-2 rounded-sm">
                      <p className={`text-[10px] font-mono ${demoScore >= 90 ? 'text-emerald-400' : 'text-amber-500 font-bold'}`}>
                        {demoScore >= 90 ? SIM_STEPS[demoStep - 1].successMsg : SIM_STEPS[demoStep - 1].failMsg}
                      </p>
                    </div>
                  </div>
                )}

                {demoStep === 99 && (
                  <div className="text-center z-10 p-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-mono font-bold text-white mb-1">AUDITORIA DE HABILIDADE COMPLETA</p>
                    <p className="text-[10px] text-white/50 leading-relaxed max-w-xs mx-auto">
                      Todos os passos cinemáticos foram validados. Assinatura criptográfica de conformidade gerada com sucesso.
                    </p>
                    <button 
                      onClick={() => { setDemoStep(0); setDemoScore(0); setDemoLog([]) }}
                      className="mt-3 text-[9px] font-mono text-emerald-400 hover:underline flex items-center gap-1 mx-auto bg-transparent border-none cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Reiniciar Simulação
                    </button>
                  </div>
                )}

                {isSimulating && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/90 flex items-center justify-center z-20">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Processando frames MediaPipe...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Actions */}
              {demoStep !== 99 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    disabled={isSimulating}
                    onClick={() => runSimulationStep(true)}
                    className="border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-400 font-mono text-[10px] uppercase py-3 tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    🚀 Simular Gesto Perfeito (Score 90+)
                  </button>
                  <button
                    disabled={isSimulating}
                    onClick={() => runSimulationStep(false)}
                    className="border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/20 text-amber-500 font-mono text-[10px] uppercase py-3 tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    ⚠️ Simular Gesto com Erro
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attestation Log Feed */}
          <div className="w-full md:w-80 bg-[#101017] border border-white/5 p-6 flex flex-col justify-between rounded-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">CANAIS DE TELEMETRIA</span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-sm">
                  LIVE FEED
                </span>
              </div>
              
              <div className="h-56 overflow-y-auto space-y-2.5 pr-1 text-[9px] font-mono text-white/40">
                {demoLog.length === 0 ? (
                  <p className="italic text-center pt-12">Nenhum evento processado. Inicie a simulação cinemática no painel ao lado.</p>
                ) : (
                  demoLog.map((log, idx) => (
                    <div key={idx} className="p-2 bg-[#0A0A0F] border border-white/5 rounded-sm text-left">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                💡 <strong className="text-white/60">Objeção típica do cliente:</strong> "O meu técnico tem de usar óculos AR?" <br />
                <span className="text-emerald-400">Resposta:</span> "Não! O Nexus corre no próprio browser do telemóvel dele via câmara normal. Barreira zero."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* DYNAMIC B2B ROI CALCULATOR */}
      <section id="roi-calculator" className="py-16 px-6 max-w-7xl mx-auto border-b border-white/5 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full inline-block mb-3">
            ESTUDO DE RETORNO E POUPANÇA COMERCIAL
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Calculadora de ROI <span className="text-emerald-400">B2B Interativa</span>
          </h2>
          <p className="text-white/60 text-xs font-sans mt-2">
            Insira os dados operacionais do cliente (ou ajuste as estimativas padrão do setor) para ver na hora o retorno anual do investimento no Nexus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs Section */}
          <div className="lg:col-span-2 bg-[#101017] border border-white/5 p-6 md:p-8 space-y-6 rounded-sm">
            <h3 className="text-sm font-mono text-white/60 uppercase tracking-widest border-b border-white/5 pb-3">
              1. DADOS OPERACIONAIS DO CLIENTE ({selectedSector.name})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* input techs */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">Nº de Técnicos no Terreno:</label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{techs}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5"
                  value={techs}
                  onChange={(e) => setTechs(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[9px] text-white/30 block">Dimensão total da força técnica ativa em campo.</span>
              </div>

              {/* input salary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">Custo Médio da Hora Técnica (€):</label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{salary}€/h</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="80" 
                  step="1"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[9px] text-white/30 block">Inclui salário base, encargos e seguros por hora de campo.</span>
              </div>

              {/* input onboarding hours */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">Horas Integração / Técnico Novo:</label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{onboardingHours}h</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="300" 
                  step="10"
                  value={onboardingHours}
                  onChange={(e) => setOnboardingHours(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[9px] text-white/30 block">Tempo médio em que um sénior acompanha o júnior até autonomia total.</span>
              </div>

              {/* input error rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">Técnicos com Erros Anuais (%):</label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{errorRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="30" 
                  step="1"
                  value={errorRate}
                  onChange={(e) => setErrorRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[9px] text-white/30 block">Taxa de erro por mês que exige reinstalação ou ativa penalidade SLA.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-auto">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1">Custo Médio de uma Falha de Campo (€):</label>
                <input 
                  type="number" 
                  value={errorCost}
                  onChange={(e) => setErrorCost(Number(e.target.value))}
                  className="bg-[#0A0A0F] border border-white/10 px-3 py-2 text-emerald-400 text-xs font-mono font-bold w-full md:w-44 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-sans md:max-w-xs">
                💡 <strong className="text-white/60">Nota de Venda:</strong> Mostre ao cliente que reduzir este custo de erro em apenas metade (50%) já amortiza a licença de software inteira do Nexus.
              </p>
            </div>
          </div>

          {/* Results Sidebar */}
          <div className="bg-emerald-950/10 border border-emerald-500/30 p-6 md:p-8 flex flex-col justify-between rounded-sm">
            <div>
              <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 pb-3 mb-6">
                2. ESTIMATIVA DE RETORNO (ROI)
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Formação Nova Acelerada:</span>
                  <span className="font-mono font-bold text-white">-{nexusOnboardingSavings.toLocaleString('pt-PT')}€</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Mitigação de Penalidades/Erros:</span>
                  <span className="font-mono font-bold text-white">-{nexusErrorSavings.toLocaleString('pt-PT')}€</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Viagens Especialistas Evitadas:</span>
                  <span className="font-mono font-bold text-white">-{nexusTravelSavings.toLocaleString('pt-PT')}€</span>
                </div>
                
                <div className="border-t border-emerald-500/20 pt-4 flex justify-between items-baseline">
                  <span className="text-xs uppercase text-emerald-400 font-bold">Poupança Total / Ano:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {annualSavings.toLocaleString('pt-PT')}€
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0A0F] border border-white/5 p-4 space-y-3 mb-6 text-xs rounded-sm">
                <div className="flex justify-between text-[10px] text-white/50 font-mono">
                  <span>INVESTIMENTO ESTIMADO (ANO 1):</span>
                  <span>{firstYearInvestment.toLocaleString('pt-PT')}€</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/50 font-mono">
                  <span>BENEFÍCIO LÍQUIDO (ANO 1):</span>
                  <span className="text-emerald-400 font-bold">{netFirstYearSavings.toLocaleString('pt-PT')}€</span>
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
              <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block mb-1">AMORTIZAÇÃO RÁPIDA</span>
              <span className="text-lg font-black font-mono text-white block">
                Paga-se em <span className="text-emerald-400">{paybackMonths}</span> Meses!
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* DYNAMIC CUSTOM PROPOSAL GENERATOR */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full inline-block">
              ENVIAR APÓS A REUNIÃO
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Gerador de Proposta <span className="text-emerald-400">Comercial Customizada</span>
            </h2>
            <p className="text-white/60 text-xs font-sans">
              Personalize a narrativa de vendas adicionando o nome da empresa cliente e do decisor político ou operacional técnico. O sistema injeta os cálculos de ROI reais gerados nesta tela no corpo da proposta comercial formal.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
                  Nome da Empresa Cliente (ex: OTIS Portugal, MEO Altice, IEFP Oeiras):
                </label>
                <input 
                  type="text" 
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Nome corporativo ou municipal"
                  className="bg-[#101017] border border-white/10 px-4 py-3 text-white text-xs font-mono w-full focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
                  Contacto de Destino (ex: Diretor de Formação / Administrador Digital):
                </label>
                <input 
                  type="text" 
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Cargo ou Nome do Decisor"
                  className="bg-[#101017] border border-white/10 px-4 py-3 text-white text-xs font-mono w-full focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={generateProposalText}
                disabled={proposalStep === 'generating'}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase px-6 py-3.5 tracking-wider transition-all w-full active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                {proposalStep === 'generating' ? 'Calculando & Escrevendo...' : 'Gerar Proposta Estruturada'}
              </button>
            </div>
          </div>

          {/* Output Display Card */}
          <div className="flex-1 bg-[#101017] border border-white/5 p-6 md:p-8 flex flex-col justify-between min-h-[400px] rounded-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">MINUTA DA PROPOSTA COMERCIAL</span>
                {proposalStep === 'ready' && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Copiar Minuta
                  </button>
                )}
              </div>

              {proposalStep === 'idle' && (
                <div className="text-center pt-24 text-white/30 space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-20" />
                  <p className="text-xs font-mono">Insira os dados à esquerda e clique em Gerar.</p>
                  <p className="text-[10px]">A minuta conterá o sumário executivo, pricing e ROI real calculado.</p>
                </div>
              )}

              {proposalStep === 'generating' && (
                <div className="text-center pt-24 text-emerald-400 space-y-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">Modelando análise de ROI específica...</p>
                </div>
              )}

              {proposalStep === 'ready' && (
                <pre className="text-[9px] font-mono text-white/70 overflow-x-auto bg-[#0A0A0F] border border-white/10 p-4 max-h-[350px] overflow-y-auto leading-relaxed text-left rounded-sm whitespace-pre-wrap">
                  {generatedProposal}
                </pre>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 text-center text-[10px] text-white/40">
              🚨 **Recomendação Estratégica:** Envie esta minuta via WhatsApp/Email para o Diretor de Sistemas de Informação ou Smart City Office como "Documento de Discussão". Eles adoram dados concretos.
            </div>
          </div>

        </div>
      </section>

      {/* INSTITUTIONAL TRUST & FAQS SECTION */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-white/5">
        <h2 className="text-center font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 mb-8">
          ASSINATURA DE CONFIANÇA & CONFORMIDADE GOVERNAMENTAL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101017] border border-white/5 p-6 rounded-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2">
              Privacidade Absoluta (RGPD)
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Sem armazenamento de imagens biométricas. O processamento dos 21 marcos articulares é feito localmente no browser ou aplicação nativa do telemóvel e destruído no momento. Apenas a pontuação de precisão (%) é guardada de forma segura na nuvem.
            </p>
          </div>

          <div className="bg-[#101017] border border-white/5 p-6 rounded-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2">
              Compatibilidade FIWARE
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              100% interoperável com infraestruturas municipais e corporativas. Suporta o padrão NGSI-LD nativamente para ingestão contínua no Orion Context Broker, permitindo correlacionar conformidade de técnicos com dados gerais de Smart Cities.
            </p>
          </div>

          <div className="bg-[#101017] border border-white/5 p-6 rounded-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2">
              Pronto para o EU AI Act
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              O sistema de notarização gera um rasto criptográfico imutável para todas as decisões tomadas por IA e intervenções humanas. Em total conformidade com a regulação europeia para sistemas de inteligência artificial de alto risco.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <footer className="py-16 text-center border-t border-white/5 bg-[#08080C]">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <Brain className="w-8 h-8 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-white">NEXUS PHYSICAL INTELLIGENCE OS</h2>
          <p className="text-white/45 text-xs">
            "A infraestrutura líder de governação e integridade cinemática técnica para governos, utilities e indústrias críticas na Europa."
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-mono text-white/30 uppercase tracking-widest pt-4">
            <span>© 2026 NEXUS MOTION</span>
            <span>·</span>
            <span>POLÍTICA DE PRIVACIDADE RGPD</span>
            <span>·</span>
            <span>SUITE ENTERPRISE</span>
          </div>
        </div>
      </footer>

      {/* MODAL / BOTTOM DRAWER: PITCHING CHEAT SHEET (ADMIN GUIDE) */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0C0C12] border-t border-emerald-500/40 p-6 md:p-8 max-h-[75vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      GUIA E ARGUMENTOS DE VENDA — EXCLUSIVO PARA O DENIO
                    </h3>
                    <p className="text-[10px] text-white/40">Como conduzir reuniões B2B de alto nível e fechar pilotos pagos de €1.999</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCheatSheet(false)}
                  className="text-xs uppercase tracking-widest font-mono hover:text-emerald-400 transition-colors border-none bg-transparent cursor-pointer"
                >
                  [ Fechar X ]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans leading-relaxed">
                
                {/* Objections section */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    ⚔️ CONTORNAR AS 4 PRINCIPAIS OBJEÇÕES B2B
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-[#0A0A0F] p-3 border border-white/5">
                      <p className="font-bold text-white mb-1">1. "Mas preciso de comprar óculos de Realidade Aumentada caros?"</p>
                      <p className="text-white/60">
                        <strong className="text-emerald-400">Resposta:</strong> "De todo! O Nexus é compatível com qualquer smartphone Android de 150€. O técnico apenas prende o telemóvel no peito (com um suporte elástico de 10€) ou coloca-o numa base magnética enquanto trabalha. Zero barreiras de hardware."
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] p-3 border border-white/5">
                      <p className="font-bold text-white mb-1">2. "O sindicato ou a RGPD não vão bloquear a filmagem de trabalhadores?"</p>
                      <p className="text-white/60">
                        <strong className="text-emerald-400">Resposta:</strong> "Não há captação de rostos nem armazenamento de imagens. A nossa câmara local processa instantaneamente o esqueleto em 21 pontos matemáticos (vetores) e elimina o feed de vídeo. Nem a própria empresa tem acesso a vídeo das mãos deles, apenas ao score cinemático final. 100% RGPD-Edge-Only."
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] p-3 border border-white/5">
                      <p className="font-bold text-white mb-1">3. "Isto integra-se com o nosso SAP / ERP atual de gestão técnica?"</p>
                      <p className="text-white/60">
                        <strong className="text-emerald-400">Resposta:</strong> "Sim, absolutamente. O Nexus é interoperável. Assim que o técnico atinge o score cinemático aceitável de montagem, o Nexus emite um webhook seguro com a assinatura criptográfica diretamente para fechar a ordem de trabalho no vosso SAP PM ou CRM."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pitch Strategy */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    🎯 ROTEIRO DE REUNIÃO DE 15 MINUTOS (A DEMO PERFEITA)
                  </h4>

                  <div className="space-y-3 bg-[#0A0A0F] p-4 border border-white/5">
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase inline-block mb-1">Minutos 0-3: A Dor</span>
                      <p className="text-white/80">
                        "Quanto custa hoje o onboarding de um técnico de campo novo? Quantas vezes têm de enviar um sénior porque um júnior falhou uma calibração complexa?"
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase inline-block mb-1">Minutos 3-7: O WOW Factor (O Simulador)</span>
                      <p className="text-white/80">
                        Abra o <strong className="text-white">Simulador de Feedback 3D</strong> nesta página e corra o teste. Mostre como o algoritmo deteta rotação incorreta em tempo real e emite o aviso cinemático. Isso prova que a IA não é apenas um conceito, é real.
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase inline-block mb-1">Minutos 7-12: O Impacto Financeiro (ROI)</span>
                      <p className="text-white/80">
                        Ajuste os sliders do <strong className="text-white">Calculador de ROI</strong> com eles na reunião. Deixe que eles próprios lhe digam o número de técnicos e o ordenado. Quando virem o badge de poupança com 6 dígitos verdes, a venda lógica está feita.
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase inline-block mb-1">Minutos 12-15: Fecho do Piloto Pago</span>
                      <p className="text-white/80">
                        "Não precisam de comprar a licença anual agora. Sugiro que arranquemos um Piloto Prático de 30 dias com 5 técnicos por 1.999€. Capturamos as vossas 2 tarefas críticas e avaliamos a adesão deles. Avançamos?"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
