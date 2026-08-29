/**
 * @fileoverview Tests for Audio-Kinematic Binding Engine
 */

import { AudioKinematicEngine, AudioSegment, KinematicSnapshot } from '../core/audio-kinematic'
import { SpeechAligner } from '../core/speech-aligner'
import { AutoOKEMGenerator } from '../core/okem-generator'
import { Landmark } from '../kinetic-engine'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createLandmark(x: number, y: number, z: number, visibility = 1.0): Landmark {
    return { x, y, z, visibility }
}

function createFrame(baseX: number, baseY: number, baseZ: number): Landmark[] {
    return Array.from({ length: 21 }, (_, i) =>
        createLandmark(baseX + i * 0.01, baseY + i * 0.01, baseZ + i * 0.01)
    )
}

function createAudioSegment(
    text: string,
    startMs: number,
    endMs: number,
    confidence = 0.9
): AudioSegment {
    return {
        id: `audio_${startMs}`,
        text,
        startTimeMs: startMs,
        endTimeMs: endMs,
        durationMs: endMs - startMs,
        confidence,
        language: 'pt',
    }
}

function createKinematicSnapshot(
    startMs: number,
    endMs: number,
    velocity = 0.5,
    confidence = 0.9
): KinematicSnapshot {
    const frameCount = Math.max(1, Math.floor((endMs - startMs) / 33))
    return {
        startTimeMs: startMs,
        endTimeMs: endMs,
        frames: Array.from({ length: frameCount }, (_, i) =>
            createFrame(i * 0.01, i * 0.01, i * 0.01)
        ),
        meanVelocity: velocity,
        isPrecisionPoint: velocity < 0.15,
        meanConfidence: confidence,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AudioKinematicEngine Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('AudioKinematicEngine', () => {
    const engine = new AudioKinematicEngine()

    describe('bind()', () => {
        it('should bind audio segments with kinematic snapshots', () => {
            const audio = [
                createAudioSegment('Fecha a válvula B', 0, 3000),
                createAudioSegment('Verifica o vedante', 3500, 6000),
            ]

            const kinematic = [
                createKinematicSnapshot(0, 3000, 0.5),
                createKinematicSnapshot(3500, 6000, 0.1),
            ]

            const metadata = {
                device: 'iPhone 15 Pro',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'good' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind(audio, kinematic, metadata)

            expect(binding.segments).toHaveLength(2)
            expect(binding.segments[0].audio.text).toBe('Fecha a válvula B')
            expect(binding.segments[0].kinematic.meanVelocity).toBe(0.5)
            expect(binding.segments[1].audio.text).toBe('Verifica o vedante')
            expect(binding.segments[1].kinematic.isPrecisionPoint).toBe(true)
        })

        it('should extract semantic information from text', () => {
            const audio = [
                createAudioSegment('Cuidado: não force demais', 0, 2000),
                createAudioSegment('Roda 15 graus no sentido horário', 2500, 5000),
            ]

            const kinematic = [
                createKinematicSnapshot(0, 2000, 0.3),
                createKinematicSnapshot(2500, 5000, 0.2),
            ]

            const metadata = {
                device: 'iPhone',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'moderate' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind(audio, kinematic, metadata)

            expect(binding.segments[0].semanticType).toBe('warning')
            expect(binding.segments[1].actionVerb).toBe('roda')
            expect(binding.segments[1].parameter).toContain('15')
        })

        it('should handle empty inputs', () => {
            const metadata = {
                device: 'iPhone',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'moderate' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind([], [], metadata)
            expect(binding.segments).toHaveLength(0)
        })
    })

    describe('generateProcedureSteps()', () => {
        it('should generate guidance steps from binding', () => {
            const audio = [
                createAudioSegment('Passo 1: fecha a torneira', 0, 2000),
                createAudioSegment('Passo 2: abre o registador', 2500, 4500),
            ]

            const kinematic = [
                createKinematicSnapshot(0, 2000, 0.5),
                createKinematicSnapshot(2500, 4500, 0.3),
            ]

            const metadata = {
                device: 'iPhone',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'good' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind(audio, kinematic, metadata)
            const steps = engine.generateProcedureSteps(binding)

            expect(steps).toHaveLength(2)
            expect(steps[0].stepNumber).toBe(1)
            expect(steps[0].instruction).toContain('fecha')
            expect(steps[1].stepNumber).toBe(2)
        })
    })

    describe('generateAudioGuidance()', () => {
        it('should generate timed audio instructions', () => {
            const audio = [
                createAudioSegment('Abre o capô', 0, 1500),
                createAudioSegment('Localiza a lâmpada', 2000, 3500),
            ]

            const kinematic = [
                createKinematicSnapshot(0, 1500, 0.6),
                createKinematicSnapshot(2000, 3500, 0.4),
            ]

            const metadata = {
                device: 'iPhone',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'good' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind(audio, kinematic, metadata)
            const guidance = engine.generateAudioGuidance(binding)

            expect(guidance).toHaveLength(2)
            expect(guidance[0].playAtMs).toBe(0)
            expect(guidance[1].playAtMs).toBeGreaterThan(0)
        })
    })

    describe('validateLearnerAttempt()', () => {
        it('should validate learner against binding', () => {
            const audio = [
                createAudioSegment('Fecha a mão', 0, 1000),
            ]

            const kinematic = [
                createKinematicSnapshot(0, 1000, 0.5),
            ]

            const metadata = {
                device: 'iPhone',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'good' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            }

            const binding = engine.bind(audio, kinematic, metadata)

            const learnerFrames = [createFrame(0, 0, 0), createFrame(0.01, 0.01, 0.01)]
            const learnerTimestamps = [0, 500]

            const result = engine.validateLearnerAttempt(binding, learnerFrames, learnerTimestamps)

            expect(result.overallScore).toBeGreaterThan(0)
            expect(result.stepScores).toHaveLength(1)
        })
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SpeechAligner Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('SpeechAligner', () => {
    const aligner = new SpeechAligner()

    describe('detectVoiceActivity()', () => {
        it('should detect speech segments from energy levels', () => {
            // Create energy array: silence, speech, silence, speech
            const energy = Array(100).fill(0.1) // silence
            energy.fill(0.8, 10, 30) // speech
            energy.fill(0.1, 30, 40) // silence
            energy.fill(0.7, 40, 60) // speech

            const result = aligner.detectVoiceActivity(energy, 33)

            expect(result.segments.length).toBeGreaterThanOrEqual(2)
            expect(result.speechRatio).toBeGreaterThan(0)
        })

        it('should handle all-silence input', () => {
            const energy = Array(100).fill(0.1)
            const result = aligner.detectVoiceActivity(energy, 33)

            expect(result.segments).toHaveLength(0)
            expect(result.speechRatio).toBe(0)
        })
    })

    describe('detectKinematicPhases()', () => {
        it('should detect phases from velocity profile', () => {
            const frames = Array.from({ length: 50 }, (_, i) => createFrame(i * 0.01, 0, 0))
            const timestamps = Array.from({ length: 50 }, (_, i) => i * 33)

            const phases = aligner.detectKinematicPhases(frames, timestamps)

            expect(phases.length).toBeGreaterThanOrEqual(1)
            expect(phases[0].index).toBe(0)
        })
    })

    describe('align()', () => {
        it('should align audio segments with kinematic phases', () => {
            const audio = [
                createAudioSegment('Passo 1', 0, 2000),
                createAudioSegment('Passo 2', 2500, 4500),
            ]

            const phases = [
                { index: 0, startFrame: 0, endFrame: 60, startTimeMs: 0, endTimeMs: 2000, meanVelocity: 0.5, type: 'movement' as const },
                { index: 1, startFrame: 75, endFrame: 135, startTimeMs: 2500, endTimeMs: 4500, meanVelocity: 0.3, type: 'precision' as const },
            ]

            const result = aligner.align(audio, phases)

            expect(result.pairs.length).toBeGreaterThanOrEqual(1)
            expect(result.overallQuality).toBeGreaterThan(0)
        })
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// AutoOKEMGenerator Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('AutoOKEMGenerator', () => {
    const generator = new AutoOKEMGenerator()

    describe('generate()', () => {
        it('should generate OKEM from a single recording', () => {
            // Create synthetic recording data
            const frames = Array.from({ length: 100 }, (_, i) =>
                createFrame(Math.sin(i * 0.1) * 0.1, i * 0.005, 0)
            )
            const timestamps = Array.from({ length: 100 }, (_, i) => i * 33)
            const audioSamples = Array(100).fill(0.1)
            audioSamples.fill(0.8, 10, 30)
            audioSamples.fill(0.7, 40, 60)

            const textSegments = [
                createAudioSegment('Fecha a válvula', 330, 990),
                createAudioSegment('Verifica o vedante', 1320, 1980),
            ]

            const input = {
                procedureName: 'Troca de lâmpada',
                specialistId: 'pai_001',
                audioSamples,
                textSegments,
                kinematicFrames: frames,
                timestamps,
                metadata: {
                    device: 'iPhone 15 Pro',
                    fps: 30,
                    language: 'pt',
                },
            }

            const okem = generator.generate(input)

            expect(okem.procedureName).toBe('Troca de lâmpada')
            expect(okem.specialistId).toBe('pai_001')
            expect(okem.stepCount).toBeGreaterThanOrEqual(1)
            expect(okem.confidence).toBeGreaterThan(0)
            expect(okem.id).toContain('auto_okem_')
        })

        it('should generate guidance from OKEM', () => {
            const frames = Array.from({ length: 50 }, (_, i) => createFrame(i * 0.01, 0, 0))
            const timestamps = Array.from({ length: 50 }, (_, i) => i * 33)
            const audioSamples = Array(50).fill(0.8)
            const textSegments = [
                createAudioSegment('Abre o capô', 0, 1000),
                createAudioSegment('Troca a lâmpada', 1500, 3000),
            ]

            const input = {
                procedureName: 'Troca de lâmpada',
                specialistId: 'pai_001',
                audioSamples,
                textSegments,
                kinematicFrames: frames,
                timestamps,
            }

            const okem = generator.generate(input)
            const guidance = generator.generateGuidance(okem)

            expect(guidance.length).toBeGreaterThanOrEqual(1)
            expect(guidance[0].stepNumber).toBe(1)
            expect(guidance[0].instruction).toBeDefined()
        })

        it('should throw on insufficient data', () => {
            const input = {
                procedureName: 'Test',
                specialistId: 'test',
                audioSamples: [],
                textSegments: [],
                kinematicFrames: [],
                timestamps: [],
            }

            expect(() => generator.generate(input)).toThrow()
        })
    })
})
