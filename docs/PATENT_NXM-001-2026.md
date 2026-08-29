# PEDIDO PROVISÓRIO DE PATENTE (PPP)

## SYSTEM AND METHOD FOR CAPTURING, FORMALIZING, VALIDATING AND AUDITING OPERATIONAL KNOWLEDGE DERIVED FROM PHYSICAL TASK EXECUTION

### Requerente
NEXUS (Entidade a designar)

### Inventor(es)
Denio Negrão

### Referência Interna
NXM-PAT-002-2026

### Jurisdição Inicial
INPI Portugal (Pedido Provisório de Patente)

### Estratégia Internacional
Prioridade INPI seguida de extensão internacional via PCT e eventual depósito no European Patent Office (EPO).

---

# 1. CAMPO TÉCNICO

A presente invenção insere-se nos domínios da inteligência operacional, sistemas ciberfísicos, modelação computacional de procedimentos industriais, monitorização de execução física assistida por inteligência artificial e auditoria operacional verificável.

Mais especificamente, a invenção descreve um método computacional capaz de transformar a execução física de tarefas operacionais complexas em modelos digitais executáveis, permitindo a validação em tempo real de execuções subsequentes, a mitigação de risco operacional e a geração de evidência auditável.

---

# 2. PROBLEMA TÉCNICO

Infraestruturas críticas dependem fortemente de conhecimento operacional não documentado.

Grande parte das decisões que garantem segurança, eficiência e continuidade operacional reside na experiência acumulada de especialistas humanos.

Os sistemas atualmente disponíveis apresentam limitações fundamentais:

* Sistemas ERP e CMMS dependem de documentação textual e formulários.
* Sistemas de gestão de conhecimento dependem de conhecimento explicitamente documentado.
* Sistemas de visão computacional limitam-se à observação de movimentos sem compreender a estrutura operacional subjacente.
* Sistemas de auditoria registam eventos administrativos mas não validam a conformidade da execução física.

Consequentemente, não existe atualmente um mecanismo computacional capaz de capturar, formalizar, validar e auditar conhecimento operacional derivado da execução física humana.

---

# 3. SUMÁRIO DA INVENÇÃO

A invenção introduz um processo técnico integrado composto por cinco etapas principais:

### Etapa 1 – Captura Física
Aquisição de informação multimodal durante a execução de uma tarefa de referência por um operador experiente.
Os dados podem incluir:
* vídeo;
* profundidade;
* telemetria espacial;
* postura corporal;
* cinemática;
* utilização de ferramentas;
* sinais contextuais adicionais.

---

### Etapa 2 – Formalização Operacional
Transformação dos dados observados num **Operational Knowledge Execution Model (OKEM)**.

*Definição Formal do OKEM:* Representação computacional estruturada composta por:
* estados operacionais;
* transições válidas;
* dependências causais;
* limiares de conformidade;
* regras de intervenção.

O sistema diferencia automaticamente:
* componentes determinísticos da tarefa (invariantes críticas);
* componentes variáveis associados ao estilo individual do operador.

---

### Etapa 3 – Avaliação de Conformidade
Observação da execução subsequente por um segundo operador.
O sistema compara continuamente:
* geometria da execução;
* sequência temporal;
* contexto operacional;
* utilização de ferramentas;
contra o OKEM previamente construído.

---

### Etapa 4 – Intervenção de Risco
Quando a divergência operacional ultrapassa limiares definidos pelo OKEM, o sistema produz uma resposta operacional.
A resposta pode incluir:
* alerta;
* bloqueio;
* suspensão;
* escalonamento;
* recomendação operacional.
Esta intervenção ocorre antes da ocorrência do dano físico ou incumprimento operacional.

---

### Etapa 5 – Auditoria Verificável
A conformidade observada é convertida num registo verificável.
O registo incorpora:
* identidade operacional;
* contexto;
* histórico de execução;
* desvios autorizados;
* resultado da validação contra o OKEM.
O resultado é uma prova auditável da execução física observada.

---

# 4. CONTRIBUIÇÃO INVENTIVA E FÍSICA APLICADA

A presente invenção não reivindica visão computacional, grafos de conhecimento, inteligência artificial, blockchain ou criptografia de forma isolada. A contribuição inventiva reside no **método integrado que converte observação física humana em conhecimento operacional executável, validável e auditável.**

### 4.1. Physical Execution Normalization
O sistema aplica transformações matemáticas destinadas a normalizar a execução física observada relativamente à posição da câmara, orientação espacial do operador, vibração do sensor e ruído de captura. As transformações incluem métodos de projeção vetorial, normalização espacial, filtragem temporal e alinhamento elástico de sequências cinemáticas (ex: *Dynamic Time Warping*). Esta etapa permite comparar execuções realizadas em ambientes físicos distintos, mantendo a equivalência operacional.

O sistema cria uma ponte computacional rigorosa entre:
Execução Física → Normalização Cinemática → OKEM → Conformidade → Intervenção → Evidência Auditável

---

# 5. EFEITO TÉCNICO

A invenção produz efeitos técnicos mensuráveis na operação de campo:
* redução de desvios operacionais;
* redução de dependência de especialistas;
* aumento da conformidade de execução;
* prevenção de erros críticos e físicos;
* criação de evidência auditável da execução mecânica/física.

O sistema não apenas observa uma operação. O sistema **influencia, valida e governa fisicamente a operação em tempo real**.

---

# 6. REIVINDICAÇÕES

## Reivindicação 1 (Independente de Método)
Método implementado por computador para captura, formalização, validação e auditoria de conhecimento operacional derivado da execução física de tarefas, compreendendo:
a) aquisição de dados físicos representativos da execução de uma tarefa de referência;
b) construção de um Operational Knowledge Execution Model (OKEM) representativo da sequência operacional;
c) observação de uma execução subsequente e respetiva normalização espacial da telemetria capturada;
d) comparação entre a execução observada e o OKEM;
e) determinação de conformidade operacional;
f) geração de evidência auditável da execução.

## Reivindicação 2
Método de acordo com a reivindicação 1, caracterizado por incluir um mecanismo de intervenção operacional em tempo real quando a divergência observada excede limites definidos pelo OKEM.

## Reivindicação 3
Método de acordo com a reivindicação 1, caracterizado por identificar automaticamente componentes invariantes da tarefa física e distingui-los de componentes variáveis associados ao estilo individual do operador, utilizando essa distinção para determinar a conformidade operacional.

## Reivindicação 4
Método de acordo com a reivindicação 1, caracterizado por gerar um registo criptograficamente verificável representativo da conformidade operacional observada.

## Reivindicação 5
Método de acordo com a reivindicação 1, caracterizado por operar através de observação passiva da execução física sem exigir interação contínua através de interfaces gráficas.

## Reivindicação 6 (Independente de Sistema)
Sistema computacional para captura, formalização, validação e auditoria de conhecimento operacional derivado de execução física, compreendendo:
a) um módulo de captura multimodal;
b) um módulo de formalização com capacidade de normalização cinemática para geração do OKEM;
c) um módulo de validação de geometria e sequência de execução;
d) um módulo de intervenção de risco;
e) um módulo de auditoria criptográfica;
configurados em rede para executar autonomamente os passos metodológicos descritos na reivindicação 1.

## Reivindicação 7
Método de acordo com a reivindicação 1, caracterizado por a comparação temporal entre execuções recorrer a alinhamento elástico de sequências cinemáticas para suprimir a variabilidade estocástica da velocidade de execução.

## Reivindicação 8
Método de acordo com a reivindicação 1, em que os dados físicos observados são previamente normalizados num espaço de coordenadas absoluto para neutralizar discrepâncias de posição de câmara, orientação espacial do operador e ruído de captura.

---

> [!TIP]
> ### POSICIONAMENTO INSTITUCIONAL E GOVERNANÇA
> A NEXUS encontra-se a estruturar proteção de propriedade intelectual sobre um método proprietário de captura, formalização, validação e auditoria de conhecimento operacional derivado da execução física assistida por inteligência artificial, assente na sua arquitetura "OKEM".
> 
> O objetivo consiste na criação de uma nova infraestrutura tecnológica dedicada à preservação e governança de conhecimento operacional em infraestruturas críticas, assegurando Soberania Operacional a nível Europeu.
