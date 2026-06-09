/**
 * @fileoverview Digital Procedure Manager
 * @description Translates isolated kinematic movements into structured Organizational Knowledge.
 *              This is the core of the Operational Knowledge Digital Twin.
 */

import { Landmark, MatchResult } from '../kinetic-engine';

export interface ProcedureStep {
    id: string;
    orderIndex: number;
    name: string;
    description: string;
    // The captured "golden" reference motion from the Senior Technician
    referenceKinematics: Landmark[][];
    // Safety thresholds or specific warnings for this step
    safetyThreshold: number; 
    criticalLandmarks?: number[]; // e.g. [4, 8] if thumb and index precision are vital
}

export interface DigitalProcedure {
    id: string;
    name: string;
    version: string;
    authorTechnicianId: string; // The Senior who recorded this
    assetId?: string;           // E.g., "Valve-Norte-001"
    steps: ProcedureStep[];
    createdAt: number;
    updatedAt: number;
    status: 'DRAFT' | 'VALIDATED' | 'DEPRECATED';
}

export interface StepExecutionResult {
    stepId: string;
    passed: boolean;
    score: number;
    kinematicQuality: number;
    timestamp: number;
}

export class DigitalProcedureManager {
    private procedures: Map<string, DigitalProcedure> = new Map();

    /**
     * Creates a new empty procedure (recorded by a Senior)
     */
    public createProcedure(name: string, authorId: string, assetId?: string): DigitalProcedure {
        const proc: DigitalProcedure = {
            id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            version: '1.0.0',
            authorTechnicianId: authorId,
            assetId,
            steps: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'DRAFT'
        };
        this.procedures.set(proc.id, proc);
        return proc;
    }

    /**
     * Adds a captured movement sequence as a formal step in the procedure
     */
    public addStepToProcedure(
        procedureId: string, 
        name: string, 
        description: string, 
        recordedKinematics: Landmark[][],
        criticalLandmarks: number[] = []
    ): ProcedureStep {
        const proc = this.procedures.get(procedureId);
        if (!proc) throw new Error(`Procedure ${procedureId} not found`);
        if (proc.status !== 'DRAFT') throw new Error(`Cannot modify a ${proc.status} procedure`);

        const step: ProcedureStep = {
            id: `step_${Date.now()}`,
            orderIndex: proc.steps.length,
            name,
            description,
            referenceKinematics: recordedKinematics,
            safetyThreshold: 75.0, // Minimum acceptable score by default
            criticalLandmarks
        };

        proc.steps.push(step);
        proc.updatedAt = Date.now();
        return step;
    }

    /**
     * Formalizes the procedure, making it ready for Junior replication
     */
    public formalizeProcedure(procedureId: string): DigitalProcedure {
        const proc = this.procedures.get(procedureId);
        if (!proc) throw new Error(`Procedure ${procedureId} not found`);
        if (proc.steps.length === 0) throw new Error(`Cannot formalize an empty procedure`);
        
        proc.status = 'VALIDATED';
        proc.updatedAt = Date.now();
        return proc;
    }

    /**
     * Evaluates a Junior's execution of a specific step against the Senior's formal reference
     */
    public evaluateStepExecution(
        procedureId: string, 
        stepId: string, 
        juniorKinematics: Landmark[][],
        kineticMatchResult: MatchResult // Output from KineticEngine.matchSequence
    ): StepExecutionResult {
        const proc = this.procedures.get(procedureId);
        if (!proc) throw new Error(`Procedure ${procedureId} not found`);
        
        const step = proc.steps.find(s => s.id === stepId);
        if (!step) throw new Error(`Step ${stepId} not found in procedure`);

        // The logic checks if the DTW score mapped from the Kinetic Engine exceeds the safety threshold
        const passed = kineticMatchResult.normalizedScore >= step.safetyThreshold;

        return {
            stepId: step.id,
            passed,
            score: kineticMatchResult.normalizedScore,
            kinematicQuality: kineticMatchResult.kinematicQuality,
            timestamp: Date.now()
        };
    }

    public getProcedure(id: string): DigitalProcedure | undefined {
        return this.procedures.get(id);
    }
}

export const procedureManager = new DigitalProcedureManager();
