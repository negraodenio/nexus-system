"use client";

import React, { useState } from 'react';
import { Camera, Send, AlertTriangle, Download, WifiOff, CheckCircle2 } from 'lucide-react';
import { useNexusEdge } from '@/lib/edge-ai/edge-context';

export function VisionDiagnostics() {
    const { status, progress, initializeEdge, generateResponse, compatibility, isReady } = useNexusEdge();
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setResponse(""); // Clear previous
        // Mocking "Vision" by prepending context if image was "captured" (not implemented in this v1)
        const result = await generateResponse(input);
        setResponse(result);
        setIsProcessing(false);
    };

    if (compatibility && !compatibility.canRun) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    Dispositivo Incompatível
                </div>
                <ul className="list-disc pl-5 mt-2 text-sm">
                    {compatibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <WifiOff className="w-5 h-5 text-emerald-400" />
                    Nexus Edge (Offline Mode)
                </h3>

                <p className="text-slate-300 text-sm mb-6">
                    Para suporte técnico sem internet, baixe o modelo de IA seguro (2GB).
                    Isso permite diagnóstico visual e tradução em tempo real.
                </p>

                {status === 'idle' || status === 'error' ? (
                    <button
                        onClick={initializeEdge}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Baixar Modelo Offline (2GB)
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 animate-pulse"
                                style={{ width: '100%' }} // Generic pulse since progress is text
                            />
                        </div>
                        <p className="text-xs text-center text-emerald-300 font-mono">{progress || "Iniciando..."}</p>
                    </div>
                )}

                {status === 'error' && (
                    <p className="text-red-400 text-xs mt-3 text-center">Erro ao baixar. Verifique espaço ou conexão.</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] bg-slate-950 rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 font-bold text-sm">Nexus Edge Active</span>
                </div>
                <span className="text-xs text-slate-500">Gemma-2B (Int4)</span>
            </div>

            {/* Output Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {response ? (
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{response}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                        <Camera className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Aguardando input visual ou texto...</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-white/10 space-y-3">
                <div className="flex gap-2">
                    <button className="p-3 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700">
                        <Camera className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Descreva o problema ou código de erro..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isProcessing}
                        className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                {isProcessing && <p className="text-xs text-emerald-400 text-center animate-pulse">Processando localmente...</p>}
            </div>
        </div>
    );
}
