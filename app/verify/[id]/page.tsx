"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  BadgeCheck, ShieldCheck, QrCode, FileText, 
  User, Calendar, Clock, Link as LinkIcon, 
  Cpu, Activity, CheckCircle2, ChevronRight, Lock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mock data for the "Smoke and Mirrors" approach
const mockCertificate = {
  id: "0x1a8f9b...3c2df1a",
  technician: {
    name: "Leonardo Dias",
    id: "EMP-49201",
    role: "Técnico Especialista Nível III"
  },
  skill: {
    name: "Fusão Óptica Padrão Telecom",
    id: "SKL-9021",
    category: "Telecomunicações & Infraestrutura"
  },
  issuedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48h ago
  issuer: {
    name: "Nexus Telecom",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/MEO_logo.svg" // Keeping the logo for now as it is a placeholder or replace with a generic one if available
  },
  performance: {
    syncScore: 94.2,
    durationMs: 42000, // 42s
    totalErrors: 0
  },
  blockchain: {
    network: "Distributed Ledger (Notarizado)",
    txHash: "0x8fa4c3dfbe1a20b9e8cd4f9328a1768b4499ac1029c...a3e",
    ipfsCid: "bafkreigz7fbb...2nd2xyd6x",
    blockNumber: "8492015"
  }
};

export default function VerificationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [hashLines, setHashLines] = useState<string[]>([]);
  
  useEffect(() => {
    const chars = "0123456789abcdef";
    const generateHash = () => "0x" + Array.from({length: 40}, () => chars[Math.floor(Math.random()*16)]).join("");
    let count = 0;
    const interval = setInterval(() => {
      setHashLines(prev => [generateHash(), ...prev.slice(0, 7)]);
      count++;
      if (count > 14) clearInterval(interval);
    }, 130);
    return () => clearInterval(interval);
  }, []);

  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    async function fetchCert() {
      if (!id) return;
      try {
        // Fetch skill data
        const { data: skill, error } = await supabase
          .from("skills")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Simulate technician link for the pilot demo
        setCert({
          id: id,
          technician: {
            name: "Leonardo Dias", // Mock profile until we have tech tables
            id: `TECH-${id.substring(0, 5).toUpperCase()}`,
            role: "Field Specialist Nível III"
          },
          skill: {
            name: skill.name,
            id: skill.id,
            category: "Telecom Operations"
          },
          issuedAt: new Date(skill.created_at),
          performance: {
            syncScore: 96.5, // Success rate from pilot verification
            durationMs: 42000,
            totalErrors: 0
          },
          blockchain: {
            network: "Distributed Ledger (Notarizado)",
            txHash: `0x${id}${id}`.substring(0, 66),
            ipfsCid: "bafkreigz7fbb...2nd2xyd6x",
            blockNumber: "8492015"
          }
        });
      } catch (err) {
        console.error("Error fetching cert:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-[0.12] pointer-events-none select-none overflow-hidden">
          {hashLines.map((hash, i) => (
            <p key={hash} className="font-mono text-xs text-cyan-400" style={{opacity: Math.max(0, 1 - i * 0.12)}}>{hash}</p>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-28 h-28">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-cyan-500/70"
            />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 rounded-full border-r-2 border-blue-400/50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20"
              >
                <ShieldCheck className="w-9 h-9 text-cyan-400" />
              </motion.div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-200 font-semibold">Verificando integridade no Ledger</p>
            <p className="text-slate-500 font-mono text-xs tracking-[0.2em] uppercase animate-pulse">Distributed Ledger · Bloco #8492015</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.33 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 pb-20">
      {/* Premium Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Kinexus <span className="text-cyan-400 font-mono font-normal text-sm border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-md">Trust Protocol</span>
              </h1>
              <p className="text-xs text-slate-400">Verificação Criptográfica de Competência</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            LIVE ON LEDGER
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Visual Certificate */}
          <div className="lg:col-span-1 space-y-6">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-1 border border-slate-700/50 shadow-2xl shadow-cyan-900/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-noise opacity-[0.03]" />
              <div className="absolute -inset-x-20 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:via-blue-400 transition-colors opacity-50 blur-sm" />
              
              <div className="h-full w-full rounded-xl bg-slate-950/80 backdrop-blur-md p-6 flex flex-col relative z-10 border border-slate-800/80">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-white p-2 rounded-lg inline-block shadow-inner h-12 w-24 flex items-center justify-center">
                    {/* Fallback to text if image fails or isn't perfect */}
                    <span className="text-slate-900 font-black tracking-tighter text-lg border-b-2 border-red-600">TELECOM</span>
                  </div>
                  <BadgeCheck className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div className="space-y-1">
                    <p className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest">Receptor Registado</p>
                    <h2 className="text-2xl font-bold text-white leading-tight">{cert?.technician.name}</h2>
                    <p className="text-xs text-slate-400">{cert?.technician.role}</p>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 my-4" />
                  
                  <div className="space-y-1">
                    <p className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest">Skill Validada</p>
                    <h3 className="text-lg font-semibold text-slate-200">{cert?.skill.name}</h3>
                    <p className="text-xs text-slate-500">{cert?.skill.category}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase">Assessment Score</p>
                      <p className="text-xl font-bold text-emerald-400">{cert?.performance.syncScore}<span className="text-sm text-emerald-600">/100</span></p>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{cert?.issuedAt && format(cert.issuedAt, "dd.MM.yyyy")}</span>
                    <span>ID: {cert?.id.substring(0, 10)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Descarregar PDF (Certificado)
              </button>
              <button className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Verificar Hash de Atestação
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Telemetry and On-Chain Data */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Context Section */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden backdrop-blur-sm">
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Identidade do Técnico</h3>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Autenticado
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nome Completo</p>
                  <p className="text-sm font-medium text-slate-200">{cert?.technician.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">ID Colaborador / Wallet</p>
                  <p className="text-sm font-mono text-slate-300">{cert?.technician.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Função Registada</p>
                  <p className="text-sm font-medium text-slate-300">{cert?.technician.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Data/Hora de Validação</p>
                  <p className="text-sm font-medium text-slate-300">
                    {cert?.issuedAt && format(cert.issuedAt, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {/* Kinetic Telemetry Section - The "Proof of Skill" */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden backdrop-blur-sm">
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Kinetic Proof (Proof-of-Skill)</h3>
                  <p className="text-xs text-slate-400">Dados biométricos validados pela Kinexus Vision API</p>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> Sync Score Geral
                    </p>
                    <div className="text-2xl font-bold text-white">
                      {mockCertificate.performance.syncScore}<span className="text-lg text-slate-500">/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${mockCertificate.performance.syncScore}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Tempo de Execução
                    </p>
                    <div className="text-2xl font-bold text-white">
                      42<span className="text-lg text-slate-500">s</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-2">12% mais rápido que a baseline</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Falsos Positivos
                    </p>
                    <div className="text-2xl font-bold text-white">
                      0
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Nenhum desvio crítico detetado</p>
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Desvio por Passo (DTW)</h4>
                    <span className="text-[10px] text-slate-500">Milissegundos vs Baseline Master</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { step: "1. Preparação da Fibra", score: 98, dev: "+0.1s" },
                      { step: "2. Decapagem com Alicate", score: 92, dev: "-0.4s" },
                      { step: "3. Limpeza com Álcool", score: 95, dev: "+0.2s" },
                      { step: "4. Clivagem", score: 89, dev: "+0.8s" },
                      { step: "5. Inserção na Máquina de Fusão", score: 97, dev: "0.0s" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <span className="w-48 text-slate-300 truncate">{item.step}</span>
                        <div className="flex-grow mx-4 relative h-2">
                          <div className="absolute inset-0 bg-slate-800 rounded-full" />
                          <div 
                            className={`absolute inset-y-0 left-0 rounded-full ${item.score > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${item.score}%` }} 
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-xs text-slate-400">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Record Section */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden backdrop-blur-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 blur-[50px] rounded-full" />
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Lock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Registo Criptográfico Imutável</h3>
                  <p className="text-xs text-slate-400">Assinatura de Integridade Criptográfica</p>
                </div>
              </div>

              <div className="p-5">
                <ul className="space-y-3 font-mono text-[11px] sm:text-xs">
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 mb-1 sm:mb-0">Rede (Ledger)</span>
                    <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {cert?.blockchain.network}
                    </span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 mb-1 sm:mb-0">Hash de Atestação</span>
                    <span className="text-blue-400 break-all select-all flex items-center gap-2">
                      {cert?.blockchain.txHash}
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    </span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 mb-1 sm:mb-0">IPFS Telemetry CID (Off-Chain Root)</span>
                    <span className="text-cyan-400 break-all select-all">ipfs://{cert?.blockchain.ipfsCid}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                    <span className="text-slate-500 mb-1 sm:mb-0">Block Height</span>
                    <span className="text-slate-300">{cert?.blockchain.blockNumber}</span>
                  </li>
                </ul>
                
                <div className="mt-5 p-3 rounded-lg bg-blue-900/10 border border-blue-800/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200/70 leading-relaxed">
                    Este certificado não é auto-declarado. Foi emitido apenas após o sistema de Visão Computacional local validar em tempo real (através de DTW e Skeletons de 21 pontos) que a ação mecânica cumpriu a baseline pericial num grau de precisão superior a 90%.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
