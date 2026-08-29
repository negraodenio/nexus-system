/**
 * @fileoverview Invariant Extraction Engine V1.1
 * @description R&D Program A - Patent-aligned automatic discovery of operational invariants,
 *              critical landmarks, and generation of the Operational Knowledge Execution Model (OKEM)
 *              using K-Means high-dimensional clustering.
 * 
 * @version 1.1.0
 * @license Proprietary - Patent Pending
 */

import { Landmark, OrthonormalNormalizer, ConstrainedDTW } from '../kinetic-engine';
import { DigitalProcedure, ProcedureStep } from './digital-procedure';

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

export interface InvariantStep {
    stepIndex: number;
    name: string;
    description: string;
    referenceFrameIndex: number; // Index relative to the reference timeline
    referenceLandmarks: Landmark[];
    spatialVariance: number;      // Average variance in landmark positions across all runs
    durationMean: number;        // Average duration of transit/execution (ms)
    durationStdDev: number;      // Deviation in duration (ms)
    isCritical: boolean;         // True if spatial variance is below threshold (invariant)
}

export interface OKEM {
    id: string;
    procedureId: string;
    procedureName: string;
    createdAt: number;
    totalRunsAnalyzed: number;
    invariants: InvariantStep[];
    globalTemporalEnvelope: {
        meanDuration: number;
        stdDevDuration: number;
    };
}

/**
 * High-dimensional K-Means implementation for pose vector clustering
 */
class KMeans {
    public static cluster(data: number[][], k: number, maxIterations = 20): { centroids: number[][]; assignments: number[] } {
        const n = data.length;
        if (n === 0) return { centroids: [], assignments: [] };
        const dim = data[0].length;
        
        // Clamp k to be at most n
        const activeK = Math.min(k, n);
        
        // Initialize centroids (first activeK data points)
        const centroids = data.slice(0, activeK).map(pt => [...pt]);
        const assignments = Array(n).fill(-1);

        for (let iter = 0; iter < maxIterations; iter++) {
            let changed = false;

            // Assign points to nearest centroid
            for (let i = 0; i < n; i++) {
                const pt = data[i];
                let minD = Infinity;
                let bestC = 0;

                for (let c = 0; c < activeK; c++) {
                    const d = this.euclideanDistance(pt, centroids[c]);
                    if (d < minD) {
                        minD = d;
                        bestC = c;
                    }
                }

                if (assignments[i] !== bestC) {
                    assignments[i] = bestC;
                    changed = true;
                }
            }

            if (!changed) break;

            // Recompute centroids
            const counts = Array(activeK).fill(0);
            const sums = Array(activeK).fill(null).map(() => Array(dim).fill(0));

            for (let i = 0; i < n; i++) {
                const c = assignments[i];
                const pt = data[i];
                counts[c]++;
                for (let d = 0; d < dim; d++) {
                    sums[c][d] += pt[d];
                }
            }

            for (let c = 0; c < activeK; c++) {
                if (counts[c] > 0) {
                    for (let d = 0; d < dim; d++) {
                        centroids[c][d] = sums[c][d] / counts[c];
                    }
                }
            }
        }

        return { centroids, assignments };
    }

    private static euclideanDistance(a: number[], b: number[]): number {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += (a[i] - b[i]) * (a[i] - b[i]);
        }
        return Math.sqrt(sum);
    }
}

export class InvariantExtractionEngine {
    private normalizer: OrthonormalNormalizer;
    private dtw: ConstrainedDTW;

    constructor() {
        this.normalizer = new OrthonormalNormalizer();
        this.dtw = new ConstrainedDTW(0.15); // Slightly wider band for multi-expert alignment
    }

    /**
     * Extracts operational invariants from a dataset of multi-operator executions
     * @param procedureName - Name of the procedure to generate
     * @param executions - Array of executions, where each execution is a sequence of hand poses (Landmark[][])
     */
    public extractInvariants(procedureName: string, executions: Landmark[][][]): OKEM {
        if (executions.length < 3) {
            throw new Error('Invariant extraction requires at least 3 expert executions for statistical validity.');
        }

        const totalRunsAnalyzed = executions.length;

        // Step 1: Normalize all executions using Gram-Schmidt Palm-Relative Normalization
        const normalizedRuns = executions.map(run => 
            run.map(frame => this.normalizer.normalize(frame))
        );

        // Step 2: Choose reference run (the one closest to median length)
        const runLengths = normalizedRuns.map(run => run.length);
        const avgLength = runLengths.reduce((a, b) => a + b, 0) / runLengths.length;
        let medianIndex = 0;
        let minDiff = Infinity;
        for (let i = 0; i < runLengths.length; i++) {
            const diff = Math.abs(runLengths[i] - avgLength);
            if (diff < minDiff) {
                minDiff = diff;
                medianIndex = i;
            }
        }
        const referenceRun = normalizedRuns[medianIndex];

        // Step 3: Align all runs to the reference run using Constrained DTW
        const alignmentPaths: Array<Array<[number, number]>> = [];
        for (let i = 0; i < normalizedRuns.length; i++) {
            const dtwRes = this.dtw.compute(normalizedRuns[i], referenceRun);
            alignmentPaths.push(dtwRes.alignmentPath);
        }

        // Step 4: Compute Average Velocity profile on Fingertips along Reference Timeline
        const refLength = referenceRun.length;
        const velocities: number[] = Array(refLength).fill(0);
        const velocityCounts: number[] = Array(refLength).fill(0);

        for (let r = 0; r < normalizedRuns.length; r++) {
            const path = alignmentPaths[r];
            const run = normalizedRuns[r];

            for (let k = 1; k < path.length; k++) {
                const [runFrameIdx1, refFrameIdx1] = path[k - 1];
                const [runFrameIdx2, refFrameIdx2] = path[k];

                if (refFrameIdx1 === refFrameIdx2) continue; // Skip redundant mappings

                const v = this.calculateFrameVelocity(run[runFrameIdx1], run[runFrameIdx2]);
                velocities[refFrameIdx2] += v;
                velocityCounts[refFrameIdx2]++;
            }
        }

        const avgVelocities = velocities.map((v, idx) => 
            velocityCounts[idx] > 0 ? v / velocityCounts[idx] : 0
        );

        // Step 5: Identify Local Minima (Deceleration / Precision Points)
        const candidateFrameIndices = this.detectVelocityDips(avgVelocities);

        // Step 6: Validate Candidates & Calculate Spatial Variance using K-Means Clustering
        const spatialToleranceThreshold = 0.25; // Max allowable variance for an invariant
        const invariants: InvariantStep[] = [];
        let stepCounter = 0;

        for (const refIdx of candidateFrameIndices) {
            const alignedFrames: Landmark[][] = [];
            for (let r = 0; r < normalizedRuns.length; r++) {
                const path = alignmentPaths[r];
                const mappings = path.filter(p => p[1] === refIdx);
                if (mappings.length > 0) {
                    const runFrameIdx = mappings[Math.floor(mappings.length / 2)][0];
                    alignedFrames.push(normalizedRuns[r][runFrameIdx]);
                }
            }

            if (alignedFrames.length < normalizedRuns.length * 0.7) {
                continue; // Skip if less than 70% of runs aligned to this state
            }

            // Convert Landmark[][] to 63-dimensional vectors (21 landmarks * 3 coords)
            const vectors = alignedFrames.map(pose => 
                pose.flatMap(lm => [lm.x, lm.y, lm.z])
            );

            // Cluster poses into K=2 groups to separate the consensus execution style from styling/grip variations
            const k = 2;
            const { centroids, assignments } = KMeans.cluster(vectors, k);

            // Find the largest cluster
            const clusterCounts = Array(centroids.length).fill(0);
            assignments.forEach(c => clusterCounts[c]++);
            
            let largestClusterIdx = 0;
            let maxCount = -1;
            for (let c = 0; c < centroids.length; c++) {
                if (clusterCounts[c] > maxCount) {
                    maxCount = clusterCounts[c];
                    largestClusterIdx = c;
                }
            }

            // Reconstruct the mean consensus pose from the largest cluster centroid
            const consensusVector = centroids[largestClusterIdx];
            const meanLandmarks: Landmark[] = [];
            for (let l = 0; l < consensusVector.length; l += 3) {
                meanLandmarks.push({
                    x: consensusVector[l],
                    y: consensusVector[l + 1],
                    z: consensusVector[l + 2],
                    visibility: 1.0
                });
            }

            // Compute spatial variance strictly for the members of the consensus cluster
            const clusterMembers = vectors.filter((_, idx) => assignments[idx] === largestClusterIdx);
            let totalDist = 0;
            for (const member of clusterMembers) {
                let d = 0;
                for (let i = 0; i < member.length; i++) {
                    d += (member[i] - consensusVector[i]) * (member[i] - consensusVector[i]);
                }
                totalDist += Math.sqrt(d);
            }
            
            const variance = clusterMembers.length > 0 ? totalDist / clusterMembers.length : 0;
            const isCritical = variance <= spatialToleranceThreshold;

            const durationMean = 1500; // 1.5s default transition
            const durationStdDev = 300;  // 300ms default deviation

            invariants.push({
                stepIndex: stepCounter++,
                name: `Passo Invariante ${stepCounter} ${isCritical ? '(Crítico)' : '(Estilo)'}`,
                description: `Ponto de desaceleração técnica detetado no frame ${refIdx}. Variabilidade espacial (Cluster Consenso): ${variance.toFixed(3)}.`,
                referenceFrameIndex: refIdx,
                referenceLandmarks: meanLandmarks,
                spatialVariance: variance,
                durationMean,
                durationStdDev,
                isCritical
            });
        }

        // Calculate global duration parameters
        const durations = runLengths.map(l => l * 100); // Assuming 100ms per frame
        const meanDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const varianceDuration = durations.reduce((acc, val) => acc + Math.pow(val - meanDuration, 2), 0) / durations.length;
        const stdDevDuration = Math.sqrt(varianceDuration);

        return {
            id: `okem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            procedureId: `proc_gen_${Date.now()}`,
            procedureName,
            createdAt: Date.now(),
            totalRunsAnalyzed,
            invariants,
            globalTemporalEnvelope: {
                meanDuration,
                stdDevDuration
            }
        };
    }

    /**
     * Converts a generated OKEM model into a formal DigitalProcedure for operational replication
     */
    public convertToDigitalProcedure(okem: OKEM, authorId: string): DigitalProcedure {
        const steps: ProcedureStep[] = okem.invariants.map(inv => {
            const templateSequence = Array(5).fill(null).map(() => inv.referenceLandmarks);
            
            return {
                id: `step_inv_${inv.stepIndex}_${Date.now()}`,
                orderIndex: inv.stepIndex,
                name: inv.name,
                description: inv.description,
                referenceKinematics: templateSequence,
                safetyThreshold: inv.isCritical ? 85.0 : 70.0,
                criticalLandmarks: FINGERTIP_INDICES
            };
        });

        return {
            id: okem.procedureId,
            name: okem.procedureName,
            version: '1.0.0-OKEM',
            authorTechnicianId: authorId,
            steps,
            createdAt: okem.createdAt,
            updatedAt: Date.now(),
            status: 'VALIDATED'
        };
    }

    private calculateFrameVelocity(f1: Landmark[], f2: Landmark[]): number {
        let sum = 0;
        for (const idx of FINGERTIP_INDICES) {
            const dx = f1[idx].x - f2[idx].x;
            const dy = f1[idx].y - f2[idx].y;
            const dz = f1[idx].z - f2[idx].z;
            sum += dx * dx + dy * dy + dz * dz;
        }
        return Math.sqrt(sum);
    }

    private detectVelocityDips(velocities: number[]): number[] {
        const dips: number[] = [];
        const windowSize = 5; // Window for local minima

        for (let i = windowSize; i < velocities.length - windowSize; i++) {
            const current = velocities[i];
            let isMinimum = true;

            for (let w = -windowSize; w <= windowSize; w++) {
                if (w === 0) continue;
                if (velocities[i + w] < current) {
                    isMinimum = false;
                    break;
                }
            }

            if (isMinimum && current < 0.15) {
                dips.push(i);
                i += windowSize;
            }
        }

        return dips;
    }
}

export const invariantExtractionEngine = new InvariantExtractionEngine();
