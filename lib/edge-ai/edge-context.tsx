"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { nexusEdge, DownloadStatus } from "./edge-manager";
import { InitProgressReport } from "@mlc-ai/web-llm";

interface NexusEdgeContextType {
    status: DownloadStatus;
    progress: string; // "Downloading [10/24]: 45%"
    isReady: boolean;
    initializeEdge: () => Promise<void>;
    generateResponse: (input: string) => Promise<string>;
    compatibility: { canRun: boolean; reasons: string[] } | null;
}

const NexusEdgeContext = createContext<NexusEdgeContextType | undefined>(undefined);

export function NexusEdgeProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<DownloadStatus>('idle');
    const [progress, setProgress] = useState("");
    const [isReady, setIsReady] = useState(false);
    const [compatibility, setCompatibility] = useState<{ canRun: boolean; reasons: string[] } | null>(null);

    // Check compatibility on mount
    useEffect(() => {
        nexusEdge.checkReadiness().then((check) => {
            setCompatibility({ canRun: check.canRun, reasons: check.reasons });
            if (!check.canRun) {
                setStatus('error');
            }
        });
    }, []);

    const initializeEdge = useCallback(async () => {
        if (status === 'ready' || status === 'downloading') return;

        setStatus('checking');

        try {
            const check = await nexusEdge.checkReadiness();
            if (!check.canRun) {
                throw new Error("Device not compatible: " + check.reasons.join(", "));
            }

            setStatus('downloading');
            await nexusEdge.initialize((report: InitProgressReport) => {
                setProgress(report.text);
            });

            setStatus('ready');
            setIsReady(true);
        } catch (err) {
            console.error("Nexus Edge Init Error:", err);
            setStatus('error');
            setProgress("Falha na inicialização. Verifique armazenamento/rede.");
        }
    }, [status]);

    const generateResponse = useCallback(async (input: string) => {
        if (!isReady) return "Nexus Edge não está pronto.";

        return nexusEdge.runInference([
            { role: "system", content: "You are a helpful technician assistant for MEO. Answer concisely." },
            { role: "user", content: input }
        ]);
    }, [isReady]);

    return (
        <NexusEdgeContext.Provider value={{ status, progress, isReady, initializeEdge, generateResponse, compatibility }}>
            {children}
        </NexusEdgeContext.Provider>
    );
}

export function useNexusEdge() {
    const context = useContext(NexusEdgeContext);
    if (!context) throw new Error("useNexusEdge must be used within NexusEdgeProvider");
    return context;
}
