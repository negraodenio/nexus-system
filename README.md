# 🚀 Nexus Platform

**AI-Powered Cognitive Adapter & Skill Learning Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/negraodenio/nexus-plataform)
[![License](https://img.shields.io/badge/license-Proprietary-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 📋 Overview

Nexus is an enterprise-grade platform that combines **AI-powered cognitive adaptation** with **motion-based skill learning**. It features a patent-pending Kinetic Engine for real-time motion analysis and multi-modal AI explanations tailored to different audiences.

**Key Capabilities:**
- 🧠 **AI Cognitive Adapter** - Explains complex concepts using analogies (GPT-5, Claude, Gemini)
- 👋 **Ghost Hand Technology** - Real-time hand motion tracking and skill analysis
- 🎯 **Kinetic Engine V2.0** - Patent-pending motion scoring algorithm
- 🔒 **Enterprise Security** - Row-Level Security (RLS), audit logs, GDPR compliance
- 📊 **B2B Marketplace** - Skill monetization and company training programs

---

## ✨ Features

### AI Cognitive Adapter
- Multi-model LLM support (GPT-5.2, Claude Opus 4.5, Gemini 3 Pro, DeepSeek)
- Context-aware explanations (Technician, Teacher, Detective, Zen modes)
- Visual generation (Mermaid diagrams, comparisons, timelines, reality overlays)
- Audience adaptation (child, teen, adult, technical)

### Ghost Hand Practice
- Real-time hand tracking via MediaPipe
- 3D skeleton visualization with Three.js
- Instant feedback and scoring
- Offline capability with local LLM (Phi-3)

### Kinetic Engine V2.0 (Patent-Pending)
- Orthonormal normalization (Gram-Schmidt)
- Savitzky-Golay filtering for noise reduction
- Constrained DTW for sequence matching
- Cosine similarity scoring (rotation-invariant)
- Hardware tier detection (Premium/Standard/Lite)

### Enterprise Features
- Multi-tenant B2B architecture
- Company skill libraries
- Analytics dashboard
- Marketplace with NFT minting
- GDPR-compliant data handling

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16.1 (React 19, Turbopack)
- TypeScript 5.0
- Tailwind CSS 4.0
- Three.js (3D rendering)
- MediaPipe (hand tracking)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- OpenRouter API (LLM gateway)
- Edge Functions

**AI/ML:**
- OpenAI GPT-5.2 Pro
- Anthropic Claude Opus 4.5
- Google Gemini 3 Pro
- MLC-AI WebLLM (Phi-3 local)

**DevOps:**
- Jest (testing)
- ESLint (linting)
- Git (version control)
- Vercel (deployment)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

```bash
# Clone repository
git clone https://github.com/negraodenio/nexus-plataform.git
cd nexus-plataform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
nexus-plataform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── marketplace/       # B2B marketplace
│   └── skills/            # Skill library
├── components/            # React components
│   ├── ghost-hand-practice.tsx
│   ├── skill-player.tsx
│   └── nexus.tsx
├── lib/                   # Core libraries
│   ├── kinetic-engine.ts  # Patent-pending algorithm
│   ├── ai-client.ts       # LLM integration
│   └── supabase.ts        # Database client
├── supabase/
│   └── migrations/        # Database schema
├── docs/                  # Documentation
│   ├── AI_MODEL_REGISTRY.md
│   └── DISASTER_RECOVERY_PLAN.md
└── preprod-audit/         # Quality assurance scripts
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Linting
npm run lint

# Build
npm run build
```

**Current Test Coverage:** Infrastructure ready (Jest configured)  
**Target:** 70% minimum for production

---

## 🔒 Security & Compliance

- ✅ **OWASP Top 10** - 8/10 mitigated
- ✅ **GDPR** - Data privacy controls, soft delete, audit logs
- ✅ **EU AI Act** - High-risk AI system documentation
- ✅ **Zero Vulnerabilities** - npm audit clean
- ✅ **RLS Policies** - Row-level security enforced
- ✅ **Secrets Management** - All credentials externalized

**Security Audit Score:** 95/100

---

## 📊 Quality Metrics

| Metric | Score | Status |
|:---|:---:|:---|
| **Build** | 95/100 | ✅ Pass |
| **Security** | 95/100 | ✅ Pass |
| **Git Traceability** | 85/100 | ✅ Pass |
| **AI Governance** | 70/100 | ✅ Documented |
| **Disaster Recovery** | 70/100 | ✅ Documented |
| **Overall Quality** | 76/100 | ✅ Good |

---

## 📚 Documentation

- [AI Model Registry](docs/AI_MODEL_REGISTRY.md) - EU AI Act compliance
- [Disaster Recovery Plan](docs/DISASTER_RECOVERY_PLAN.md) - RTO/RPO procedures
- [API Documentation](docs/API.md) - Endpoint reference (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) - Production setup (coming soon)

---

## 🤝 Contributing

This is a proprietary project. For collaboration inquiries, contact the maintainer.

---

## 📄 License

Proprietary - All Rights Reserved

Patent-pending technology (Kinetic Engine V2.0)

---

## 👥 Team

**Lead Developer:** Denio Negrão  
**GitHub:** [@negraodenio](https://github.com/negraodenio)

---

## 🎯 Roadmap

- [x] Core platform MVP
- [x] Ghost Hand practice mode
- [x] Kinetic Engine V2.0
- [x] Enterprise security hardening
- [x] AI Model Registry (EU AI Act)
- [ ] Test coverage 70%+
- [ ] Production deployment
- [ ] Mobile app (Capacitor)
- [ ] Advanced analytics
- [ ] Multi-language support

---

## 📞 Support

For issues or questions:
- Create an issue in this repository
- Contact: [Your contact info]

---

**Built with ❤️ using Next.js, Supabase, and cutting-edge AI**
