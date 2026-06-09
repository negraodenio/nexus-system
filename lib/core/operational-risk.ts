/**
 * @fileoverview Operational Risk Layer
 * @description Transforms static procedural memory and real-time kinematic conformity 
 *              into dynamic Risk Decisions. Evaluates Probability, Criticality, and Impact.
 */

import { knowledgeGraph, GraphNode } from './knowledge-graph';
import { StepExecutionResult, DigitalProcedure } from './digital-procedure';

export interface OperationalRiskAssessment {
    timestamp: number;
    procedureId: string;
    technicianId: string;
    assetId?: string;
    metrics: {
        probabilityOfFailure: number; // 0 to 100%
        assetCriticality: number;     // 0 to 100
        financialImpact: number;      // Estimated EUR cost of a failure
        riskScore: number;            // 0 to 100 (The ultimate KPI)
    };
    decision: 'SAFE' | 'WARNING' | 'CRITICAL_HALT';
    justification: string;
}

export class OperationalRiskEngine {
    
    /**
     * Assesses the real-time operational risk of a procedure execution
     */
    public evaluateRisk(
        executionResult: StepExecutionResult,
        procedureId: string,
        technicianId: string
    ): OperationalRiskAssessment {
        
        // 1. Fetch Context from the Knowledge Graph
        const ctx = knowledgeGraph.getProcedureContext(procedureId);
        const technicianNode = knowledgeGraph.upsertNode(technicianId, 'Technician', 'Unknown'); // Upsert just to ensure we have a node to check
        
        // 2. Assess Asset Criticality (Base Risk)
        const criticality = this.calculateAssetCriticality(ctx.assets);
        const financialImpact = this.estimateFinancialImpact(ctx.assets, ctx.incidents);

        // 3. Assess Probability of Failure (Human + Machine Risk)
        // Probability goes up if kinematic conformity goes down, or if technician is inexperienced.
        const kinematicErrorRate = 100.0 - executionResult.score;
        const experienceModifier = this.getTechnicianExperienceModifier(technicianNode);
        
        let probabilityOfFailure = (kinematicErrorRate * 1.5) * experienceModifier;
        probabilityOfFailure = Math.min(100, Math.max(0, probabilityOfFailure));

        // 4. Calculate Final Risk Score (Probability x Criticality)
        // Normalized to a 0-100 scale.
        const riskScore = (probabilityOfFailure * criticality) / 100.0;

        // 5. Decision Thresholds
        let decision: 'SAFE' | 'WARNING' | 'CRITICAL_HALT' = 'SAFE';
        let justification = 'Conformidade Operacional Adequada.';

        if (riskScore > 75 || probabilityOfFailure > 80) {
            decision = 'CRITICAL_HALT';
            justification = `ALERTA CRÍTICO: Risco ${riskScore.toFixed(1)}/100. Interromper Operação Imediatamente.`;
        } else if (riskScore > 40 || probabilityOfFailure > 50) {
            decision = 'WARNING';
            justification = `AVISO: Desvio Cinemático detectado em Ativo Crítico. Recomenda-se Supervisão.`;
        }

        return {
            timestamp: Date.now(),
            procedureId,
            technicianId,
            assetId: ctx.assets.length > 0 ? ctx.assets[0].id : undefined,
            metrics: {
                probabilityOfFailure,
                assetCriticality: criticality,
                financialImpact,
                riskScore
            },
            decision,
            justification
        };
    }

    /**
     * Determines the criticality score (0-100) based on the Assets involved
     */
    private calculateAssetCriticality(assets: GraphNode[]): number {
        if (assets.length === 0) return 30; // Default Low-Medium criticality

        let maxCriticality = 0;
        for (const asset of assets) {
            // In a real system, this would read from the Asset's CMMS metadata
            const type = asset.properties.type as string || '';
            let crit = 50; // Base
            if (type.includes('Principal') || type.includes('Alta Tensão') || type.includes('Subestação')) crit = 95;
            else if (type.includes('PVC') || type.includes('Válvula')) crit = 70;
            
            if (crit > maxCriticality) maxCriticality = crit;
        }
        return maxCriticality;
    }

    /**
     * Estimates the Euro impact of a failure based on associated incidents
     */
    private estimateFinancialImpact(assets: GraphNode[], incidents: GraphNode[]): number {
        let baseImpact = 5000; // Base 5k EUR
        
        // Increase impact if this procedure mitigates high-severity incidents
        for (const incident of incidents) {
            if (incident.properties.severity === 'HIGH' || incident.properties.severity === 'CRITICAL') {
                baseImpact += 45000;
            }
        }

        // Scale by asset count
        return baseImpact * Math.max(1, assets.length);
    }

    /**
     * Translates human experience into a risk modifier
     * Less experienced = higher multiplier on errors
     */
    private getTechnicianExperienceModifier(technician: GraphNode): number {
        const expStr = technician.properties.experience as string;
        if (!expStr) return 1.5; // Unknown = Assume Junior

        if (expStr.includes('months') || expStr.includes('meses')) {
            const months = parseInt(expStr);
            if (months < 12) return 2.0; // High risk multiplier for rookies
            return 1.5;
        }
        if (expStr.includes('years') || expStr.includes('anos')) {
            const years = parseInt(expStr);
            if (years > 10) return 0.5; // Seniors mitigate kinematic errors naturally
            if (years > 5) return 0.8;
            return 1.0;
        }
        return 1.2; // Default slight penalty
    }
}

export const operationalRiskEngine = new OperationalRiskEngine();
