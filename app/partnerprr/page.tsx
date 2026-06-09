import React from 'react';

export default function PartnerPRRPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-8 uppercase">
            Proposta de Consórcio Estratégico
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            NEXUS <br/>
            <span className="text-3xl md:text-5xl text-blue-500 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              A Infraestrutura de Continuidade Operacional para Smart Cities, Utilities e Infraestruturas Críticas
            </span>
          </h1>
          <p className="text-2xl text-neutral-400 max-w-4xl mx-auto leading-relaxed font-light">
            Transformamos conhecimento operacional humano em ativos digitais reutilizáveis, auditáveis e escaláveis.
          </p>
        </div>
      </section>

      {/* 2. OPORTUNIDADE PRR E PORTUGAL 2030 */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800 bg-neutral-900/30">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-widest mb-6 uppercase">
            O *Timing* Perfeito
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">A Oportunidade PRR e Portugal 2030</h2>
          <p className="text-neutral-400 max-w-3xl mx-auto text-xl">
            Portugal e a União Europeia estão a investir milhares de milhões de euros na Transição Digital dos territórios.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800 shadow-xl col-span-1 md:col-span-3 lg:col-span-1">
            <h4 className="text-2xl font-bold text-white mb-4">O Fundo</h4>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Só a componente <strong>C19-i08 do PRR</strong> disponibiliza dezenas de milhões de euros para iniciativas ligadas a Plataformas de Gestão Urbana, Digital Twins, IA Soberana e Resiliência Operacional.
            </p>
          </div>
          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800 shadow-xl col-span-1 md:col-span-3 lg:col-span-1">
             <h4 className="text-2xl font-bold text-white mb-4 text-red-400">O Problema</h4>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Todos os projetos atuais financiam sensores, *dashboards* e infraestruturas físicas. <strong>Nenhum</strong> financia a preservação do conhecimento humano crítico necessário para operá-las diariamente.
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-neutral-900 p-10 rounded-3xl border border-emerald-500/30 shadow-xl col-span-1 md:col-span-3 lg:col-span-1">
             <h4 className="text-2xl font-bold text-white mb-4 text-emerald-400">A Oportunidade</h4>
            <p className="text-neutral-300 text-lg leading-relaxed">
              O NEXUS posiciona-se de forma única como a <strong>camada de Continuidade Operacional</strong> que preenche o vazio deixado pelas plataformas IoT de Smart Cities e Utilities.
            </p>
          </div>
        </div>
      </section>

      {/* 3. O QUE GANHA O PARCEIRO INTEGRADOR */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="mb-16">
          <div className="inline-block px-5 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-6 uppercase">
            A Vantagem Competitiva
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Benefícios para o Parceiro Integrador</h2>
          <p className="text-neutral-400 max-w-3xl text-xl">
            A parceria com a NEXUS não é apenas uma adição tecnológica. É um multiplicador de sucesso comercial e estratégico no mercado nacional e europeu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-blue-500/50 transition-colors">
            <span className="text-4xl mr-6">🏆</span>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Diferenciação em Concursos Públicos</h4>
              <p className="text-neutral-400">Oferta única no mercado focada na resiliência do capital humano, destacando a proposta do consórcio face à concorrência tradicional.</p>
            </div>
          </div>
          <div className="flex items-start p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-blue-500/50 transition-colors">
            <span className="text-4xl mr-6">📈</span>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Majoração em Candidaturas PRR</h4>
              <p className="text-neutral-400">Alinhamento direto com os critérios de inovação, capacitação digital e mitigação de risco exigidos nos fundos europeus.</p>
            </div>
          </div>
          <div className="flex items-start p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-blue-500/50 transition-colors">
            <span className="text-4xl mr-6">💶</span>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Nova Linha de Receita Consultiva</h4>
              <p className="text-neutral-400">Oportunidade para o parceiro faturar serviços de levantamento, mapeamento de processos e integração *enterprise*.</p>
            </div>
          </div>
          <div className="flex items-start p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-blue-500/50 transition-colors">
            <span className="text-4xl mr-6">🤖</span>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Entrada no Mercado de IA Aplicada</h4>
              <p className="text-neutral-400">Posicionamento imediato como pioneiro na aplicação de Inteligência Artificial Generativa e *Edge AI* na operação de infraestruturas.</p>
            </div>
          </div>
          <div className="flex items-start p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-blue-500/50 transition-colors md:col-span-2">
            <span className="text-4xl mr-6">🤝</span>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Co-desenvolvimento e Exploração Comercial</h4>
              <p className="text-neutral-400">Possibilidade de criar módulos verticais específicos (Água, Resíduos, Energia) e partilha do retorno financeiro na exploração.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. A CRISE SILENCIOSA (O PROBLEMA DE BASE) */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
         <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">A Crise Silenciosa da Continuidade Operacional</h3>
            <p className="text-neutral-400 text-lg leading-relaxed mb-8">
              Nos próximos 10 anos, milhares de especialistas irão reformar-se. O conhecimento que mantém cidades, redes de água, energia e telecomunicações a funcionar desaparece diariamente sem deixar rasto.
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

      {/* 5. BUSINESS CASE (MATEMÁTICA DA DOR) */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800 bg-neutral-900/30">
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

      {/* 6. MERCADO E ESCALA */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 text-sm font-bold tracking-widest mb-6 uppercase">
            Mercado e Escala
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">O PRR é apenas o ponto de entrada</h2>
          <p className="text-neutral-400 max-w-3xl mx-auto text-xl">
            Uma solução desenhada para escalar progressivamente por todas as camadas da operação territorial.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-neutral-800 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center mb-8 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-4 border-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
            <h4 className="text-white font-bold text-lg text-center">Municípios</h4>
          </div>
          
          <div className="relative z-10 flex flex-col items-center mb-8 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-4 border-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
            <h4 className="text-white font-bold text-lg text-center">CIMs</h4>
          </div>

          <div className="relative z-10 flex flex-col items-center mb-8 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-4 border-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
            <h4 className="text-white font-bold text-lg text-center">Utilities<br/><span className="text-sm text-neutral-400 font-normal">Água, Energia, Resíduos</span></h4>
          </div>

          <div className="relative z-10 flex flex-col items-center mb-8 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-4 border-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4">4</div>
            <h4 className="text-white font-bold text-lg text-center">Infraestruturas<br/><span className="text-sm text-neutral-400 font-normal">Críticas</span></h4>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-4 border-white flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-[0_0_30px_rgba(147,51,234,0.5)]">5</div>
            <h4 className="text-white font-bold text-lg text-center">Mercado Europeu<br/><span className="text-sm text-blue-300 font-normal">Mais de 80.000 entidades</span></h4>
          </div>
        </div>
      </section>

      {/* 7. PROPRIEDADE INTELECTUAL */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-b border-neutral-800">
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-12 rounded-3xl border border-neutral-800 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
               <div className="inline-block px-5 py-2 rounded-full bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm font-bold tracking-widest mb-6 uppercase">
                Proteção de Valor
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Estratégia de Propriedade Intelectual</h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                O NEXUS está a estruturar a proteção rigorosa de propriedade intelectual para o nosso método exclusivo, garantindo uma vantagem competitiva sustentável para o consórcio.
              </p>
              <div className="bg-black/30 p-6 rounded-xl border border-neutral-800">
                <p className="text-amber-400 font-bold mb-2">Foco da Patente:</p>
                <p className="text-neutral-300">Pedido Provisório de Patente (INPI) seguido de proteção internacional.</p>
              </div>
            </div>
            <div>
              <ul className="space-y-4">
                <li className="flex items-center p-4 bg-black/40 rounded-lg border border-neutral-800">
                  <span className="text-amber-500 mr-4 font-bold">01</span>
                  <span className="text-white">Captura de conhecimento operacional</span>
                </li>
                <li className="flex items-center p-4 bg-black/40 rounded-lg border border-neutral-800">
                  <span className="text-amber-500 mr-4 font-bold">02</span>
                  <span className="text-white">Formalização de procedimentos</span>
                </li>
                <li className="flex items-center p-4 bg-black/40 rounded-lg border border-neutral-800">
                  <span className="text-amber-500 mr-4 font-bold">03</span>
                  <span className="text-white">Transferência assistida</span>
                </li>
                <li className="flex items-center p-4 bg-black/40 rounded-lg border border-neutral-800">
                  <span className="text-amber-500 mr-4 font-bold">04</span>
                  <span className="text-white">Auditoria criptográfica</span>
                </li>
                <li className="flex items-center p-4 bg-black/40 rounded-lg border border-neutral-800">
                  <span className="text-amber-500 mr-4 font-bold">05</span>
                  <span className="text-white">Preservação institucional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. O PEDIDO (PRÓXIMO PASSO) E LOI */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <div className="inline-block px-5 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest mb-6 uppercase">
            Próximo Passo
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-8">A Nossa Proposta ao Parceiro</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-neutral-900 p-10 rounded-3xl border border-neutral-800">
            <h3 className="text-2xl font-bold text-white mb-6">Procuramos um parceiro estratégico para:</h3>
            <ul className="space-y-6">
              <li className="flex items-start">
                <span className="text-blue-500 mr-4 text-xl">🎯</span>
                <span className="text-neutral-300 text-lg">Validar um piloto operacional de Continuidade.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-4 text-xl">🇪🇺</span>
                <span className="text-neutral-300 text-lg">Participar em candidaturas PRR e Portugal 2030 (C19-i08).</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-4 text-xl">⚙️</span>
                <span className="text-neutral-300 text-lg">Co-desenvolver a solução para Utilities e Smart Cities.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-4 text-xl">🚀</span>
                <span className="text-neutral-300 text-lg">Escalar comercialmente o NEXUS em Portugal e na Europa.</span>
              </li>
            </ul>
          </div>
          <div className="bg-blue-900/10 p-10 rounded-3xl border border-blue-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">Entregáveis Imediatos:</h3>
            <ul className="space-y-4">
              <li className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-white font-medium flex justify-between items-center">
                <span>1. Assinatura da Carta de Intenções (LOI)</span>
                <span className="text-emerald-500">✓</span>
              </li>
              <li className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-white font-medium flex justify-between items-center">
                <span>2. Escolha do Caso de Uso Piloto</span>
                <span className="text-neutral-600">Pendente</span>
              </li>
              <li className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-white font-medium flex justify-between items-center">
                <span>3. Definição do Scope do Piloto</span>
                <span className="text-neutral-600">Pendente</span>
              </li>
              <li className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-white font-medium flex justify-between items-center">
                <span>4. Constituição do Grupo de Trabalho Conjunto</span>
                <span className="text-neutral-600">Pendente</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Carta de Intenção Compacta */}
        <div className="bg-[#f8f9fa] text-neutral-900 p-12 md:p-16 rounded-2xl shadow-2xl font-serif text-base relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-9xl font-black rotate-[-45deg] tracking-tighter">NEXUS</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-center mb-8 border-b-4 border-neutral-900 pb-6 tracking-tight">
              LETTER OF INTENT (LOI)<br/>
              <span className="text-xl font-medium tracking-normal text-neutral-600 mt-2 block">Acordo de Continuidade Operacional Estratégica</span>
            </h3>
            <div className="space-y-6">
              <p>A presente Carta de Intenção formaliza a vontade mútua de colaborar num projeto de Validação Operacional no Terreno (60-90 dias) e estruturar bases para candidaturas a financiamento e co-exploração comercial.</p>
              
              <div className="bg-neutral-100 p-6 border-l-4 border-blue-600">
                <p className="font-bold text-blue-900 mb-2">O Compromisso Imediato:</p>
                <p className="text-neutral-800">A NEXUS providencia a infraestrutura tecnológica. O Parceiro assegura o ambiente operacional. Cumpridos os KPIs de sucesso, as partes iniciam de imediato a estruturação da fase de expansão.</p>
              </div>

              <div className="mt-16 pt-8 border-t-2 border-neutral-900 grid grid-cols-2 gap-12">
                <div>
                  <p className="mb-12 font-bold text-neutral-500 uppercase">Pelo Parceiro</p>
                  <div className="border-b-2 border-neutral-900 mb-2 w-full"></div>
                  <p className="text-xs font-bold">Direção Estratégica</p>
                </div>
                <div>
                  <p className="mb-12 font-bold text-neutral-500 uppercase">Pela NEXUS</p>
                  <div className="border-b-2 border-neutral-900 mb-2 w-full"></div>
                  <p className="text-xs font-bold">Denio Negrão - Founder & CTO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-900 bg-black py-12 text-center text-neutral-500 text-sm">
        <p className="mb-2 uppercase tracking-widest font-bold">NEXUS Operational Intelligence</p>
        <p>&copy; {new Date().getFullYear()} Solução Estratégica enquadrável nas Componentes de Transição Digital do PRR Nacional.</p>
      </footer>
    </div>
  );
}
