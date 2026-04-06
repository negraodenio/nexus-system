'use client'

import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, Cpu, TrendingUp, Settings, Navigation, Eye, CheckCircle, Database, Thermometer, Zap, Gauge, Award } from 'lucide-react'
import { CertificateCard } from '@/components/certificate-card'

// === MOCK DATA (Synthetic Data Engine) ===
// Representa o schema `skill_executions` agroupado por equipamento
const EQUIPMENT_DATA = [
    {
        id: 'EQ-801-X',
        name: 'Turbina de Compressão Centrifugada',
        status: 'CRITICAL',
        failureProbability: 82,
        lastIntervention: 'Há 2 dias',
        technician: 'João S.',
        deviationContext: 'Landmark Deviation in Step 3 (Torque Adjustment)',
        deviationScore: 0.65, // Elevado (mau)
        suggestedSkillId: 'c23b49c7-5d0b-47e0-9e5c-111111111111', // Substituir por ID real se aplicável
        historicalFailures: 2,
    },
    {
        id: 'OLT-MA5800',
        name: 'Huawei OLT Node',
        status: 'WARNING',
        failureProbability: 45,
        lastIntervention: 'Há 1 semana',
        technician: 'Maria L.',
        deviationContext: 'Temporal Discrepancy (Hesitation during Cable Patching)',
        deviationScore: 0.35,
        suggestedSkillId: null,
        historicalFailures: 0,
    },
    {
        id: 'SYS-ROBOTIC-ARM',
        name: 'KUKA Kr16 Assembly',
        status: 'HEALTHY',
        failureProbability: 12,
        lastIntervention: 'Hoje',
        technician: 'Carlos M.',
        deviationContext: 'Near Perfect Execution (Sync Score: 94%)',
        deviationScore: 0.05,
        suggestedSkillId: null,
        historicalFailures: 0,
    }
]

export default function PredictiveDashboard() {
    const [currentTime, setCurrentTime] = useState('')
    const [thermalTemp, setThermalTemp] = useState(42.5)
    const [torqueNm, setTorqueNm] = useState(45)
    const [vibration, setVibration] = useState(0.8)
    const [showCert, setShowCert] = useState(false)

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString('pt-BR'))
        const i = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('pt-BR')), 1000)
        return () => clearInterval(i)
    }, [])

    // Live sensor simulation — small fluctuations every 2 seconds
    useEffect(() => {
        const sensorInterval = setInterval(() => {
            setThermalTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.8).toFixed(1)))
            setTorqueNm(prev => parseFloat((prev + (Math.random() - 0.5) * 1.5).toFixed(1)))
            setVibration(prev => parseFloat(Math.max(0.1, Math.min(3.0, prev + (Math.random() - 0.5) * 0.2)).toFixed(2)))
        }, 2000)
        return () => clearInterval(sensorInterval)
    }, [])

    const handleActionClick = (equipment: typeof EQUIPMENT_DATA[0]) => {
        // Redireciona para o Nexus (Adaptador Cognitivo) injetando o contexto do equipamento
        // O ideal é passar o ID do equipamento via query parameter ou estado
        const query = encodeURIComponent(`The ${equipment.name} (${equipment.id}) has a ${equipment.failureProbability}% failure probability due to ${equipment.deviationContext}. What is the mitigation procedure?`)
        window.location.href = `/nexus?q=${query}`
    }

    return (
        <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* TOP BAR */}
            <header className="border-b border-white/10 bg-[#0a101d] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Kinexus Command Center</h1>
                        <p className="text-xs text-indigo-400 font-medium">Physical Intelligence Platform v2.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm bg-black/40 px-4 py-2 rounded-full border border-white/5">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-400">Live Telemetry:</span>
                        <span className="font-mono text-white ml-2">{currentTime}</span>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {/* HERO STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Global Health Index</h3>
                        <p className="text-4xl font-bold text-white">87<span className="text-xl text-slate-500">/100</span></p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                            <TrendingUp className="w-4 h-4" /> +2.4% este mês
                        </div>
                    </div>
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Active Assets</h3>
                        <p className="text-4xl font-bold text-white">1,248</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                            Monitorizados em tempo real
                        </div>
                    </div>
                    <div className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-6 shadow-lg shadow-red-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                        <h3 className="text-sm font-medium text-red-400 mb-1">Critical Warnings</h3>
                        <p className="text-4xl font-bold text-red-500">3</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
                            <AlertTriangle className="w-4 h-4" /> Ação imediata requerida
                        </div>
                    </div>
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Cognitive Loop Engine</h3>
                        <p className="text-4xl font-bold text-white">Active</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-indigo-400">
                            <Cpu className="w-4 h-4" /> 14.2k Executions Processed
                        </div>
                    </div>
                </div>

                {/* ALERTS SECTION */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-500" />
                        Predictive Maintenance Alerts
                    </h2>
                    
                    <div className="space-y-4">
                        {EQUIPMENT_DATA.map((eq) => (
                            <div 
                                key={eq.id} 
                                className={`rounded-2xl border p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all hover:shadow-lg ${
                                    eq.status === 'CRITICAL' 
                                        ? 'bg-red-500/5 border-red-500/30 shadow-red-500/5 hover:border-red-500/50' 
                                        : eq.status === 'WARNING'
                                            ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                                            : 'bg-[#0f172a] border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        {eq.status === 'CRITICAL' && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                                        {eq.status === 'WARNING' && <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />}
                                        {eq.status === 'HEALTHY' && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
                                        <h3 className="text-xl font-bold text-white tracking-tight">{eq.name}</h3>
                                        <span className="font-mono text-xs text-slate-500 bg-black/50 px-2 py-1 rounded">{eq.id}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-slate-500 font-medium">Failure Probability</p>
                                            <p className={`text-2xl font-bold ${
                                                eq.failureProbability > 70 ? 'text-red-500' : 
                                                eq.failureProbability > 30 ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                                {eq.failureProbability}%
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500 font-medium">Kinematic Root Cause</p>
                                            <p className="text-white font-medium flex items-center gap-1">
                                                {eq.deviationContext}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500 font-medium">Last Intervention</p>
                                            <p className="text-white">{eq.lastIntervention} por <span className="font-medium">{eq.technician}</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500 font-medium">Sync Score</p>
                                            <p className="text-white">{(1 - eq.deviationScore) * 100}% Align</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 flex md:flex-col gap-3 w-full md:w-auto">
                                    {eq.status === 'CRITICAL' && (
                                        <button 
                                            onClick={() => handleActionClick(eq)}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 group"
                                        >
                                            <Navigation className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            Mitigate Risk (Nexus)
                                        </button>
                                    )}
                                    {eq.status !== 'CRITICAL' && (
                                        <button className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-colors border border-white/10">
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* SENSOR FUSION TELEMETRY PANEL */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-cyan-500" />
                        Sensor Fusion — Live Telemetry
                        <span className="ml-2 text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 animate-pulse">LIVE</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Thermal */}
                        <div className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl" />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <Thermometer className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">FLIR Thermal</p>
                                    <p className="text-[10px] text-red-400 font-mono">Camera T540</p>
                                </div>
                            </div>
                            <p className="text-4xl font-bold font-mono text-white">
                                {thermalTemp}<span className="text-xl text-slate-400">°C</span>
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className={`h-1.5 rounded-full flex-1 ${
                                    thermalTemp > 60 ? 'bg-red-500' : thermalTemp > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} style={{width: `${Math.min(100, thermalTemp)}%`}} />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">{thermalTemp > 60 ? '⚠️ Acima do limite' : thermalTemp > 40 ? '⚡ Faixa de atenção' : '✅ Normal'}</p>
                        </div>

                        {/* Torque */}
                        <div className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-3xl" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/10">
                                    <Zap className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Smart Wrench</p>
                                    <p className="text-[10px] text-cyan-400 font-semibold">BLE Torque Pro</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            </div>
                            <p className="text-5xl font-bold text-white" style={{fontVariantNumeric: 'tabular-nums'}}>
                                {torqueNm}<span className="text-xl text-slate-500 ml-1">Nm</span>
                            </p>
                            <div className="mt-4 space-y-1">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{width: `${Math.min(100, (torqueNm/80)*100)}%`}} />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">{torqueNm > 60 ? '⚠️ Risco de ruptura de rosca' : '✅ Dentro do limite (80Nm máx.)'}</p>
                        </div>

                        {/* Vibration */}
                        <div className="bg-[#0f172a] border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-3xl" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/10">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Vibration Sensor</p>
                                    <p className="text-[10px] text-purple-400 font-semibold">IoT Node v2</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            </div>
                            <p className="text-5xl font-bold text-white" style={{fontVariantNumeric: 'tabular-nums'}}>
                                {vibration}<span className="text-xl text-slate-500 ml-1">mm/s</span>
                            </p>
                            <div className="mt-4 space-y-1">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-purple-500 transition-all duration-700" style={{width: `${Math.min(100, (vibration/3)*100)}%`}} />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">{vibration > 2 ? '⚠️ Vibração anormal detetada' : '✅ Normal (limite: 3.0 mm/s)'}</p>
                        </div>
                    </div>
                </div>

                {/* CERTIFICATE SECTION */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Trust Protocol — Certificado Emitido
                    </h2>
                    <div className="bg-[#0f172a] border border-yellow-500/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-white font-semibold">Carlos M. — KUKA Kr16 Assembly</p>
                                    <p className="text-slate-500 text-sm">Score: 94/100 · Execução validada hoje às 14:32</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCert(!showCert)}
                                className="text-sm bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-4 py-2 rounded-xl transition-colors font-medium"
                            >
                                {showCert ? 'Ocultar' : 'Ver Certificado'}
                            </button>
                        </div>
                        {showCert && (
                            <CertificateCard
                                attestation={{
                                    skillTitle: "KUKA Kr16 — Calibração de Eixos (Level 3)",
                                    score: 94,
                                    ipfsHash: "a1b2c3d4-1234-5678-abcd-ef0123456789",
                                    transactionHash: "0xebd6678..." ,
                                    timestamp: Date.now(),
                                    network: "Polygon Amoy"
                                }}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

