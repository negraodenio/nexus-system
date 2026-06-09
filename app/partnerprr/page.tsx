import React from 'react';
import Link from 'next/link';

export default function PartnerPRRPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30">
      
      {/* 1. PITCH DECK (VISÃO MACRO) */}
      <section className="pt-24 pb-20 px-6 md:px-12 max-w-5xl mx-auto border-b border-neutral-800">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-6">
            PITCH DECK | CONSÓRCIO PRR
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Soberania de Dados e <br/><span className="text-blue-500">Continuidade Operacional</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
            "As organizações públicas passaram 20 anos a digitalizar documentos. O Nexus digitaliza o conhecimento crítico que permite operar o Estado."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">O Problema do Passivo Humano</h3>
            <p className="text-neutral-400 leading-relaxed mb-4">
              O PRR foca-se na construção e modernização de infraestruturas físicas (Smart Cities, Água, Energia). No entanto, ignora a maior crise da próxima década: a reforma em massa dos especialistas que sabem operar essas infraestruturas.
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">🛡️</span>
                <span className="text-neutral-300">Resiliência Operacional (Retenção de Conhecimento Tácito).</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">🔗</span>
                <span className="text-neutral-300">Integração FIWARE e Cidades Inteligentes (Edge Ready).</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">🏛️</span>
                <span className="text-neutral-300">Cumprimento Regulatório e Auditoria Criptográfica (Tribunal de Contas).</span>
              </li>
            </ul>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
            <div className="text-sm text-neutral-500 font-mono mb-4">NEXUS OPERATIONAL LAYER</div>
            <div className="h-48 border border-neutral-800 rounded bg-neutral-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <p className="text-blue-400 font-bold z-10">Knowledge Graph & Audit Ledger</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESS CASE (MATEMÁTICA DA DOR) */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-b border-neutral-800">
        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-900/30 border border-red-500/30 text-red-400 text-sm font-bold tracking-widest mb-6">
            BUSINESS CASE EXECUTIVO
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">A Matemática da Dor</h2>
          <p className="text-neutral-400 max-w-2xl">
            O custo de substituir um especialista não é o seu salário. É o risco acumulado na operação da infraestrutura até que o júnior atinja o mesmo nível de mestria.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
            <h4 className="text-lg text-neutral-300 font-bold mb-6">Custo por perda de Especialista:</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Recrutamento & Formação</span>
                <span className="font-mono text-white">€ 15.000</span>
              </div>
              <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Supervisão Sénior Adicional</span>
                <span className="font-mono text-white">€ 10.000</span>
              </div>
              <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Quebra de Produtividade</span>
                <span className="font-mono text-white">€ 20.000</span>
              </div>
              <div className="flex justify-between items-end pb-2">
                <span className="text-red-400 font-bold">Erros e Risco Operacional</span>
                <span className="font-mono text-white font-bold">€ 25.000</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between">
              <span className="font-bold text-white">Total Oculto por Técnico:</span>
              <span className="font-bold text-red-400">€ 70.000</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-neutral-900 p-10 rounded-2xl border border-red-500/20 flex flex-col justify-center items-center text-center">
            <h4 className="text-xl text-neutral-300 font-semibold mb-2">Risco Financeiro Acumulado</h4>
            <p className="text-neutral-500 text-sm mb-6">Perda estimada de 50 Especialistas na próxima década:</p>
            <div className="text-7xl font-bold text-white mb-4">€3.5M</div>
            <p className="text-xs text-neutral-600 italic mt-4">
              * Valores ilustrativos para modelação. O valor real será calibrado de forma exata durante o Piloto Operacional.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PILOT SUCCESS FRAMEWORK */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-b border-neutral-800">
        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-widest mb-6">
            PILOT SUCCESS FRAMEWORK
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Mitigar Risco no Terreno (90 Dias)</h2>
          <p className="text-neutral-400 max-w-2xl">
            A NEXUS não vende software. Propomos um piloto operacional cirúrgico para provar a tese de captura e reutilização de conhecimento antes da escala nacional.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-emerald-900/10 p-8 rounded-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="text-5xl mb-6">👑</div>
            <h4 className="text-2xl font-bold text-white mb-3">Knowledge Reuse Rate</h4>
            <p className="text-emerald-400 text-sm font-bold mb-3">KPI PRINCIPAL</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              A métrica que prova o ROI imediato. Qual a percentagem de operações reais realizadas onde o conhecimento processual capturado foi reutilizado com sucesso pela equipa júnior?
            </p>
          </div>
          
          <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
            <div className="text-5xl mb-6">📉</div>
            <h4 className="text-2xl font-bold text-white mb-3">Onboarding</h4>
            <p className="text-neutral-500 text-sm font-bold mb-3">OBJETIVO: -30% TEMPO</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Redução do tempo necessário para que um técnico júnior se torne autónomo numa tarefa de infraestrutura crítica, guiado pelo "Digital Twin" cinemático.
            </p>
          </div>

          <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
            <div className="text-5xl mb-6">🛡️</div>
            <h4 className="text-2xl font-bold text-white mb-3">Risco & Auditoria</h4>
            <p className="text-neutral-500 text-sm font-bold mb-3">OBJETIVO: -20% ERROS</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Intervenções processuais divergentes abortadas em tempo-real pela *Risk Engine*. Geração de Audit Trail criptográfico (SHA-256) em 100% das execuções.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LETTER OF INTENT (LOI) */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-400 text-sm font-bold tracking-widest mb-6">
            O FECHO
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Letter of Intent (LOI)</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Este é o documento de partida. Não vincula aquisições pesadas, vincula-nos apenas ao sucesso do Piloto e à partilha mútua de risco e inovação.
          </p>
        </div>

        <div className="bg-white text-black p-10 md:p-16 rounded-xl shadow-2xl font-serif text-sm leading-relaxed">
          <h3 className="text-2xl font-bold text-center mb-8 border-b-2 border-black pb-4">
            LETTER OF INTENT (LOI)<br/>
            <span className="text-lg font-normal">Piloto de Continuidade Operacional e Preservação de Conhecimento</span>
          </h3>

          <div className="space-y-6">
            <p><strong>Data:</strong> [Inserir Data]</p>
            <p>
              <strong>Entre:</strong><br/>
              <strong>NEXUS – Operational Intelligence Platform</strong> (doravante "NEXUS")<br/>
              e<br/>
              <strong>[Nome da Entidade Parceira]</strong> (doravante "Parceiro")
            </p>

            <h4 className="font-bold text-lg mt-8">1. Enquadramento</h4>
            <p>
              A presente Carta de Intenção estabelece a vontade mútua das partes em colaborar num Piloto de Validação Operacional (60 a 90 dias). O objetivo não é a aquisição imediata de software, mas a validação de mecanismos de preservação de conhecimento operacional e mitigação de risco.
            </p>

            <h4 className="font-bold text-lg mt-8">2. Âmbito Operacional</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Procedimento-Alvo:</strong> [Ex: Substituição de Válvula de Pressão]</li>
              <li><strong>Local:</strong> [Ex: ETAR / Subestação]</li>
              <li><strong>Equipa:</strong> 1-2 Técnicos Seniores; 3-5 Juniores; Equipa Técnica NEXUS.</li>
            </ul>

            <h4 className="font-bold text-lg mt-8">3. Indicador de Sucesso Principal</h4>
            <p className="bg-neutral-100 p-4 border-l-4 border-emerald-500">
              <strong>Knowledge Reuse Rate:</strong> Percentagem de execuções realizadas utilizando procedimentos previamente capturados e formalizados pela plataforma.
            </p>

            <h4 className="font-bold text-lg mt-8">4. Condições e Governança</h4>
            <p>
              A NEXUS disponibilizará a tecnologia sem obrigação de contratação futura. O Parceiro disponibilizará o ambiente e os dados para aferir os KPIs. Em caso de sucesso, iniciar-se-ão negociações de boa-fé para escala.
            </p>

            <div className="mt-16 pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-12"><strong>Pelo Parceiro:</strong></p>
                <div className="border-b border-black mb-2 w-3/4"></div>
                <p className="text-xs">Cargo / Data</p>
              </div>
              <div>
                <p className="mb-12"><strong>Pela NEXUS:</strong></p>
                <div className="border-b border-black mb-2 w-3/4"></div>
                <p className="text-xs">Denio Negrão - Founder & CTO</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-colors duration-300 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)]">
            Imprimir LOI em PDF
          </button>
        </div>
      </section>

      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} NEXUS Operational Intelligence Platform.</p>
      </footer>
    </div>
  );
}
