import React from 'react';

export default function PartnerPRRPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30">
      
      {/* 1. PITCH DECK (VISÃO MACRO) */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="text-center mb-20">
          <div className="inline-block px-5 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-8 uppercase">
            Visão Estratégica
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            Soberania de Dados e <br/><span className="text-blue-500 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Continuidade Operacional</span>
          </h1>
          <p className="text-2xl text-neutral-400 max-w-4xl mx-auto leading-relaxed font-light">
            "As organizações públicas passaram 20 anos a digitalizar documentos. O Nexus digitaliza o conhecimento crítico que permite operar o Estado."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mt-16 items-center">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">A Crise do Passivo Humano</h3>
            <p className="text-neutral-400 text-lg leading-relaxed mb-8">
              O investimento público foca-se na construção e modernização de infraestruturas físicas (Água, Energia, Transportes). No entanto, negligencia a verdadeira espinha dorsal da operação: <strong>os especialistas seniores.</strong>
            </p>
            <ul className="space-y-5">
              <li className="flex items-center p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-blue-500 mr-4 text-2xl">🛡️</span>
                <span className="text-neutral-300 font-medium">Mitigação de Perda de Conhecimento Tácito</span>
              </li>
              <li className="flex items-center p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-blue-500 mr-4 text-2xl">🔗</span>
                <span className="text-neutral-300 font-medium">Integração Nativa FIWARE (Edge Ready)</span>
              </li>
              <li className="flex items-center p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-blue-500 mr-4 text-2xl">🏛️</span>
                <span className="text-neutral-300 font-medium">Auditoria Criptográfica para o Tribunal de Contas</span>
              </li>
            </ul>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="text-sm text-neutral-500 font-mono mb-6 tracking-widest">NEXUS OPERATIONAL LAYER</div>
            <div className="h-64 border border-neutral-800 rounded-2xl bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 z-10 border border-blue-500/30">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-blue-400 font-bold z-10 tracking-widest text-lg">KNOWLEDGE GRAPH</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESS CASE (MATEMÁTICA DA DOR) */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-red-900/20 border border-red-500/30 text-red-400 text-sm font-bold tracking-widest mb-6 uppercase">
            Business Case Executivo
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">A Matemática do Risco</h2>
          <p className="text-neutral-400 max-w-3xl mx-auto text-xl">
            O custo de substituir um especialista não é o seu salário. É o risco acumulado na operação da infraestrutura até que o técnico júnior atinja o mesmo nível de mestria.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800 shadow-xl">
            <h4 className="text-xl text-neutral-200 font-bold mb-8">Custo Oculto por Especialista:</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                <span className="text-neutral-400 text-lg">Recrutamento & Formação</span>
                <span className="font-mono text-white text-lg">€ 15.000</span>
              </div>
              <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                <span className="text-neutral-400 text-lg">Supervisão Sénior Adicional</span>
                <span className="font-mono text-white text-lg">€ 10.000</span>
              </div>
              <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                <span className="text-neutral-400 text-lg">Quebra de Produtividade</span>
                <span className="font-mono text-white text-lg">€ 20.000</span>
              </div>
              <div className="flex justify-between items-end pb-3">
                <span className="text-red-400 font-bold text-lg">Erros e Risco Operacional</span>
                <span className="font-mono text-white font-bold text-lg">€ 25.000</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-700 flex justify-between items-center bg-black/20 p-4 rounded-xl">
              <span className="font-bold text-white text-lg">Total Oculto por Técnico:</span>
              <span className="font-bold text-red-400 text-2xl">€ 70.000</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-950/40 to-neutral-900 p-12 rounded-3xl border border-red-500/20 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
            <h4 className="text-2xl text-neutral-200 font-semibold mb-4">Risco Financeiro Acumulado</h4>
            <p className="text-neutral-400 text-lg mb-8">Base: Reforma de 50 Especialistas a 5 anos</p>
            <div className="text-8xl font-black text-white mb-6 tracking-tighter">€3.5M</div>
            <p className="text-sm text-neutral-500 italic mt-4 max-w-xs">
              * Valores ilustrativos para modelação. O valor institucional será calibrado na fase de integração.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PILOT SUCCESS FRAMEWORK */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-widest mb-6 uppercase">
            Framework de Sucesso
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Validação Operacional em 90 Dias</h2>
          <p className="text-neutral-400 max-w-3xl mx-auto text-xl">
            A NEXUS assegura a validação da tecnologia num ambiente operacional real antes de qualquer compromisso de escalabilidade. Mitigamos o risco tecnológico e comprovamos o ROI no terreno.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-emerald-900/20 to-neutral-900 p-10 rounded-3xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.05)] transform hover:-translate-y-2 transition-transform duration-300">
            <div className="text-6xl mb-8">👑</div>
            <h4 className="text-3xl font-bold text-white mb-4">Knowledge Reuse Rate</h4>
            <div className="h-1 w-12 bg-emerald-500 mb-6 rounded-full"></div>
            <p className="text-emerald-400 text-sm font-black mb-4 tracking-widest">KPI SOBERANO</p>
            <p className="text-neutral-400 text-base leading-relaxed">
              Mede a percentagem de operações onde o conhecimento processual imutável, previamente extraído dos seniores, foi reutilizado com sucesso absoluto pela equipa júnior.
            </p>
          </div>
          
          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="text-6xl mb-8">📉</div>
            <h4 className="text-3xl font-bold text-white mb-4">Aceleração</h4>
            <div className="h-1 w-12 bg-blue-500 mb-6 rounded-full"></div>
            <p className="text-neutral-300 text-sm font-black mb-4 tracking-widest">OBJETIVO: -30% TEMPO</p>
            <p className="text-neutral-400 text-base leading-relaxed">
              Redução do tempo necessário para autonomia plena. Juniores executam infraestrutura crítica guiados em tempo-real pelo "Digital Twin" cinemático do mestre.
            </p>
          </div>

          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="text-6xl mb-8">🛡️</div>
            <h4 className="text-3xl font-bold text-white mb-4">Auditoria Perfeita</h4>
            <div className="h-1 w-12 bg-purple-500 mb-6 rounded-full"></div>
            <p className="text-neutral-300 text-sm font-black mb-4 tracking-widest">OBJETIVO: -20% ERROS</p>
            <p className="text-neutral-400 text-base leading-relaxed">
              Intervenções com divergência cinemática são abortadas pela *Risk Engine*. 100% das manobras geram um registo criptográfico irrefutável na blockchain corporativa.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LETTER OF INTENT (LOI) */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 text-sm font-bold tracking-widest mb-6 uppercase">
            Passo Seguinte
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Letter of Intent (LOI)</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-xl">
            Este é o ponto de partida formal. Um compromisso focado exclusivamente na partilha de valor, medição de risco e sucesso da operação em tempo real.
          </p>
        </div>

        <div className="bg-[#f8f9fa] text-neutral-900 p-12 md:p-20 rounded-2xl shadow-2xl font-serif text-base leading-relaxed relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-9xl font-black rotate-[-45deg] tracking-tighter">NEXUS</span>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-black text-center mb-10 border-b-4 border-neutral-900 pb-6 tracking-tight">
              LETTER OF INTENT (LOI)<br/>
              <span className="text-xl font-medium tracking-normal text-neutral-600 mt-2 block">Acordo de Continuidade Operacional e Preservação de Conhecimento</span>
            </h3>

            <div className="space-y-8">
              <p className="text-lg"><strong>Data:</strong> [Inserir Data]</p>
              <div className="bg-neutral-100 p-6 rounded-lg border border-neutral-200">
                <p className="text-lg mb-2"><strong>Entre:</strong></p>
                <p className="mb-2"><strong>NEXUS – Operational Intelligence Platform</strong> (doravante "NEXUS")</p>
                <p className="mb-2">e</p>
                <p><strong>[Nome da Entidade Parceira]</strong> (doravante "Parceiro")</p>
              </div>

              <h4 className="font-bold text-xl mt-12 border-b border-neutral-300 pb-2">1. Enquadramento</h4>
              <p className="text-justify">
                A presente Carta de Intenção formaliza a vontade mútua das partes em colaborar num projeto de Validação Operacional no Terreno (60 a 90 dias). A finalidade é a comprovação métrica e irrefutável dos mecanismos de preservação de conhecimento tácito e da eliminação de risco nas frentes de operação crítica.
              </p>

              <h4 className="font-bold text-xl mt-12 border-b border-neutral-300 pb-2">2. Âmbito Operacional</h4>
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Procedimento-Alvo:</strong> [Ex: Manutenção de Bomba X / Substituição de Válvula de Pressão]</li>
                <li><strong>Local:</strong> [Ex: ETAR / Subestação Elétrica / Centro Logístico]</li>
                <li><strong>Capacidade Mobilizada:</strong> 1-2 Técnicos Seniores; 3-5 Juniores; Equipa de Engenharia NEXUS.</li>
              </ul>

              <h4 className="font-bold text-xl mt-12 border-b border-neutral-300 pb-2">3. Métrica Soberana</h4>
              <div className="bg-blue-50 p-6 border-l-4 border-blue-600 rounded-r-lg">
                <p className="text-lg text-blue-900">
                  <strong>Knowledge Reuse Rate:</strong> A percentagem de execuções no terreno realizadas integralmente utilizando a memória processual previamente digitalizada pela plataforma.
                </p>
              </div>

              <h4 className="font-bold text-xl mt-12 border-b border-neutral-300 pb-2">4. Compromisso e Governança</h4>
              <p className="text-justify">
                A NEXUS providencia a infraestrutura tecnológica para a validação. O Parceiro assegura o ambiente operacional. Cumpridos os KPIs de sucesso, as partes iniciam, de imediato e de boa-fé, a estruturação da fase de expansão e produção da plataforma no ecossistema do Parceiro.
              </p>

              <div className="mt-20 pt-12 border-t-2 border-neutral-900 grid grid-cols-2 gap-12">
                <div>
                  <p className="mb-16 font-bold text-lg text-neutral-500 uppercase tracking-widest">Pelo Parceiro</p>
                  <div className="border-b-2 border-neutral-900 mb-3 w-full"></div>
                  <p className="text-sm font-bold">A Direção de Operações / Administração</p>
                </div>
                <div>
                  <p className="mb-16 font-bold text-lg text-neutral-500 uppercase tracking-widest">Pela NEXUS</p>
                  <div className="border-b-2 border-neutral-900 mb-3 w-full"></div>
                  <p className="text-sm font-bold">Denio Negrão <br/><span className="font-normal text-neutral-600">Founder & CTO</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-center space-x-6">
          <button className="bg-blue-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-500 transition-colors duration-300 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] flex items-center">
            <span className="mr-3">📄</span> Transferir LOI Oficial
          </button>
        </div>
      </section>

      <footer className="border-t border-neutral-900 bg-black py-12 text-center text-neutral-500 text-sm">
        <p className="mb-2 uppercase tracking-widest font-bold">NEXUS Operational Intelligence</p>
        <p>&copy; {new Date().getFullYear()} Solução Estratégica enquadrável nas Componentes de Transição Digital do PRR Nacional.</p>
      </footer>
    </div>
  );
}
