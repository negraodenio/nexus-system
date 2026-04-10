# PEDIDO PROVISÓRIO DE PATENTE
## "SISTEMA DE INTELIGÊNCIA FÍSICA DISTRIBUÍDA COM MEMÓRIA NEUROMUSCULAR VETORIAL E ATESTAÇÃO CRIPTOGRÁFICA DE COMPETÊNCIA FÍSICA"

---

**Requerente:** [NOME DO TITULAR / EMPRESA]  
**Inventor:** Denio Negrão  
**Data de Depósito:** 2026-04-06  
**Referência Interna:** NXM-PAT-001-2026  
**Jurisdição Sugerida:** PCT (Patent Cooperation Treaty) — Cobertura EU + US + BR  
**Classificação IPC:** G06F 40/58 · G06N 3/04 · A61B 5/0488 · G06Q 50/20

---

## CAMPO DA INVENÇÃO

A presente invenção refere-se a um sistema computacional distribuído denominado **Physical Intelligence OS**, que compreende:

1. Um motor de captura e vectorização de padrões neuromusculares humanos;
2. Um sistema de busca semântica em memória física baseado em embeddings vectoriais;
3. Um motor de raciocínio de inteligência artificial de grande escala contextual para análise e correção de execução física em tempo quasi-real;
4. Um subsistema de atestação criptográfica imutável de competência física via registo em cadeia de blocos.

---

## ANTECEDENTES DA INVENÇÃO (Prior Art)

As soluções existentes no estado da arte apresentam as seguintes limitações que a presente invenção supera:

**a) Sistemas de rastreio de movimento óptico** (ex: Google MediaPipe, OpenPose):
- Limitados a tracking 2D/3D visual sem capacidade cognitiva
- Sem memória de padrões anteriores; sem raciocínio semântico sobre qualidade de execução

**b) Plataformas de e-learning e LMS** (ex: Cornerstone, Docebo):
- Focadas em conhecimento declarativo sem captura de competência física
- Sem certificação verificável criptograficamente

**c) Sistemas de captura de movimento profissional** (ex: Vicon, Xsens):
- Hardware dedicado com custo proibitivo (>$50.000)
- Sem integração com modelos de linguagem para raciocínio contextual

**d) Large Language Models multimodais** (ex: GPT-4o, Gemini):
- Sem estrutura de dados persistente para padrões físicos
- Sem pipeline de captura física em tempo real; sem certificação de competência

**Conclusão:** Nenhum sistema do estado da arte integra o pipeline completo de captura física → vectorização neuromuscular → raciocínio semântico → correção motora → atestação imutável.

---

## SUMÁRIO DA INVENÇÃO

A presente invenção fornece um sistema e método para criação, armazenamento, recuperação e validação de padrões de competência física humana através de:

- **RAG Neuromuscular:** Padrões físicos convertidos em embeddings vectoriais com busca por similaridade coseno para recuperar o "Gold Master Build" relevante.
- **Motor de Raciocínio Físico:** LLM com janela de contexto alargada produz análise JSON estruturada com desvios, correções e risco ergonómico.
- **Roteamento Dinâmico de Modelos:** Selecção automática de modelo baseada em modalidade de input (visão vs. texto).
- **Ledger de Competência:** Registo imutável com hash IPFS + transação blockchain auditável.

---

## DESCRIÇÃO DETALHADA DA INVENÇÃO

### 1. Arquitectura Geral do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                PHYSICAL INTELLIGENCE OS                  │
│                                                         │
│  ┌──────────────┐    ┌─────────────────┐                │
│  │  CAPTURE     │    │ NEUROMUSCULAR   │                │
│  │  MODULE      │───▶│ RAG ENGINE      │                │
│  │              │    │                 │                │
│  │ · MediaPipe  │    │ · EMG Embedding │                │
│  │ · EMG Signal │    │ · pgvector DB   │                │
│  │ · Camera     │    │ · IVFFLAT Index │                │
│  └──────────────┘    └────────┬────────┘                │
│                               ▼                         │
│  ┌──────────────────────────────────────────────┐       │
│  │         HYBRID AI ROUTING ENGINE             │       │
│  │  input has image?                            │       │
│  │    YES → Vision Model (Gemini Flash)         │       │
│  │    NO  → Reasoning Model (MiniMax M2.7)      │       │
│  └─────────────────────────┬────────────────────┘       │
│              ┌─────────────┴─────────────┐              │
│              ▼                           ▼              │
│  ┌─────────────────┐         ┌─────────────────────┐    │
│  │ COGNITIVE       │         │ KINEMATIC RECIPE    │    │
│  │ ADAPTER (PRISMA)│         │ GEN (Motion GPT)    │    │
│  └────────┬────────┘         └──────────┬──────────┘    │
│           └──────────────┬──────────────┘               │
│                          ▼                              │
│  ┌────────────────────────────────────────────────┐     │
│  │         ATTESTATION & ECONOMY LAYER            │     │
│  │  · skill_attestations (SQL imutável / RLS)     │     │
│  │  · IPFS Hash + Polygon TX Hash                 │     │
│  │  · Nexus Credits (80/20 royalty split)         │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2. Vectorização Neuromuscular

O pipeline converte sinais físicos em vectores de 1536 dimensões:

```
Inputs: pose landmarks 3D | sinais EMG | imagens de campo
  → Normalização e calibração por utilizador
  → Geração de embedding (1536-dim)
  → Armazenamento em emg_patterns com índice IVFFLAT cosine
  → Isolamento por company_id (multi-tenant)
```

### 3. Motor RAG — Busca de Padrão de Referência

```sql
SELECT id, label, 1 - (embedding <=> query_embedding) AS similarity
FROM emg_patterns
WHERE company_id = p_company_id
  AND 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY embedding <=> query_embedding
LIMIT match_count;
```

O padrão mais similar é injectado como contexto RAG no LLM para raciocínio biomecânico.

### 4. Roteamento Dinâmico de Modelos (Motion Intelligence Router)

```typescript
const hasImage = !!image
const modelId = hasImage
    ? VISION_MODEL   // google/gemini-2.0-flash-001 — análise visual
    : DEFAULT_TEXT_MODEL  // minimax/minimax-m2.7 — raciocínio profundo
```

Configurável via variável de ambiente (`OPENROUTER_MODEL`) sem redeploy.

### 5. Atestação Imutável por RLS + Blockchain

```sql
-- Imutabilidade garantida a nível de base de dados:
CREATE POLICY "Attestations immutable no update"
  ON skill_attestations FOR UPDATE USING (false);

CREATE POLICY "Attestations immutable no delete"
  ON skill_attestations FOR DELETE USING (false);
```

Cada registo contém: `user_id`, `skill_id`, `score`, `ipfs_hash`, `transaction_hash`, `network`, `created_at`.

### 6. Economia de Competência — Função Atómica de Divisão

```
Compra de Skill (processo_skill_purchase):
  creator_cut = amount × (royalty_split / 100)  -- default: 80%
  platform_fee = amount - creator_cut           -- default: 20%
  batch_size multiplica o valor total para licenciamento corporativo
```

---

## REIVINDICAÇÕES

### Reivindicação 1 — Sistema (Independente)

Um sistema computacional de inteligência física distribuída compreendendo:

**(a)** módulo de captura para receber sinais físicos humanos (pose 3D, EMG, imagem);

**(b)** motor de vectorização para converter sinais em embeddings de alta dimensão e armazená-los em base de dados vectorial com índice de similaridade coseno e isolamento multi-tenant;

**(c)** motor RAG neuromuscular para recuperar, dado um sinal de entrada, o padrão de referência mais similar por vizinho mais próximo aproximado;

**(d)** motor de raciocínio de inteligência artificial com roteamento dinâmico baseado em modalidade de input, seleccionando modelo de visão para input visual e modelo de raciocínio para input textual/estruturado;

**(e)** módulo de atestação imutável que regista prova criptográfica de competência física com hash de conteúdo e identificador de transação em cadeia de blocos.

---

### Reivindicação 2 — Método (Independente)

Método implementado por computador para avaliação e certificação de competência física, compreendendo:

**(a)** capturar sinais físicos durante execução de habilidade;

**(b)** vectorizar sinais e recuperar padrão de referência por similaridade coseno;

**(c)** injectar padrão recuperado como contexto em LLM e gerar análise JSON estruturada com desvios, correções e risco ergonómico;

**(d)** quando qualidade superar limiar, emitir atestação imutável com prova criptográfica em cadeia de blocos.

---

### Reivindicação 3 — Roteamento Dinâmico (Dependente de 1)

O sistema da Reivindicação 1 em que o motor de raciocínio compreende módulo de roteamento que selecciona automaticamente modelo de visão computacional quando input contém imagem, e modelo de raciocínio textual caso contrário, sendo o modelo configurável via variável de ambiente sem redeploy.

---

### Reivindicação 4 — Isolamento Multi-Tenant (Dependente de 1)

O sistema da Reivindicação 1 em que a base de dados vectorial aplica política de isolamento por identificador de empresa (tenant), de modo que padrões de um tenant não são acessíveis a outros, preservando propriedade intelectual industrial.

---

### Reivindicação 5 — Imutabilidade por RLS (Dependente de 1)

O sistema da Reivindicação 1 em que o módulo de atestação implementa imutabilidade combinada: políticas RLS a nível de base de dados relacional que proíbem UPDATE e DELETE, e registo externo em cadeia de blocos para verificação independente.

---

### Reivindicação 6 — Economia de Competência (Dependente de 2)

O método da Reivindicação 2 compreendendo adicionalmente divisão automática de receita em que o criador recebe percentagem pré-configurada (default 80%) de cada transação de licenciamento, suportando licenciamento em lote para empresas.

---

### Reivindicação 7 — Motion as Code Paradigm (Dependente de 1 e 2)

O sistema das Reivindicações 1 e 2 em que o pipeline físico opera sob paradigma "Motion as Code" em que: sinais EMG constituem source code, motor de vectorização constitui compiler, desvios detectados constituem diffs, correções geradas constituem patches, e atestações emitidas constituem commits no ledger de competência.

---

## VANTAGENS TÉCNICAS

| Vantagem | Descrição |
|---|---|
| Acessibilidade | Hardware de consumo vs. $50k+ de sistemas profissionais |
| Privacidade Enterprise | RAG multi-tenant — dados proprietários nunca saem do tenant |
| Auditabilidade Regulatória | SQL imutável + blockchain = prova matemática de competência |
| Escalabilidade Económica | Custo de inferência -90% vs. soluções anteriores |
| Modularidade Multi-Vertical | Uma infra, múltiplos sectores via configuração de tenant |

---

## ABSTRACT

Sistema computacional de inteligência física distribuída que converte habilidades físicas humanas em activos digitais verificáveis. Compreende: captura de sinais físicos; vectorização e armazenamento com isolamento multi-tenant; RAG neuromuscular por similaridade coseno; motor de IA com roteamento dinâmico por modalidade; sistema de atestação criptográfica imutável com blockchain. Opera sob o paradigma "Motion as Code", permitindo versionar, auditar, corrigir e monetizar competências físicas como activos digitais.

---

> [!IMPORTANT]
> **Próximos Passos para Depósito:**
> 1. Preencher dados do requerente (nome completo, morada, NIF)
> 2. Contactar INPI Portugal: www.inpi.pt / Tel. +351 213 819 000
> 3. Alternativamente, solicitar pedido PCT via EPO: www.epo.org
> 4. **Prazo crítico:** Depositar o pedido provisório antes de qualquer divulgação pública. A data de depósito define a prioridade.
> 5. Custo estimado pedido provisório INPI: €500–1.500
> 6. Custo conversão PCT (12 meses): €3.000–8.000

*Documento v1.0 — 2026-04-06 | Referência NXM-PAT-001-2026*
