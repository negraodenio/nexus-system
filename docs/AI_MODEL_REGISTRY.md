# AI MODEL REGISTRY
**Nexus Platform - EU AI Act Compliance**

**Last Updated:** 2026-01-12  
**Risk Classification:** HIGH-RISK AI SYSTEM  
**Compliance Framework:** EU AI Act Article 9-15

---

## SYSTEM CLASSIFICATION

**AI System Name:** Nexus Cognitive Adapter  
**Purpose:** Real-time explanation generation for technical, educational, and safety-critical contexts  
**Risk Level:** **HIGH-RISK**

**Justification:**
- Used in safety-critical contexts (equipment repair, technician guidance)
- Potential for harm if AI hallucinates incorrect instructions
- Decision-making support for physical tasks

---

## MODEL INVENTORY

### 1. GPT-5.2-Pro (OpenAI)

| Attribute | Value |
|:---|:---|
| **Provider** | OpenAI (via OpenRouter) |
| **Model ID** | `openai/gpt-5.2-pro` |
| **Version** | 5.2 |
| **Purpose** | Primary analogy generation, technical explanations |
| **Input** | Text prompts + optional images |
| **Output** | Structured JSON (analogy, visual data, skill queries) |
| **Max Tokens** | 4096 |
| **Temperature** | 0.5 (deterministic) |
| **Deployment Date** | 2026-01-08 |
| **Training Data Cutoff** | Unknown (proprietary) |

**Risk Mitigation:**
- Prompt engineering with explicit safety instructions
- JSON schema validation on outputs
- Human review for safety-critical use cases

---

### 2. Claude Opus 4.5 (Anthropic)

| Attribute | Value |
|:---|:---|
| **Provider** | Anthropic (via OpenRouter) |
| **Model ID** | `anthropic/claude-opus-4.5` |
| **Version** | 4.5 |
| **Purpose** | Fallback for complex reasoning, image analysis |
| **Input** | Text + images |
| **Output** | Structured JSON |
| **Max Tokens** | 4096 |
| **Temperature** | 0.5 |
| **Deployment Date** | 2026-01-08 |

**Risk Mitigation:**
- Constitutional AI principles (built-in safety)
- Explicit harm prevention in system prompts

---

### 3. Gemini 3 Pro (Google)

| Attribute | Value |
|:---|:---|
| **Provider** | Google (via OpenRouter) |
| **Model ID** | `google/gemini-3-pro-preview` |
| **Version** | 3.0 (preview) |
| **Purpose** | Multimodal analysis (text + image) |
| **Input** | Text + images |
| **Output** | Structured JSON |
| **Max Tokens** | 4096 |
| **Temperature** | 0.5 |
| **Deployment Date** | 2026-01-08 |

**Risk Mitigation:**
- Preview version - limited to non-critical use cases
- Fallback to GPT/Claude for safety-critical queries

---

### 4. DeepSeek V3.2

| Attribute | Value |
|:---|:---|
| **Provider** | DeepSeek (via OpenRouter) |
| **Model ID** | `deepseek/deepseek-v3.2` |
| **Version** | 3.2 |
| **Purpose** | Cost-efficient alternative for simple queries |
| **Input** | Text only |
| **Output** | Structured JSON |
| **Max Tokens** | 4096 |
| **Temperature** | 0.5 |
| **Deployment Date** | 2026-01-08 |

**Risk Mitigation:**
- Limited to low-risk educational content
- Not used for safety-critical instructions

---

### 5. Phi-3 Mini (Microsoft - Local)

| Attribute | Value |
|:---|:---|
| **Provider** | Microsoft (MLC-AI WebLLM) |
| **Model ID** | `Phi-3-mini-4k-instruct-q4f16_1-MLC` |
| **Version** | 3.0 |
| **Purpose** | Offline safety checks, content moderation |
| **Deployment** | Client-side (browser) |
| **Input** | Text prompts |
| **Output** | Short text responses |
| **Max Tokens** | 50 |
| **Temperature** | 0.1 (highly deterministic) |
| **Deployment Date** | 2026-01-10 |

**Risk Mitigation:**
- Runs locally (no data transmission)
- Used only for safety validation, not content generation

---

## HUMAN OVERSIGHT MECHANISMS

### 1. Content Moderation
- **Local Brain (Phi-3):** Pre-screens all AI outputs for harmful content
- **Threshold:** Any flagged content requires manual review

### 2. Safety-Critical Review
- **Trigger:** Any query containing keywords: "repair", "fix", "electrical", "chemical", "medical"
- **Process:** AI output tagged with warning: "Verify with professional before proceeding"

### 3. User Feedback Loop
- **Mechanism:** "Report Incorrect Information" button on all AI responses
- **Action:** Flagged responses reviewed within 24 hours

---

## PROMPT & OUTPUT LOGGING

**Status:** ⚠️ **NOT YET IMPLEMENTED** (Critical Gap)

**Planned Implementation:**
```sql
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    model_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    flagged BOOLEAN DEFAULT FALSE
);
```

**Retention:** 90 days (GDPR compliant)

---

## BIAS & SAFETY TESTING

**Status:** ❌ **NOT PERFORMED** (Critical Gap)

**Required Tests:**
1. **Demographic Bias:** Test outputs across age groups, languages, technical expertise
2. **Hallucination Rate:** Measure factual accuracy on 1000 sample queries
3. **Adversarial Prompts:** Test resistance to prompt injection attacks

**Target Completion:** Before production launch

---

## EXPLAINABILITY

**Mechanism:** All AI responses include:
1. **Detected Mode:** Which persona the AI adopted (Technician, Teacher, Detective, Zen)
2. **Core Ideas:** Key points extracted from the explanation
3. **Limits:** Warnings about what the analogy does NOT cover

**User Access:** Full prompt and response available via "View Details" button

---

## COMPLIANCE CHECKLIST (EU AI ACT)

| Requirement | Status | Evidence |
|:---|:---:|:---|
| Risk Assessment | ✅ COMPLETE | This document |
| Technical Documentation | ✅ COMPLETE | Model cards above |
| Record-Keeping (Logging) | ❌ MISSING | See "Planned Implementation" |
| Transparency | ✅ COMPLETE | Explainability section |
| Human Oversight | ✅ COMPLETE | Content moderation + review |
| Accuracy & Robustness | ⚠️ PARTIAL | Needs bias testing |
| Cybersecurity | ✅ COMPLETE | API keys secured, HTTPS enforced |

---

## INCIDENT RESPONSE

**Trigger:** AI generates harmful, biased, or factually incorrect content

**Procedure:**
1. User reports via feedback button
2. Content flagged in database
3. Manual review within 24 hours
4. If confirmed harmful: Model output disabled for similar queries
5. Root cause analysis and prompt engineering update

---

## REVIEW SCHEDULE

- **Monthly:** Review flagged interactions
- **Quarterly:** Bias testing on new model versions
- **Annually:** Full risk re-assessment

**Responsible Officer:** AI Governance Lead (TBD)

---

**Document Version:** 1.0  
**Next Review Date:** 2026-04-12
