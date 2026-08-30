import { KineticEngine, OrthonormalNormalizer, ConstrainedDTW } from '../kinetic-engine';
import { Landmark } from '../kinetic-engine';

describe('KineticEngine', () => {
    let engine: KineticEngine;

    beforeEach(() => {
        engine = new KineticEngine();
    });

    describe('OrthonormalNormalizer', () => {
        it('should normalize landmarks to palm-relative coordinates', () => {
            const normalizer = new OrthonormalNormalizer();

            // Mock hand landmarks (21 points with x, y, z)
            const mockLandmarks = Array(21).fill(null).map((_, i) => ({
                x: i * 0.1,
                y: i * 0.1,
                z: i * 0.01,
                visibility: 1
            }));

            const normalized = normalizer.normalize(mockLandmarks);

            // Verify output structure
            expect(normalized).toHaveLength(21);
            expect(normalized[0]).toHaveProperty('x');
            expect(normalized[0]).toHaveProperty('y');
            expect(normalized[0]).toHaveProperty('z');

            // Wrist should be at origin after normalization
            expect(normalized[0].x).toBeCloseTo(0, 5);
            expect(normalized[0].y).toBeCloseTo(0, 5);
            expect(normalized[0].z).toBeCloseTo(0, 5);
        });

        it('should be rotation invariant', () => {
            const normalizer = new OrthonormalNormalizer();

            const baseLandmarks = Array(21).fill(null).map((_, i) => ({
                x: i * 0.1,
                y: i * 0.1,
                z: i * 0.01,
                visibility: 1
            }));

            // Rotate landmarks (simplified rotation)
            const rotatedLandmarks = baseLandmarks.map(lm => ({
                x: lm.y,
                y: -lm.x,
                z: lm.z,
                visibility: lm.visibility
            }));

            const normalized1 = normalizer.normalize(baseLandmarks);
            const normalized2 = normalizer.normalize(rotatedLandmarks);

            // Fingertip distances should be similar after normalization
            const dist1 = Math.sqrt(
                Math.pow(normalized1[8].x - normalized1[0].x, 2) +
                Math.pow(normalized1[8].y - normalized1[0].y, 2) +
                Math.pow(normalized1[8].z - normalized1[0].z, 2)
            );

            const dist2 = Math.sqrt(
                Math.pow(normalized2[8].x - normalized2[0].x, 2) +
                Math.pow(normalized2[8].y - normalized2[0].y, 2) +
                Math.pow(normalized2[8].z - normalized2[0].z, 2)
            );

            expect(dist1).toBeCloseTo(dist2, 1);
        });
    });

    describe('Scoring', () => {
        it('should return score between 0 and 100', () => {
            const mockLandmarks = Array(21).fill(null).map((_, i) => ({
                x: i * 0.1,
                y: i * 0.1,
                z: i * 0.01,
                visibility: 1
            }));

            // Load template
            engine.loadTemplate([mockLandmarks]);

            // Process identical frame (should score ~100)
            const result = engine.processFrame(mockLandmarks, Date.now());

            expect(result.instantScore).toBeGreaterThanOrEqual(0);
            expect(result.instantScore).toBeLessThanOrEqual(100);
        });

        it('should score perfect match near 100', () => {
            const mockLandmarks = Array(21).fill(null).map((_, i) => ({
                x: i * 0.1,
                y: i * 0.1,
                z: i * 0.01,
                visibility: 1
            }));

            engine.loadTemplate([mockLandmarks]);
            const result = engine.processFrame(mockLandmarks, Date.now());

            expect(result.instantScore).toBeGreaterThanOrEqual(90);
        });
    });

    describe('Template Loading', () => {
        it('should accept valid template frames', () => {
            const mockFrames = Array(10).fill(null).map(() =>
                Array(21).fill(null).map((_, i) => ({
                    x: i * 0.1,
                    y: i * 0.1,
                    z: i * 0.01,
                    visibility: 1
                }))
            );

            expect(() => engine.loadTemplate(mockFrames)).not.toThrow();
        });

        it('should reject invalid template (wrong landmark count)', () => {
            const invalidFrames = [[
                { x: 0, y: 0, z: 0, visibility: 1 } // Only 1 landmark instead of 21
            ]];

            expect(() => engine.loadTemplate(invalidFrames)).toThrow();
        });
    });

    describe('dt=0 edge case', () => {
        it('should not produce NaN or Infinity when all timestamps are identical', () => {
            const mockFrames = Array(5).fill(null).map(() =>
                Array(21).fill(null).map((_, i) => ({
                    x: i * 0.1,
                    y: i * 0.1,
                    z: i * 0.01,
                    visibility: 1
                }))
            );

            engine.loadTemplate(mockFrames);

            const fixedTimestamp = 1000;
            const result = engine.processFrame(mockFrames[0], fixedTimestamp);

            expect(result.kinematics.velocity).toBeDefined();
            expect(result.kinematics.acceleration).toBeDefined();

            // Check no NaN or Infinity in velocity
            for (const lm of result.kinematics.velocity) {
                expect(isFinite(lm.x)).toBe(true);
                expect(isFinite(lm.y)).toBe(true);
                expect(isFinite(lm.z)).toBe(true);
            }

            // Check no NaN or Infinity in acceleration
            for (const lm of result.kinematics.acceleration) {
                expect(isFinite(lm.x)).toBe(true);
                expect(isFinite(lm.y)).toBe(true);
                expect(isFinite(lm.z)).toBe(true);
            }
        });
    });

    describe('DTW band constraint', () => {
        it('should respect Sakoe-Chiba band in alignment path', () => {
            const dtw = new ConstrainedDTW(0.2);
            const bandwidth = 0.2;

            const makeFrame = (offset: number): Landmark[] =>
                Array(21).fill(null).map((_, i) => ({
                    x: i * 0.1 + offset,
                    y: i * 0.1,
                    z: 0,
                    visibility: 1
                }));

            const sequence = Array(20).fill(null).map((_, i) => makeFrame(i * 0.05));
            const template = Array(25).fill(null).map((_, i) => makeFrame(i * 0.04));

            const result = dtw.compute(sequence, template);
            const band = Math.max(1, Math.floor(bandwidth * Math.max(sequence.length, template.length)));

            for (const [i, j] of result.alignmentPath) {
                expect(Math.abs(i - j)).toBeLessThanOrEqual(band);
            }
        });
    });
});
