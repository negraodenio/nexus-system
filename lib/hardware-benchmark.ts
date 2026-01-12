/**
 * @fileoverview Hardware Qualification Benchmark
 * @description Runs performance tests on first app launch to determine
 *              device capability for advanced kinetic analysis.
 * 
 * @version 1.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

export interface BenchmarkResult {
    passed: boolean;
    tier: 'premium' | 'standard' | 'lite';
    scores: {
        cpu: number;
        gpu: number;
        memory: number;
        camera: number;
    };
    recommendations: string[];
    deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
    userAgent: string;
    cores: number;
    memory: number | null;
    gpu: string | null;
    screen: { width: number; height: number };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BENCHMARK_CONFIG = {
    // Minimum scores for each tier (0-100)
    TIERS: {
        premium: { cpu: 80, gpu: 70, overall: 75 },
        standard: { cpu: 50, gpu: 40, overall: 45 },
        lite: { cpu: 0, gpu: 0, overall: 0 },
    },

    // Test parameters
    CPU_ITERATIONS: 100000,
    MATRIX_SIZE: 100,
    TARGET_FRAME_TIME_MS: 16.67,
};

// =============================================================================
// BENCHMARK CLASS
// =============================================================================

export class HardwareBenchmark {
    private results: Partial<BenchmarkResult['scores']> = {};

    /**
     * Run full benchmark suite
     */
    async runAll(): Promise<BenchmarkResult> {
        const deviceInfo = this.getDeviceInfo();

        // Run individual benchmarks
        this.results.cpu = await this.benchmarkCPU();
        this.results.gpu = await this.benchmarkGPU();
        this.results.memory = this.benchmarkMemory();
        this.results.camera = await this.benchmarkCamera();

        // Calculate overall score and tier
        const overall = this.calculateOverall();
        const tier = this.determineTier(overall);
        const passed = tier !== 'lite';

        return {
            passed,
            tier,
            scores: this.results as BenchmarkResult['scores'],
            recommendations: this.generateRecommendations(tier),
            deviceInfo,
        };
    }

    /**
     * CPU Benchmark: Matrix operations (simulates kinetic math)
     */
    private async benchmarkCPU(): Promise<number> {
        const iterations = BENCHMARK_CONFIG.CPU_ITERATIONS;
        const size = BENCHMARK_CONFIG.MATRIX_SIZE;

        // Create test matrices
        const a = Array(size).fill(0).map(() =>
            Array(size).fill(0).map(() => Math.random())
        );
        const b = Array(size).fill(0).map(() =>
            Array(size).fill(0).map(() => Math.random())
        );

        const start = performance.now();

        // Matrix multiplication (simulates kinetic engine workload)
        for (let iter = 0; iter < iterations / 100; iter++) {
            const result = Array(size).fill(0).map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    for (let k = 0; k < size; k++) {
                        result[i][j] += a[i][k] * b[k][j];
                    }
                }
            }
        }

        const elapsed = performance.now() - start;

        // Score: lower time = higher score
        // 100 = <500ms, 0 = >5000ms
        const score = Math.max(0, Math.min(100, 100 - (elapsed - 500) / 45));

        return Math.round(score);
    }

    /**
     * GPU Benchmark: Canvas/WebGL rendering test
     */
    private async benchmarkGPU(): Promise<number> {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 1920;
                canvas.height = 1080;

                const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

                if (!gl) {
                    resolve(20); // No WebGL = low score but not zero
                    return;
                }

                // Check for high-performance extensions
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo
                    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                    : 'Unknown';

                // Simple draw test
                const start = performance.now();

                for (let i = 0; i < 1000; i++) {
                    gl.clearColor(Math.random(), Math.random(), Math.random(), 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                gl.finish();

                const elapsed = performance.now() - start;

                // Base score from timing
                let score = Math.max(0, Math.min(100, 100 - elapsed / 5));

                // Bonus for dedicated GPU
                if (/nvidia|amd|radeon|geforce|apple/i.test(renderer)) {
                    score = Math.min(100, score + 20);
                }

                resolve(Math.round(score));
            } catch {
                resolve(30);
            }
        });
    }

    /**
     * Memory Benchmark: Available memory check
     */
    private benchmarkMemory(): number {
        // @ts-expect-error - deviceMemory is not in all browsers
        const memory = navigator.deviceMemory;

        if (!memory) {
            return 50; // Unknown = assume average
        }

        // 8GB+ = 100, 4GB = 70, 2GB = 40, <2GB = 20
        if (memory >= 8) return 100;
        if (memory >= 4) return 70;
        if (memory >= 2) return 40;
        return 20;
    }

    /**
     * Camera Benchmark: Frame rate and resolution check
     */
    private async benchmarkCamera(): Promise<number> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            });

            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();

            // Stop stream immediately
            stream.getTracks().forEach(t => t.stop());

            let score = 50; // Base score

            // Resolution bonus
            if ((settings.width || 0) >= 1920) score += 20;
            else if ((settings.width || 0) >= 1280) score += 10;

            // Frame rate bonus
            if ((settings.frameRate || 0) >= 60) score += 30;
            else if ((settings.frameRate || 0) >= 30) score += 15;

            return Math.min(100, score);
        } catch {
            return 30; // Camera not available or permission denied
        }
    }

    /**
     * Calculate overall score (weighted average)
     */
    private calculateOverall(): number {
        const weights = { cpu: 0.4, gpu: 0.3, memory: 0.1, camera: 0.2 };

        let total = 0;
        let weightSum = 0;

        for (const [key, weight] of Object.entries(weights)) {
            const score = this.results[key as keyof typeof this.results];
            if (score !== undefined) {
                total += score * weight;
                weightSum += weight;
            }
        }

        return weightSum > 0 ? total / weightSum : 0;
    }

    /**
     * Determine performance tier based on scores
     */
    private determineTier(overall: number): BenchmarkResult['tier'] {
        if (overall >= BENCHMARK_CONFIG.TIERS.premium.overall) return 'premium';
        if (overall >= BENCHMARK_CONFIG.TIERS.standard.overall) return 'standard';
        return 'lite';
    }

    /**
     * Generate user-facing recommendations
     */
    private generateRecommendations(tier: BenchmarkResult['tier']): string[] {
        const recommendations: string[] = [];

        if (tier === 'lite') {
            recommendations.push(
                'Your device may not support advanced motion analysis.',
                'For best results, use a device with a more powerful processor.',
                'Lite Mode is enabled: visual overlay only (no precision scoring).'
            );
        } else if (tier === 'standard') {
            recommendations.push(
                'Standard Mode enabled: most features available.',
                'For premium precision, ensure good lighting conditions.'
            );
        } else {
            recommendations.push(
                'Premium Mode enabled: all advanced features available.',
                'Your device fully supports kinetic motion analysis.'
            );
        }

        // Camera-specific recommendations
        if ((this.results.camera || 0) < 50) {
            recommendations.push(
                'Camera performance is below optimal.',
                'Try improving lighting or using the rear camera.'
            );
        }

        return recommendations;
    }

    /**
     * Get device information
     */
    private getDeviceInfo(): DeviceInfo {
        let gpu: string | null = null;

        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch {
            // Ignore
        }

        return {
            userAgent: navigator.userAgent,
            cores: navigator.hardwareConcurrency || 1,
            // @ts-expect-error - deviceMemory is not in all browsers
            memory: navigator.deviceMemory || null,
            gpu,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
            },
        };
    }
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useHardwareQualification() {
    const [result, setResult] = useState<BenchmarkResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const runBenchmark = useCallback(async () => {
        setIsRunning(true);
        setError(null);

        try {
            const benchmark = new HardwareBenchmark();
            const benchmarkResult = await benchmark.runAll();

            // Cache result in localStorage
            localStorage.setItem('kinetic_hardware_tier', benchmarkResult.tier);
            localStorage.setItem('kinetic_benchmark_result', JSON.stringify(benchmarkResult));
            localStorage.setItem('kinetic_benchmark_date', new Date().toISOString());

            setResult(benchmarkResult);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Benchmark failed'));
        } finally {
            setIsRunning(false);
        }
    }, []);

    // Check for cached result on mount
    useEffect(() => {
        const cached = localStorage.getItem('kinetic_benchmark_result');
        const cachedDate = localStorage.getItem('kinetic_benchmark_date');

        if (cached && cachedDate) {
            // Use cache if less than 7 days old
            const age = Date.now() - new Date(cachedDate).getTime();
            if (age < 7 * 24 * 60 * 60 * 1000) {
                try {
                    setResult(JSON.parse(cached));
                    return;
                } catch {
                    // Invalid cache, will run new benchmark
                }
            }
        }

        // No valid cache, run benchmark
        runBenchmark();
    }, [runBenchmark]);

    return {
        result,
        isRunning,
        error,
        runBenchmark,
        tier: result?.tier || 'lite',
        isPremium: result?.tier === 'premium',
        isStandard: result?.tier === 'standard',
        isLite: result?.tier === 'lite',
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Quick tier check without running full benchmark
 */
export function getCachedTier(): BenchmarkResult['tier'] {
    const cached = localStorage.getItem('kinetic_hardware_tier');
    if (cached === 'premium' || cached === 'standard' || cached === 'lite') {
        return cached;
    }
    return 'lite'; // Default to safest mode
}

/**
 * Clear benchmark cache (for re-testing)
 */
export function clearBenchmarkCache(): void {
    localStorage.removeItem('kinetic_hardware_tier');
    localStorage.removeItem('kinetic_benchmark_result');
    localStorage.removeItem('kinetic_benchmark_date');
}

export default HardwareBenchmark;
