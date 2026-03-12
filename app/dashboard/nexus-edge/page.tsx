"use client";

import { NexusEdgeProvider } from "@/lib/edge-ai/edge-context";
import { VisionDiagnostics } from "@/components/nexus-edge/vision-diagnostics";

export default function NexusEdgePage() {
    return (
        <NexusEdgeProvider>
            <div className="flex flex-col gap-6 p-6 h-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Nexus Edge (Offline)</h1>
                    <p className="text-slate-400">
                        Diagnóstico e suporte técnico sem dependência de internet.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Column: Diagnostics Interface */}
                    <div className="flex flex-col gap-4">
                        <VisionDiagnostics />

                        {/* Future: Kinetic Ghost Hand Placeholder */}
                        <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50 opacity-50">
                            <h3 className="text-sm font-bold text-slate-500 mb-2">Kinetic Ghost Hand (Coming Soon)</h3>
                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg">
                                <span className="text-xs text-slate-600">Aguardando implementação do módulo de visão</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Context/Instructions */}
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Como usar</h2>
                        <div className="space-y-4 text-slate-300 text-sm">
                            <p>
                                O Nexus Edge utiliza o modelo <strong>TranslateGemma (4B)</strong> otimizado para rodar diretamente no seu dispositivo.
                            </p>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong className="text-emerald-400">Modo Offline:</strong> Funciona sem Wi-Fi ou 4G. Ideal para caves ou falhas de rede.
                                </li>
                                <li>
                                    <strong className="text-emerald-400">Privacidade:</strong> Nenhuma imagem ou texto sai do seu telemóvel.
                                </li>
                                <li>
                                    <strong className="text-emerald-400">Diagnóstico Visual:</strong> Descreva os LEDs do router (ex: "PON piscando vermelho") para receber instruções imediatas.
                                </li>
                            </ul>

                            <div className="mt-6 p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-emerald-200 text-xs">
                                <strong>Nota Técnica:</strong> O download inicial (2GB) requer Wi-Fi. Certifique-se de ter bateria &gt; 20%.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NexusEdgeProvider>
    );
}
