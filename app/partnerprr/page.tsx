import React from 'react';

export default function PartnerPRRPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30">
      
      {/* HEADER / HERO - PRR FOCUSED */}
      <header className="pt-24 pb-16 px-6 md:px-12 max-w-5xl mx-auto text-center border-b border-neutral-800">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-8">
          PROPOSTA ESTRATÉGICA DE CONSÓRCIO — PRR
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          NEXUS <span className="text-blue-500">Operational Intelligence</span>
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
          "As organizações públicas passaram 20 anos a digitalizar documentos. 
          O Nexus digitaliza o conhecimento crítico que permite operar o Estado."
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-24">
        
        {/* SECTION 1: O ALINHAMENTO COM O PRR */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-3">1. O Contexto Nacional</h2>
            <h3 className="text-3xl font-bold text-white">A Crise Silenciosa do Conhecimento Operacional</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-neutral-300 text-lg">
              <p>
                Nos próximos 10 anos, milhares de técnicos especializados da Administração Pública (Águas, Infraestruturas, Energia) irão reformar-se. O PRR investe fortemente em infraestruturas físicas, mas ignora o passivo humano: <strong>a perda do conhecimento tácito de O&M.</strong>
              </p>
              <p>
                A NEXUS não é apenas uma plataforma tecnológica. É uma Infraestrutura de Soberania de Dados. Nós capturamos a memória operacional do Estado e blindamo-la numa cadeia criptográfica inalterável.
              </p>
              <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                <h4 className="text-blue-400 font-bold mb-4">Aderência Direta ao PRR (Transição Digital):</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start"><span className="text-blue-500 mr-2">✓</span> Resiliência de Infraestruturas Críticas (Água/Energia).</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">✓</span> Modernização da Administração Pública (Capacitação e Retenção).</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">✓</span> Smart Cities & FIWARE (Integração nativa de eventos IoT).</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-900 to-black p-10 rounded-2xl border border-neutral-800 text-center">
              <h4 className="text-lg text-neutral-400 font-semibold mb-2">O Custo da Inação (Utility Típica)</h4>
              <p className="text-neutral-500 text-sm mb-6">Por cada 50 técnicos especializados que abandonam funções:</p>
              <div className="text-6xl font-bold text-red-500 mb-4">€3.5M</div>
              <p className="text-sm text-neutral-400">Em perda de produtividade, custos de supervisão e erros críticos de juniores.</p>
              <p className="text-xs text-neutral-600 mt-4 italic">* Valores ilustrativos. A calibrar durante a execução do Piloto.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: O PILOTO DO CONSÓRCIO */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">2. A Nossa Proposta (Letter of Intent)</h2>
            <h3 className="text-3xl font-bold text-white">Pilot Success Framework (90 Dias)</h3>
            <p className="text-neutral-400 mt-4 text-lg">
              Não propomos a integração cega de software num consórcio de milhões. Propomos um piloto cirúrgico no terreno, orientado exclusivamente à mitigação de risco, para validar a tese de investimento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-4xl mb-4">👑</div>
              <h4 className="text-xl font-bold text-white mb-2">Knowledge Reuse Rate</h4>
              <p className="text-neutral-400 text-sm">
                A métrica que prova o ROI. Percentagem de execuções de campo que reutilizam com sucesso o "Digital Twin" do procedimento capturado do especialista sénior.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-4xl mb-4">📉</div>
              <h4 className="text-xl font-bold text-white mb-2">Onboarding: -30%</h4>
              <p className="text-neutral-400 text-sm">
                Redução drástica no tempo de formação. Juniores executam operações de alto risco amparados pelo guia cinemático imutável do NEXUS.
              </p>
            </div>

            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-4xl mb-4">⚖️</div>
              <h4 className="text-xl font-bold text-white mb-2">Auditoria Inquebrável</h4>
              <p className="text-neutral-400 text-sm">
                100% das execuções geram uma assinatura SHA-256 (Operational Audit Ledger). Garantia absoluta de compliance e prova para o Tribunal de Contas.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: A TECNOLOGIA */}
        <section>
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest text-purple-500 uppercase mb-3">3. Fosso Tecnológico (Moat)</h2>
            <h3 className="text-3xl font-bold text-white">Porquê a NEXUS para o Consórcio?</h3>
          </div>
          
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
            <div className="p-10 border-b border-neutral-800">
              <h4 className="text-2xl font-bold text-white mb-4">Inteligência Operacional no Edge</h4>
              <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                Ao contrário de soluções *cloud-dependentes*, a NEXUS foi desenhada para a trincheira. O nosso <strong>Operational Risk Engine</strong> avalia falhas processuais no milissegundo, permitindo abortar operações críticas localmente.
              </p>
              <p className="text-neutral-300 text-lg leading-relaxed">
                Toda a telemetria é recolhida via <strong>Edge Offline Queue</strong>. Numa ETAR subterrânea ou num túnel sem rede, o NEXUS continua a auditar e encriptar dados, sincronizando-os automaticamente via FIWARE assim que a conectividade é restabelecida.
              </p>
            </div>
            <div className="bg-neutral-950 p-6 flex flex-wrap gap-4 items-center justify-center text-sm font-mono text-neutral-500">
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Kinematic Engine</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Knowledge Graph</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Offline FIWARE Sync</span>
              <span className="px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">Autenticação.gov Ready</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA */}
        <section className="text-center py-12">
          <h3 className="text-3xl font-bold text-white mb-6">Validação antes da Escala Nacional</h3>
          <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
            O objetivo de curto prazo é assinar a <strong>Letter of Intent (LOI)</strong> para iniciar o Piloto de 90 dias numa operação real. Os dados extraídos sustentarão tecnicamente a nossa fatia da candidatura ao fundo PRR.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-colors duration-300 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)]">
            Avançar com a LOI do Piloto
          </button>
        </section>

      </main>
      
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} NEXUS Operational Intelligence Platform. Projeto Candidato ao Plano de Recuperação e Resiliência (PRR).</p>
      </footer>
    </div>
  );
}
