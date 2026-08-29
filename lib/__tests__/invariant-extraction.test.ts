import { InvariantExtractionEngine } from '../core/invariant-extraction';
import { Landmark } from '../kinetic-engine';

describe('InvariantExtractionEngine', () => {
    let engine: InvariantExtractionEngine;

    // Helper to generate a valid mock hand pose (21 landmarks)
    const createHandPose = (fingertipOffset = 0, scale = 1.0): Landmark[] => {
        const landmarks: Landmark[] = [];
        
        // Wrist
        landmarks.push({ x: 0, y: 0, z: 0, visibility: 1.0 });
        
        // Thumb (1-4)
        for (let i = 1; i <= 4; i++) {
            landmarks.push({ 
                x: 0.1 * i, 
                y: 0.05 * i, 
                z: i === 4 ? fingertipOffset : 0, 
                visibility: 1.0 
            });
        }
        
        // Index MCP, PIP, DIP, TIP (5-8)
        for (let i = 1; i <= 4; i++) {
            landmarks.push({ 
                x: 0.05 * i, 
                y: 0.15 * i, 
                z: i === 4 ? fingertipOffset : 0, 
                visibility: 1.0 
            });
        }
        
        // Middle (9-12)
        for (let i = 1; i <= 4; i++) {
            landmarks.push({ 
                x: 0.0, 
                y: 0.2 * i, 
                z: i === 4 ? fingertipOffset : 0, 
                visibility: 1.0 
            });
        }
        
        // Ring (13-16)
        for (let i = 1; i <= 4; i++) {
            landmarks.push({ 
                x: -0.05 * i, 
                y: 0.18 * i, 
                z: i === 4 ? fingertipOffset : 0, 
                visibility: 1.0 
            });
        }
        
        // Pinky (17-20)
        for (let i = 1; i <= 4; i++) {
            landmarks.push({ 
                x: -0.1 * i, 
                y: 0.12 * i, 
                z: i === 4 ? fingertipOffset : 0, 
                visibility: 1.0 
            });
        }

        return landmarks.map(lm => ({
            x: lm.x * scale,
            y: lm.y * scale,
            z: lm.z * scale,
            visibility: lm.visibility
        }));
    };

    // Helper to generate a full sequence of frames with a velocity dip
    const createSequence = (length: number, dipFrame: number, noiseScale = 0): Landmark[][] => {
        const seq: Landmark[][] = [];
        
        for (let f = 0; f < length; f++) {
            let offset = 0;
            
            if (f < dipFrame) {
                // Moving hand tip
                offset = (f / dipFrame) * 0.5;
            } else if (f >= dipFrame && f < dipFrame + 5) {
                // Pause / Deceleration (dip)
                offset = 0.5;
            } else {
                // Moving again
                const remaining = length - (dipFrame + 5);
                offset = 0.5 + ((f - (dipFrame + 5)) / remaining) * 0.5;
            }

            // Add slight random noise to simulate style variance
            const noise = (Math.random() - 0.5) * noiseScale;
            seq.push(createHandPose(offset + noise));
        }

        return seq;
    };

    beforeEach(() => {
        engine = new InvariantExtractionEngine();
    });

    it('should fail if dataset has less than 3 executions', () => {
        const mockExecutions = [
            createSequence(30, 12)
        ];

        expect(() => {
            engine.extractInvariants('Test Procedure', mockExecutions);
        }).toThrow('Invariant extraction requires at least 3 expert executions for statistical validity.');
    });

    it('should successfully extract invariants and generate OKEM from multiple runs', () => {
        // Generate 3 runs with a deceleration dip around frame 12
        const mockExecutions = [
            createSequence(30, 12, 0.01),
            createSequence(32, 13, 0.01),
            createSequence(29, 11, 0.01)
        ];

        const okem = engine.extractInvariants('Montagem de Válvula', mockExecutions);

        expect(okem).toBeDefined();
        expect(okem.procedureName).toBe('Montagem de Válvula');
        expect(okem.totalRunsAnalyzed).toBe(3);
        expect(okem.invariants.length).toBeGreaterThan(0);
        
        // The first step should be marked as critical because spatial noise was very low (noiseScale = 0.01)
        expect(okem.invariants[0].isCritical).toBe(true);
        expect(okem.invariants[0].spatialVariance).toBeLessThan(0.1);
    });

    it('should identify non-critical (variant/style) actions when spatial variance is high', () => {
        // Run 1: Normal dip position
        // Run 2: Normal dip position
        // Run 3: Dip position has a major spatial shift (style change)
        const mockExecutions = [
            createSequence(30, 12, 0.01),
            createSequence(30, 12, 0.01),
            createSequence(30, 12, 0.3) // High noise scale means high spatial variation
        ];

        const okem = engine.extractInvariants('Procedimento Variável', mockExecutions);

        // Find the step corresponding to the dip
        const invariantStep = okem.invariants.find(inv => inv.referenceFrameIndex >= 10 && inv.referenceFrameIndex <= 15);
        
        if (invariantStep) {
            // Because Run 3 had a massive spatial offset (0.3), spatial variance should exceed threshold (0.25)
            // and the step should be marked as non-critical (variant/style)
            expect(invariantStep.isCritical).toBe(false);
        }
    });

    it('should convert an OKEM into a valid DigitalProcedure for execution matching', () => {
        const mockExecutions = [
            createSequence(30, 12, 0.01),
            createSequence(30, 12, 0.01),
            createSequence(30, 12, 0.01)
        ];

        const okem = engine.extractInvariants('Montagem de Válvula', mockExecutions);
        const procedure = engine.convertToDigitalProcedure(okem, 'tech_expert_01');

        expect(procedure).toBeDefined();
        expect(procedure.id).toBe(okem.procedureId);
        expect(procedure.name).toBe('Montagem de Válvula');
        expect(procedure.status).toBe('VALIDATED');
        expect(procedure.steps.length).toBe(okem.invariants.length);
        
        // The generated procedure steps should have the reference kinematics
        expect(procedure.steps[0].referenceKinematics.length).toBe(5);
        expect(procedure.steps[0].referenceKinematics[0]).toHaveLength(21);
    });
});
