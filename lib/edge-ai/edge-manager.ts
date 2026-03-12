import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";

export type DownloadStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

interface EdgeConfig {
    modelId: string; // e.g., "gemma-2b-it-q4f32_1-MLC"
    maxStorageBytes: number; // e.g., 2GB
}

export class EdgeManager {
    private engine: MLCEngine | null = null;
    private config: EdgeConfig;

    constructor(config: EdgeConfig) {
        this.config = config;
    }

    /**
     * Checks if the device is capable of running the model.
     * 1. WebGPU support
     * 2. Storage availability
     * 3. Network type (for download)
     */
    async checkReadiness(): Promise<{ canRun: boolean; canDownload: boolean; reasons: string[] }> {
        const reasons: string[] = [];
        let canRun = true;
        let canDownload = true;

        // 1. Check WebGPU
        if (!navigator.gpu) {
            reasons.push("WebGPU not supported (Browser/WebView too old).");
            canRun = false;
        }

        // 2. Check Storage Estimate
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota && estimate.usage) {
                const remaining = estimate.quota - estimate.usage;
                if (remaining < this.config.maxStorageBytes) {
                    reasons.push(`Low storage: ${(remaining / 1024 / 1024).toFixed(0)}MB free. Need 2GB.`);
                    canDownload = false; // logic: can still run if already downloaded? Hard to know without file check.
                }
            }
        }

        // 3. Check Network (only relevant for download)
        // @ts-ignore - navigator.connection is experimental
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            if (connection.saveData) {
                reasons.push("Data Saver mode is on.");
                canDownload = false;
            }
            // rough check for "wifi" usually involves evaluating 'type' or 'effectiveType'
            // forcing 4g/wifi requirement
            if (connection.type && connection.type !== 'wifi' && connection.type !== 'ethernet') {
                // This is a soft blocker, we allows override
                reasons.push(`Network is ${connection.type}. Wi-Fi recommended.`);
            }
        }

        return { canRun, canDownload, reasons };
    }

    /**
     * Initializes the engine and downloads weights if needed.
     * @param onProgress Callback for download progress
     */
    async initialize(onProgress: InitProgressCallback): Promise<void> {
        try {
            this.engine = await CreateMLCEngine(
                this.config.modelId,
                {
                    initProgressCallback: onProgress,
                    logLevel: "INFO"
                }
            );
            console.log("NexusEdge: Engine initialized successfully.");
        } catch (error) {
            console.error("NexusEdge: Initialization failed", error);
            throw error;
        }
    }

    async runInference(messages: { role: 'system' | 'user' | 'assistant', content: string }[]): Promise<string> {
        if (!this.engine) throw new Error("Engine not initialized. Call initialize() first.");

        try {
            const reply = await this.engine.chat.completions.create({
                messages: messages as any,
                temperature: 0.1, // Low temp for technical instructions
                max_tokens: 256, // succinct answers
            });

            return reply.choices[0].message.content || "";
        } catch (error) {
            console.error("NexusEdge: Inference failed", error);
            return "Erro ao processar localmente.";
        }
    }

    async unload() {
        if (this.engine) {
            await this.engine.unload();
            this.engine = null;
        }
    }
}

// Singleton Setup for "gemma-2b-it" (starting with 2B for safety as per SPEC)
export const nexusEdge = new EdgeManager({
    modelId: "gemma-2-2b-it-q4f32_1-MLC", // Using Gemma 2 2B (Optimized)
    maxStorageBytes: 2 * 1024 * 1024 * 1024 // 2GB
});
