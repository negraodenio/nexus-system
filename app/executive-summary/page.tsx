import React from 'react';
import Link from 'next/link';

export default function ExecutiveSummaryPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER / HERO */}
      <header className="pt-24 pb-16 px-6 md:px-12 max-w-5xl mx-auto text-center border-b border-neutral-800">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          NEXUS <span className="text-emerald-500">Operational Intelligence</span>
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
          "As organizações passaram 20 anos a digitalizar documentos e processos. 
          O Nexus digitaliza o conhecimento que permite operá-los."
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-24">
        
        {/* SECTION 1: O PROBLEMA & O CUSTO DA INAÇÃO */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">1. O Custo da Inação</h2>
            <h3 className="text-3xl font-bold text-white">A Matemática da Dor</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-neutral-300 text-lg">
              <p>
                Nos próximos 5 anos, grande parte das equipas seniores de O&M das infraestruturas críticas vai reformar-se. Com eles, desaparece o conhecimento tácito que não está nos manuais.
              </p>
              <p>
                O custo de substituir um especialista não é o seu salário. É o risco acumulado na operação até que o júnior atinja o mesmo nível de mestria.
              </p>
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                <p className="text-sm text-neutral-400 mb-2">Impacto por cada técnico perdido:</p>
                <div className="flex justify-between items-end border-b border-neutral-800 pb-2 mb-2">
                  <span>Recrutamento & Formação</span>
                  <span className="font-mono text-white">€ 15.000</span>
                </div>
                <div className="flex justify-between items-end border-b border-neutral-800 pb-2 mb-2">
                  <span>Supervisão Sénior Adicional</span>
                  <span className="font-mono text-white">€ 10.000</span>
                </div>
                <div className="flex justify-between items-end border-b border-neutral-800 pb-2 mb-2">
                  <span>Quebra de Produtividade</span>
                  <span className="font-mono text-white">€ 20.000</span>
                </div>
                <div className="flex justify-between items-end pb-2">
                  <span>Erros e Risco Operacional</span>
                  <span className="font-mono text-white">€ 25.000</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/40 to-neutral-900 p-10 rounded-2xl border border-emerald-500/20 text-center">
              <h4 className="text-lg text-emerald-400 font-semibold mb-2">Risco Financeiro Acumulado</h4>
              <p className="text-neutral-400 text-sm mb-6">(Cenário: Perda de 50 Especialistas a 5 anos)</p>
              <div className="text-6xl font-bold text-white mb-4">€3.5M</div>
              <p className="text-xs text-neutral-500 italic">
                * Valor ilustrativo para modelação financeira. O valor exato será calibrado durante o piloto.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: A PROPOSTA / PILOTO */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-3">2. Validação no Terreno</h2>
            <h3 className="text-3xl font-bold text-white">Pilot Success Framework</h3>
            <p className="text-neutral-400 mt-4 text-lg">
              Não propomos a compra de software. Propomos um piloto operacional de 90 dias para medir o retorno.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-blue-500/30 transition-colors">
              <div className="text-4xl mb-4">👑</div>
              <h4 className="text-xl font-bold text-white mb-2">Knowledge Reuse Rate</h4>
              <p className="text-neutral-400 text-sm">
                A nossa métrica soberana. Percentagem de execuções de campo realizadas utilizando os procedimentos capturados de forma orgânica e bem-sucedida.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-blue-500/30 transition-colors">
              <div className="text-4xl mb-4">📉</div>
              <h4 className="text-xl font-bold text-white mb-2">Redução de Onboarding</h4>
              <p className="text-neutral-400 text-sm">
                Objetivo: <strong>-30%</strong> no tempo de formação. Juniores executam guiados pelo "Digital Twin" do movimento exato do sénior.
              </p>
            </div>

            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-blue-500/30 transition-colors">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold text-white mb-2">Mitigação de Erro</h4>
              <p className="text-neutral-400 text-sm">
                Objetivo: <strong>-20%</strong> nos erros processuais. Intervenções falhadas são abortadas pela *Operational Risk Layer* antes de causarem impacto.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: TECNOLOGIA & PATENTE */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-purple-500 uppercase mb-3">3. A Tecnologia Protegida</h2>
            <h3 className="text-3xl font-bold text-white">A Fundação Científica (Patente Pendente)</h3>
          </div>
          
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
            <div className="p-10 border-b border-neutral-800">
              <h4 className="text-2xl font-bold text-white mb-4">Operational Knowledge Digital Twin</h4>
              <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                A tecnologia NEXUS recorre a modelos matemáticos avançados (Bases Ortonormais de Gram-Schmidt e filtros Savitzky-Golay) para capturar a assinatura cinemática exata das mãos de um especialista enquanto ele trabalha. 
              </p>
              <p className="text-neutral-300 text-lg leading-relaxed">
                Este movimento é imutavelmente registado num <strong>Operational Audit Ledger</strong>, fornecendo trilhas de auditoria criptográficas preparadas para as exigências regulatórias do Tribunal de Contas e do AI Act Europeu.
              </p>
            </div>
            <div className="bg-neutral-950 p-6 flex flex-wrap gap-4 items-center justify-center text-sm font-mono text-neutral-500">
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Kinematic Engine</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Knowledge Graph</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Audit Ledger</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Offline Edge Ready</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA */}
        <section className="text-center py-12">
          <h3 className="text-3xl font-bold text-white mb-6">Pronto para proteger o conhecimento da sua organização?</h3>
          <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
            Vamos desenhar o escopo do Piloto e assinar a Carta de Intenções (LOI) para bloquearmos o espaço de validação na vossa infraestrutura.
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 hover:text-black transition-colors duration-300 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]">
            Aceder à Letter of Intent
          </button>
        </section>

      </main>
      
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} NEXUS Operational Intelligence Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
