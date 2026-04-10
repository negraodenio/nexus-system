# 📋 PLANO DE TESTES PROFISSIONAL
## Nexus Motion Physical Intelligence OS — v3.0

---

> **Documento:** QA-001-2026  
> **Produto:** Nexus Motion OS (https://3d-delta-puce.vercel.app)  
> **Versão Testada:** v3.0 (Physical Intelligence OS)  
> **Data:** 2026-04-06  
> **Destinatário:** QA Tester Externo  
> **Autor:** Nexus Motion / Engenharia  

---

## 1. AMBIENTE DE TESTE

### 1.1 Pré-Requisitos de Hardware e Software

| Requisito | Especificação Mínima | Observação |
|---|---|---|
| **Browser** | Chrome 120+ ou Edge 120+ | Firefox tem suporte limitado a camera APIs |
| **Câmera** | Webcam funcional (integrada ou USB) | Necessária para testes de Skill Recording |
| **SO** | Windows 10+ / macOS 12+ | iOS/Android para testes Mobile Responsivo |
| **Rede** | Conexão estável >10 Mbps | Sem VPN activa nos testes de API |
| **Resolução** | Mínimo 1280×720 | Testar também em 375×812 (mobile) |

### 1.2 URL Base de Produção

```
https://3d-delta-puce.vercel.app     ← URL Principal de Produção
https://nexusmotion.pt               ← Domínio Final (em configuração)
```

### 1.3 Credenciais de Teste

> ⚠️ **CONFIDENCIAL — Não partilhar fora da equipa de QA**

| Perfil | Email | Password | Permissão |
|---|---|---|---|
| **Admin / Criador** | `negraodenio@gmail.com` | *(confirmar com cliente)* | Total — criar, mint, ver tudo |
| **Tester Novo** | Criar conta nova com email `qa+test1@nexusmotion.pt` | `NexusQA2026!` | Standard user |

> 📌 Para criar conta nova: aceder a `/` → "Entrar no OS" → "Sign Up"

### 1.4 Ferramentas Necessárias

- **Browser DevTools** (F12): para inspecionar erros de console e respostas de rede
- **Postman ou Insomnia**: para testes de API directos (secção 7)
- **Ficheiro de imagem JPEG/PNG** (~500KB): para testar o upload de imagem no AI Cognitive Adapter
- **Câmera activa**: para testar Skill Recording

---

## 2. MAPA DE FUNCIONALIDADES

```
NEXUS MOTION OS
├── [ LP-01 ]  Landing Page (/)
├── [ AUTH-01 ] Autenticação (Sign Up / Login / Logout)
├── [ DASH-01 ] Dashboard Analytics (/dashboard)
├── [ SKILL-01 ] Skills — Lista e Reprodução (/skills)
├── [ SKILL-02 ] Skills — Gravação e Criação (/skills)
├── [ AI-01 ]   Cognitive Adapter — Motor de IA Textual
├── [ AI-02 ]   Cognitive Adapter — Motor de IA com Visão (imagem)
├── [ AI-03 ]   Motion GPT — Geração de Kinematic Recipe
├── [ AI-04 ]   Motion Predictor — Predição Neuromuscular
├── [ TELECOM-01 ] Vertical Telecom AI (/telecom)
├── [ MKT-01 ]  Marketplace (/dashboard/marketplace)
├── [ CERT-01 ] Mint de Certificado (Blockchain Attestation)
├── [ VERIFY-01 ] Verificação de Certificado (/verify)
├── [ MOBILE-01 ] Responsividade Mobile
└── [ API-01 ]  Health Check e APIs (via DevTools)
```

---

## 3. MÓDULO LP — LANDING PAGE

### TC-LP-001 | Hero e Navegação

**Pré-condição:** Utilizador não autenticado  
**URL:** `https://3d-delta-puce.vercel.app/`

**Passos:**
1. Abrir URL no browser (modo anónimo / sem sessão activa)
2. Verificar que a página carrega sem erros de console (F12 → Console)
3. Observar o Header: deve ter logo NEXUSMOTION, nav links, botão "Entrar no OS"
4. Verificar o título hero: **"O Movimento como Software."** com gradiente azul/roxo
5. Verificar o kicker: "PHYSICAL INTELLIGENCE OS · EM PRODUÇÃO · NEXUSMOTION.PT"
6. Verificar o pipeline "Motion as Code" com 5 steps: `EMG.capture()`, `vector.embed()`, `rag.diff()`, `llm.patch()`, `chain.commit()`
7. Clicar em "Aceder ao Dashboard" → deve redirecionar para `/dashboard` (ou login se não autenticado)
8. Clicar em "Ver Telecom AI →" → deve redirecionar para `/telecom`
9. Clicar nos links do nav: Tecnologia, Verticais, Economia, Patente → deve fazer scroll suave para cada secção

**Resultado Esperado:**
- ✅ Página carrega em <3 segundos
- ✅ Sem erros vermelhos no console
- ✅ Todos os links funcionam
- ✅ Pipeline visual exibido correctamente

**Se der erro:**
| Sintoma | Causa Provável | Acção |
|---|---|---|
| Página em branco | Build com erro | F12 → Console, copiar erro e reportar |
| Erro 404 | URL incorrecta | Confirmar URL exacta com o cliente |
| Links não funcionam | Rota não configurada | Reportar número do link e URL destino |

---

### TC-LP-002 | Verticais Interactivos

**Passos:**
1. Fazer scroll até "Uma infraestrutura. Quatro mercados."
2. Clicar nos 4 botões de vertical: TELECOM AI, COGNITIVE ED, LOGISTICS 4.0, SMART MFG
3. Verificar que o card central muda ao clicar em cada tab
4. Verificar que as métricas mudam com cada vertical
5. Clicar em "Explorar Vertical" dentro do card → deve navegar para URL válido (não `#`)
6. Aguardar ~3 segundos: verificar que as tabs mudam automaticamente (auto-rotate a cada 2.8s)

**Resultado Esperado:**
- ✅ 4 tabs clicáveis com cores distintas
- ✅ Card muda com animação suave
- ✅ Botão "Explorar Vertical" navega para `/telecom` ou `/app`
- ✅ Auto-rotate funciona sem intervenção

---

### TC-LP-003 | Animações e Contadores

**Passos:**
1. Fazer scroll até secção "Métricas" com os 4 números grandes
2. Observar se os números animam ao entrar no viewport (contagem progressiva)
3. Verificar a barra de progresso azul no topo da página ao fazer scroll
4. Fazer scroll até ao fim → verificar secção "Instale o Physical OS."
5. Verificar footer: "© 2026 Nexus Motion · nexusmotion.pt · NXM-PAT-001-2026 (PCT Pending)"

**Resultado Esperado:**
- ✅ Contadores animam ao fazer scroll (4, 94%, 80%, 100%)
- ✅ Barra de progresso acompanha o scroll
- ✅ Footer com referência de patente

---

## 4. MÓDULO AUTH — AUTENTICAÇÃO

### TC-AUTH-001 | Registo de Nova Conta

**URL:** `https://3d-delta-puce.vercel.app/`

**Passos:**
1. Clicar em "Entrar no OS" (botão azul, canto superior direito)
2. Se aparecer modal/página de login, procurar opção "Sign Up" ou "Criar conta"
3. Preencher: Email `qa+test1@seudominio.com`, Password `NexusQA2026!`
4. Submeter o formulário
5. Verificar se há email de confirmação (verificar inbox ou spam)
6. Após confirmação, tentar login com as credenciais criadas

**Resultado Esperado:**
- ✅ Formulário aparece sem erros
- ✅ Conta criada com sucesso
- ✅ Redirecionado para dashboard após login

**Se der erro:**
| Sintoma | Causa | Acção |
|---|---|---|
| "Email already in use" | Email duplicado | Usar email diferente `qa+test2@...` |
| Sem confirmação de email | Email de confirmação | Verificar spam; aguardar 5 min |
| "Invalid credentials" | Password errada | Tentar reset password |

---

### TC-AUTH-002 | Login / Logout

**Passos:**
1. Com sessão activa, verificar que o avatar/email aparece no header
2. Aceder ao Dashboard → verificar que não redireciona para login
3. Clicar no ícone de logout (→ ícone no header)
4. Verificar que retorna à landing page sem sessão
5. Tentar aceder directamente a `/dashboard` → deve redirecionar para login

**Resultado Esperado:**
- ✅ Login persiste entre página-reloads
- ✅ Logout elimina sessão completamente
- ✅ Rota `/dashboard` é protegida

---

## 5. MÓDULO DASHBOARD — ANALYTICS

### TC-DASH-001 | Carregamento do Dashboard

**Pré-condição:** Utilizador autenticado como `negraodenio@gmail.com`  
**URL:** `https://3d-delta-puce.vercel.app/dashboard`

**Passos:**
1. Aceder ao `/dashboard`
2. Aguardar carregamento (spinner azul enquanto carrega)
3. Verificar os 3 cards de estatística:
   - **Total Skills** → deve mostrar número ≥ 0
   - **Total Views** → deve mostrar número ≥ 0
   - **Total Users** → deve mostrar 4 (há 4 perfis existentes)
4. Verificar secção "My Created Skills" → se vazia, deve mostrar link para criar
5. Verificar secção "Trending Skills (Last 7 Days)"
6. Clicar em "Create New" → deve navegar para `/skills`

**Resultado Esperado:**
- ✅ Dashboard carrega em <5 segundos
- ✅ Cards mostram números (não NaN, não undefined)
- ✅ "Total Users" mostra 4
- ✅ Sem erros 500 no console de rede (F12 → Network)

**Se der erro:**
| Sintoma | Causa | Acção |
|---|---|---|
| Stats mostram 0/0/0 | API `/api/analytics` com erro | F12 → Network → filtrar "analytics" → ver response |
| Error 500 na API | RPC ausente no Supabase | Reportar o erro completo da Network tab |
| "You haven't created any skills yet" com 0 skills | Normal se conta nova | Criar uma skill (TC-SKILL-002) |

---

## 6. MÓDULO SKILLS

### TC-SKILL-001 | Lista de Skills Públicas

**URL:** `https://3d-delta-puce.vercel.app/skills`

**Passos:**
1. Aceder sem autenticação (modo anónimo)
2. Verificar se lista de skills aparece
3. Se lista vazia: é comportamento esperado (banco sem seeds)
4. Clicar numa skill (se existir) → verificar que abre detalhe
5. Verificar que a skill mostra: título, categoria, dificuldade

**Resultado Esperado:**
- ✅ Página carrega sem erro 500
- ✅ Lista de skills (ou mensagem "Nenhuma skill ainda")
- ✅ Skills públicas visíveis sem autenticação

---

### TC-SKILL-002 | Criação e Gravação de Nova Skill ⭐ (Core Feature)

**Pré-condição:** Utilizador autenticado com câmera disponível  
**URL:** `https://3d-delta-puce.vercel.app/skills`

**Passos:**
1. Clicar em "Create New Skill" ou botão equivalente
2. Browser pedirá acesso à câmera → **clique em "Permitir"**
3. Verificar que feed de câmera aparece na janela
4. Verificar que a skeleton de pose aparece sobre a silhueta (pontos/linhas de tracking)
5. Preencher: Título `"Skill de Teste QA"`, Categoria `"Manutenção"`, Dificuldade `3`
6. Clicar em "Iniciar Gravação" (ou botão equivalente)
7. Fazer movimentos simples de braço durante 5-10 segundos
8. Clicar em "Parar" e depois "Guardar"
9. Verificar que skill aparece na lista e no Dashboard

**Resultado Esperado:**
- ✅ Câmera activa sem erros
- ✅ Pose tracking visível (pontos sobre o corpo)
- ✅ Skill gravada e guardada com ID único
- ✅ Aparece em "My Created Skills" no Dashboard

**Se der erro:**
| Sintoma | Causa | Acção |
|---|---|---|
| "Câmera não encontrada" | Permissão negada | Clicar no ícone de câmera na barra de address → Permitir |
| Tracking não aparece | MediaPipe não carregou | Refresh da página; verificar console |
| Erro ao guardar | Sessão expirada | Re-login e tentar novamente |

---

## 7. MÓDULO AI — MOTOR DE INTELIGÊNCIA ARTIFICIAL

### TC-AI-001 | Cognitive Adapter — Modo Texto (M2.7) ⭐

**URL:** `https://3d-delta-puce.vercel.app/app` (ou `/telecom`)

**Passos:**
1. Navegar para a app principal ou vertical Telecom
2. Localizar o campo de input do "Nexus AI" / "PRISMA Advisor"
3. Escrever: `"Como devo segurar uma chave de fendas para apertar um parafuso pequeno em espaço reduzido?"`
4. Submeter (Enter ou botão)
5. Aguardar resposta (pode demorar 2-5 segundos)
6. Verificar que a resposta é contextualizada e não genérica

**Resultado Esperado:**
- ✅ Resposta em <5 segundos
- ✅ Texto coerente com contexto de técnico de campo
- ✅ Resposta em português (ou idioma configurado)
- ✅ Sem mensagem de erro ("Something went wrong")

**Anotar no relatório:**
- Tempo de resposta: ___ segundos
- Qualidade da resposta: Excelente / Boa / Fraca / Sem contexto

---

### TC-AI-002 | Cognitive Adapter — Modo Visão (Gemini Flash) ⭐⭐

**Pré-condição:** Ficheiro de imagem JPEG/PNG disponível (ex: foto de um router, ferramenta, ou equipamento)

**Passos:**
1. No mesmo campo de AI, procurar ícone de upload de imagem (📎 ou câmera)
2. Fazer upload de uma imagem de equipamento técnico (router, switch, ferramenta)
3. Escrever: `"Analisa este equipamento. Que problemas visíveis identificas?"`
4. Submeter
5. Verificar que a resposta menciona elementos VISUAIS da imagem (não apenas texto genérico)
6. Abrir F12 → Network → verificar que o request foi para modelo `gemini` (não minimax)

**Resultado Esperado:**
- ✅ Resposta menciona elementos específicos da imagem
- ✅ Tempo de resposta <5 segundos
- ✅ Roteamento: modelo usado é Gemini Flash (verificar log "using vision model" se disponível)

**Se der erro:**
| Sintoma | Causa | Acção |
|---|---|---|
| Resposta genérica sem mencionar imagem | Roteamento não activou visão | F12 → Network → request para `/api/generate` → ver body |
| Upload não aceite | Formato não suportado | Tentar PNG ou JPEG <1MB |
| Timeout | Imagem muito pesada | Reduzir para <500KB |

---

### TC-AI-003 | Motion GPT — Geração de Kinematic Recipe

**Passos:**
1. Navegar para uma skill existente ou criar uma nova
2. Procurar opção "Gerar Receita Kinematic" ou "Motion GPT"
3. Input: `"Procedimento de aperto de conector RJ45 em patch panel"`
4. Submeter e aguardar (pode demorar 5-10 segundos)
5. Verificar que a resposta é um JSON estruturado com:
   - `joints` ou `frames` de movimento
   - Descrição dos ângulos e posições

**Resultado Esperado:**
- ✅ JSON estruturado retornado
- ✅ Tem campos de articulações/ângulos
- ✅ Sem erro 500

---

### TC-AI-004 | Motion Predictor — API de Predição

**Testado via API directamente (Postman / DevTools)**

**Passos:**
1. Abrir F12 → Console
2. Executar o seguinte JavaScript:
```javascript
fetch('/api/predict-motion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concept: 'aperto de parafuso com chave de fendas',
    targetFrames: [{ x: 0.5, y: 0.3, z: 0.1 }]
  })
}).then(r => r.json()).then(d => console.log('PREDICT:', d))
```
3. Verificar output no console

**Resultado Esperado:**
- ✅ Response com campo de análise/predição
- ✅ Status 200 (não 400 ou 500)

---

## 8. MÓDULO TELECOM — VERTICAL TELECOM AI

### TC-TELECOM-001 | Página Telecom AI

**URL:** `https://3d-delta-puce.vercel.app/telecom`

**Passos:**
1. Aceder ao URL
2. Verificar que a página carrega com identidade "Telecom AI" (não Nexus genérico)
3. Verificar o nome da empresa: deve mostrar "Telecom AI" (não "MEO")
4. Localizar o interface de Diagnóstico AR
5. Usar o campo de texto para input: `"O router está com luz laranja intermitente"`
6. Verificar resposta de diagnóstico contextualizada para telecom

**Resultado Esperado:**
- ✅ Branding "Telecom AI" presente
- ✅ Sem referência a "MEO" em nenhum elemento visível
- ✅ Diagnóstico responde com contexto de rede/telecom

**Verificação de Rebranding (crítico):**
- [ ] Confirmar: texto "Telecom AI" aparece nos headings
- [ ] Confirmar: NÃO aparece "MEO" em nenhum lugar da página
- [ ] Confirmar: certificados/contexto usam "Telecom AI"

---

## 9. MÓDULO MARKETPLACE

### TC-MKT-001 | Lista do Marketplace

**URL:** `https://3d-delta-puce.vercel.app/dashboard/marketplace`

**Passos:**
1. Aceder (autenticado)
2. Verificar que a página lista skills disponíveis para compra
3. Se vazia: mensagem "Nenhuma skill disponível" — é esperado em ambiente com sem seeds
4. Verificar que o balanço de Nexus Credits aparece (deve ser 1.000 NC para conta nova)

**Resultado Esperado:**
- ✅ Página carrega sem erro
- ✅ Balanço de Nexus Credits visível

---

### TC-MKT-002 | Mint de Skill no Marketplace (Monetização)

**Pré-condição:** Ter pelo menos 1 skill criada  
**Local:** Dashboard → "My Created Skills"

**Passos:**
1. No Dashboard, localizar uma skill na lista "My Created Skills"
2. Clicar no botão verde **"Mint"** ao lado da skill
3. Modal de Mint deve aparecer (preencher preço, title, descrição)
4. Preencher: Título `"Skill Teste QA"`, Preço `100`, Descrição `"Para testes"`
5. Clicar em "Mint to Marketplace"
6. Aguardar confirmação
7. Verificar se skill aparece no Marketplace

**Resultado Esperado:**
- ✅ Modal de Mint abre correctamente
- ✅ Formulário aceita input
- ✅ Após submit: skill listada no Marketplace
- ✅ Transação registada (verificar com Supabase se possível)

---

## 10. MÓDULO CERTIFICADOS — BLOCKCHAIN ATTESTATION

### TC-CERT-001 | Verificação de Certificado

**URL:** `https://3d-delta-puce.vercel.app/verify/[id]`  
*(Substituir [id] por ID real de atestação se disponível)*

**Passos:**
1. Se não houver ID de atestação disponível, ir a `/verify`
2. Verificar que a página mostra interface de verificação
3. Inserir qualquer texto no campo de verificação para testar validação de input
4. Se houver `transaction_hash` de um certificado emitido, introduzir para verificar

**Resultado Esperado:**
- ✅ Página de verificação acessível sem autenticação (pública por design)
- ✅ Campo de verificação funcional
- ✅ Com hash válido: mostra dados da atestação

---

## 11. MÓDULO MOBILE — RESPONSIVIDADE

### TC-MOBILE-001 | Landing Page em Mobile

**Passos:**
1. Abrir DevTools (F12) → Toggle Device Toolbar (ícone de telemóvel)
2. Seleccionar "iPhone 12" (390×844) e "Galaxy S21" (360×800)
3. Verificar landing page:
   - Header: menu deve colapsar (hamburger ou hidden na mobile)
   - Hero: título deve quebrar correctamente
   - Pipeline: scroll horizontal deve funcionar
   - Verticais: tabs devem ser scrolláveis
4. Testar em orientação landscape também

**Resultado Esperado:**
- ✅ Sem overflow horizontal (scroll lateral indesejado)
- ✅ Texto legível a todos os tamanhos
- ✅ Botões com área de toque adequada (>44px)
- ✅ Sem elementos sobrepostos

---

## 12. MÓDULO API — HEALTH CHECKS

### TC-API-001 | Health Check de Sistema

**No browser (sem autenticação):**

| URL | Método | Resultado Esperado |
|---|---|---|
| `/api/health` | GET | `{ status: "ok" }` |
| `/api/skills` | GET | Lista de skills (array JSON) |
| `/api/metrics` | GET | Métricas do sistema |

**Passos:**
1. Abrir cada URL acima directamente no browser
2. Verificar que retorna JSON válido (não HTML de erro)
3. Verificar status HTTP (deve ser 200, não 404 ou 500)

**Se der 404:** A rota não existe — reportar URL exacta  
**Se der 500:** Erro de servidor — copiar o body da resposta e reportar

---

### TC-API-002 | Analytics API

**Passos via Console do Browser (F12 → Console):**

```javascript
// Testar os 3 tipos de analytics
fetch('/api/analytics?type=overview').then(r => r.json()).then(d => console.log('OVERVIEW:', d))
fetch('/api/analytics?type=trending').then(r => r.json()).then(d => console.log('TRENDING:', d))
fetch('/api/analytics?type=my-skills').then(r => r.json()).then(d => console.log('MY_SKILLS:', d))
```

**Resultado Esperado:**
- OVERVIEW: `{ totalSkills: N, totalViews: N, totalUsers: 4 }`
- TRENDING: `{ trending: [...] }`
- MY_SKILLS: `{ skills: [...] }`

---

## 13. MATRIZ DE PRIORIDADE DOS TESTES

| Módulo | Prioridade | Estimativa de Tempo | Tipo |
|---|---|---|---|
| Auth (TC-AUTH-001, 002) | 🔴 Crítico | 20 min | Manual |
| Skill Recording (TC-SKILL-002) | 🔴 Crítico | 30 min | Manual |
| AI Texto TC-AI-001 | 🔴 Crítico | 15 min | Manual |
| AI Visão TC-AI-002 | 🔴 Crítico | 15 min | Manual |
| Landing Page TC-LP-001,002,003 | 🟠 Alto | 25 min | Manual |
| Dashboard TC-DASH-001 | 🟠 Alto | 15 min | Manual |
| Telecom Vertical TC-TELECOM-001 | 🟠 Alto | 20 min | Manual |
| Mint/Marketplace TC-MKT-002 | 🟡 Médio | 20 min | Manual |
| Mobile TC-MOBILE-001 | 🟡 Médio | 20 min | Manual |
| APIs TC-API-001,002 | 🟡 Médio | 20 min | Console |
| Certificados TC-CERT-001 | 🟢 Baixo | 10 min | Manual |

**Total Estimado:** ~3h30 de testes completos

---

## 14. TEMPLATE DE REPORTE DE BUG

Quando encontrar um erro, reportar com este formato:

```
──────────────────────────────────────────
BUG REPORT #[número]
──────────────────────────────────────────
TC ID:          [ex: TC-AI-002]
Módulo:         [ex: AI — Modo Visão]
Data/Hora:      [ex: 2026-04-10 14:30]
Browser:        [ex: Chrome 124 / Windows 11]

PASSOS PARA REPRODUZIR:
1. ...
2. ...
3. ...

RESULTADO OBTIDO:
[Descrever o que aconteceu]

RESULTADO ESPERADO:
[Descrever o que deveria acontecer]

SCREENSHOT: [anexar]
CONSOLE ERRORS: [copiar do F12 → Console]
NETWORK ERRORS: [copiar do F12 → Network → request com erro]
──────────────────────────────────────────
```

---

## 15. CRITÉRIOS DE ACEITAÇÃO

O sistema considera-se **APROVADO** se:

- ✅ TC-AUTH-001 e TC-AUTH-002: PASS (auth funciona)
- ✅ TC-SKILL-002: PASS (gravação de skill funciona)
- ✅ TC-AI-001: PASS (AI textual responde correctamente)
- ✅ TC-AI-002: PASS (AI visão menciona conteúdo da imagem)
- ✅ TC-TELECOM-001: PASS (sem referência a "MEO"; branding "Telecom AI")
- ✅ TC-LP-001: PASS (landing page sem erros de console)
- ✅ TC-DASH-001: PASS (dashboard mostra métricas, não vazio)

O sistema considera-se com **ISSUES CRÍTICOS** se qualquer dos itens acima for FAIL.

---

## 16. CONTACTOS DE SUPORTE

| Situação | Contacto |
|---|---|
| Bug crítico (sistema inacessível) | Reportar imediatamente ao cliente |
| Dúvida sobre funcionalidade esperada | Referir a este documento, secção do módulo |
| Acesso a credenciais adicionais | Solicitar ao cliente |
| Erro de API 500 persistente | Copiar resposta completa e enviar por email |

---

*Documento QA-001-2026 · Nexus Motion Physical Intelligence OS · v3.0*  
*Versão do documento: 1.0 — Para revisão do tester antes de iniciar*
