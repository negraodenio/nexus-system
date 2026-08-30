/**
 * Tests for SpatialOKEM — Stera integration types, adapter, and backward compatibility.
 */

import {
    SpatialOKEM,
    SpatialLandmark,
    SpatialReferenceFrame,
    SpatialStep,
    SpatialCaptureMetadata,
    steraKeypointToSpatialLandmark,
    opticalToWorld,
    hasSpatialData,
    toStandardOKEM,
    mergeSpatialData,
} from '@/lib/core/spatial-okem'
import {
    steraOutputToSpatialOKEM,
    serializeSpatialOKEMForSupabase,
    deserializeSpatialOKEMFromSupabase,
    okemHasSpatialData,
    SteraProcessingOutput,
} from '@/lib/core/stera-adapter'
import { RegistryOKEM, RegistryStep } from '@/lib/core/okem-registry'
import { SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM } from '@/lib/__fixtures__/stera-output'

// ── SpatialOKEM Types ──────────────────────────────────────────────────────

describe('SpatialOKEM Types', () => {
    it('SpatialLandmark should extend Landmark with optional fields', () => {
        const landmark: SpatialLandmark = {
            x: 0.5,
            y: 0.5,
            z: 0.3,
            visibility: 0.9,
            depth: 300,
            worldX: 0.1,
            worldY: -0.2,
            worldZ: 0.5,
            confidence: 0.85,
            timestamp: 1000,
        }

        expect(landmark.x).toBe(0.5)
        expect(landmark.depth).toBe(300)
        expect(landmark.worldX).toBe(0.1)
        expect(landmark.confidence).toBe(0.85)
    })

    it('SpatialLandmark should work without spatial fields', () => {
        const landmark: SpatialLandmark = {
            x: 0.5,
            y: 0.5,
            z: 0.3,
        }

        expect(landmark.x).toBe(0.5)
        expect(landmark.depth).toBeUndefined()
        expect(landmark.worldX).toBeUndefined()
    })

    it('SpatialReferenceFrame should contain landmarks and optional metadata', () => {
        const frame: SpatialReferenceFrame = {
            landmarks: [
                { x: 0.5, y: 0.5, z: 0.3, depth: 300, worldX: 0.1, worldY: -0.2, worldZ: 0.5 },
            ],
            timestamp: 1000,
            cameraPose: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.5, 1],
            cameraPosition: { x: 0, y: 0, z: -0.5 },
            depthValid: [true],
        }

        expect(frame.landmarks).toHaveLength(1)
        expect(frame.timestamp).toBe(1000)
        expect(frame.cameraPose).toHaveLength(16)
    })

    it('SpatialStep should extend RegistryStep with spatialReferenceFrames', () => {
        const step: SpatialStep = {
            index: 0,
            name: 'Step 1',
            description: 'Test step',
            referenceFrames: [[{ x: 0.5, y: 0.5, z: 0.3 }]],
            durationMs: 1000,
            isCritical: false,
            criticalLandmarks: [4, 8],
            spatialVariance: 0.01,
            semanticType: 'action',
            actionVerb: 'approach',
            targetObject: 'cable',
            spatialReferenceFrames: [
                {
                    landmarks: [{ x: 0.5, y: 0.5, z: 0.3, depth: 300 }],
                    timestamp: 1000,
                },
            ],
        }

        expect(step.spatialReferenceFrames).toHaveLength(1)
        expect(step.spatialReferenceFrames![0].landmarks[0].depth).toBe(300)
    })
})

// ── Coordinate Transformation ──────────────────────────────────────────────

describe('Coordinate Transformation', () => {
    it('steraKeypointToSpatialLandmark should convert with intrinsics', () => {
        const joint = { x: 0.1, y: 0.1, z: 0.5, confidence: 0.9, name: 'wrist' }
        const intrinsics = { fx: 1000, fy: 1000, cx: 960, cy: 540, width: 1920, height: 1080 }

        const landmark = steraKeypointToSpatialLandmark(joint, intrinsics)

        // pixelX = (0.1 * 1000) / 0.5 + 960 = 200 + 960 = 1160
        // normalizedX = 1160 / 1920 ≈ 0.604
        expect(landmark.x).toBeCloseTo(0.604, 2)
        expect(landmark.depth).toBe(500) // 0.5m → 500mm
        expect(landmark.confidence).toBe(0.9)
    })

    it('steraKeypointToSpatialLandmark should fallback without intrinsics', () => {
        const joint = { x: 0.1, y: 0.1, z: 0.5, confidence: 0.9 }

        const landmark = steraKeypointToSpatialLandmark(joint)

        // Fallback: normalizedX = 0.5 + 0.1 * 0.5 = 0.55
        expect(landmark.x).toBeCloseTo(0.55, 2)
        expect(landmark.depth).toBe(500)
    })

    it('opticalToWorld should transform joints using camera pose', () => {
        const joints = [{ x: 0.1, y: 0.1, z: 0.5 }]
        // Identity rotation + translation (0, 0, -0.5) - column-major
        const cameraPose = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -0.5, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        expect(world).toHaveLength(1)
        expect(world[0].worldX).toBeCloseTo(0.1, 5)
        expect(world[0].worldY).toBeCloseTo(0.1, 5)
        expect(world[0].worldZ).toBeCloseTo(-0.5 + 0.5, 5) // -0.5 + 0.5 = 0
    })

    it('opticalToWorld should apply R_optical_to_link when provided', () => {
        const joints = [{ x: 0.1, y: 0.0, z: 0.5 }]
        // Rotation: optical (X right, Y down, Z forward) → link (X forward, Y left, Z up)
        // link.X = -optical.Y, link.Y = -optical.Z, link.Z = optical.X
        // Column-major 3x3 R such that link = R @ optical:
        // [ 0  -1  0 ]   [ 0  0  1 ]
        // [ 0   0 -1 ]   [ 0  0 -1 ]
        // [ 1   0  0 ]   [ 0 -1  0 ]
        // Column-major flattened: [0, 0, 1, -1, 0, 0, 0, -1, 0]
        const R_optical_to_link = [
            0,  0,  1,   // Col 0: X basis
            -1,  0,  0,  // Col 1: Y basis
            0, -1,  0,   // Col 2: Z basis
        ]
        const cameraPose = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]

        const world = opticalToWorld(joints, cameraPose, R_optical_to_link)

        // link.X = -optical.Y = 0
        // link.Y = -optical.Z = -0.5
        // link.Z = optical.X = 0.1
        expect(world[0].worldX).toBeCloseTo(0, 5)
        expect(world[0].worldY).toBeCloseTo(-0.5, 5)
        expect(world[0].worldZ).toBeCloseTo(0.1, 5)
    })

    it('opticalToWorld should apply camera pose rotation (90° around X)', () => {
        const joints = [{ x: 0.0, y: 1.0, z: 0.0 }] // Point on Y axis in link frame
        // 90° rotation around X (column-major): Y->Z
        // Column-major: [1,0,0,0, 0,0,1,0, 0,-1,0,0, 0,0,0,1]
        const cameraPose = [
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, -1, 0, 0,
            0, 0, 0, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // Y=1 in link frame → Z=1 in world (after 90° X rotation)
        expect(world[0].worldX).toBeCloseTo(0, 5)
        expect(world[0].worldY).toBeCloseTo(0, 5)
        expect(world[0].worldZ).toBeCloseTo(1.0, 5)
    })

    it('opticalToWorld should apply camera pose rotation (90° around Y)', () => {
        const joints = [{ x: 0.0, y: 0.0, z: 1.0 }] // Point on Z axis in link frame
        // 90° rotation around Y (column-major): Z->X
        const cameraPose = [
            0, 0, -1, 0,
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // Z=1 in link frame → X=1 in world (after 90° Y rotation)
        expect(world[0].worldX).toBeCloseTo(1.0, 5)
        expect(world[0].worldY).toBeCloseTo(0, 5)
        expect(world[0].worldZ).toBeCloseTo(0, 5)
    })

    it('opticalToWorld should apply camera pose rotation (90° around Z)', () => {
        const joints = [{ x: 1.0, y: 0.0, z: 0.0 }] // Point on X axis in link frame
        // 90° rotation around Z (column-major): X->Y
        const cameraPose = [
            0, 1, 0, 0,
            -1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // X=1 in link frame → Y=1 in world (after 90° Z rotation)
        expect(world[0].worldX).toBeCloseTo(0, 5)
        expect(world[0].worldY).toBeCloseTo(1.0, 5)
        expect(world[0].worldZ).toBeCloseTo(0, 5)
    })

    it('opticalToWorld should apply combined rotation and translation', () => {
        const joints = [{ x: 1.0, y: 0.0, z: 0.0 }]
        // 90° Z rotation (column-major) + translation (1, 2, 3)
        // Column-major: [0,1,0,0, -1,0,0,0, 0,0,1,0, 1,2,3,1]
        const cameraPose = [
            0, 1, 0, 0,
            -1, 0, 0, 0,
            0, 0, 1, 0,
            1, 2, 3, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // X=1 rotated 90° Z → Y=1, then + translation (1,2,3)
        expect(world[0].worldX).toBeCloseTo(1, 5)  // 0 + 1
        expect(world[0].worldY).toBeCloseTo(3, 5)  // 1 + 2
        expect(world[0].worldZ).toBeCloseTo(3, 5)  // 0 + 3
    })

    it('opticalToWorld should handle zero translation', () => {
        const joints = [{ x: 0.5, y: 0.3, z: 0.2 }]
        // Pure rotation, no translation (90° Z column-major)
        const cameraPose = [
            0, 1, 0, 0,
            -1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // Rotation only: (0.5, 0.3, 0.2) rotated 90° Z → (-0.3, 0.5, 0.2)
        expect(world[0].worldX).toBeCloseTo(-0.3, 5)
        expect(world[0].worldY).toBeCloseTo(0.5, 5)
        expect(world[0].worldZ).toBeCloseTo(0.2, 5)
    })

    it('opticalToWorld should handle zero vector', () => {
        const joints = [{ x: 0.0, y: 0.0, z: 0.0 }]
        // Identity rotation + translation (5, 6, 7) - column-major
        const cameraPose = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            5, 6, 7, 1,
        ]

        const world = opticalToWorld(joints, cameraPose)

        // Zero vector rotates to zero, then translation applied
        expect(world[0].worldX).toBeCloseTo(5, 5)
        expect(world[0].worldY).toBeCloseTo(6, 5)
        expect(world[0].worldZ).toBeCloseTo(7, 5)
    })

    it('P0-2 regression: cameraPose must be column-major (translation at [12,13,14], not row-major [3,7,11])', () => {
        // 90° Z rotation + translation (10, 20, 30). Serialized COLUMN-MAJOR.
        // If this were row-major (C-order) the translation would land at indices
        // [3, 7, 11] and the result below would be wrong — this test guards that.
        const cameraPose = [
            0, 1, 0, 0,   // col 0
            -1, 0, 0, 0,  // col 1
            0, 0, 1, 0,   // col 2
            10, 20, 30, 1, // translation column
        ]
        const joints = [{ x: 1.0, y: 0.0, z: 0.0 }]

        const world = opticalToWorld(joints, cameraPose)

        // Link (1,0,0) rotated 90° Z -> (0,1,0); + translation (10,20,30) -> (10,21,30)
        expect(world[0].worldX).toBeCloseTo(10, 5)
        expect(world[0].worldY).toBeCloseTo(21, 5)
        expect(world[0].worldZ).toBeCloseTo(30, 5)

        // Explicit guard: translation must be read from [12,13,14]
        expect(cameraPose[12]).toBe(10)
        expect(cameraPose[13]).toBe(20)
        expect(cameraPose[14]).toBe(30)
        // And the rotation columns must NOT contain the translation values
        expect(cameraPose[3]).toBe(0)
        expect(cameraPose[7]).toBe(0)
        expect(cameraPose[11]).toBe(0)
    })
})

// ── SpatialOKEM Utilities ──────────────────────────────────────────────────

describe('SpatialOKEM Utilities', () => {
    it('hasSpatialData should return true for OKEM with spatial frames', () => {
        const spatialOkem: SpatialOKEM = {
            ...SYNTHETIC_BASE_OKEM,
            spatialMetadata: {
                source: 'stera',
                hasDepth: true,
                hasLiDAR: true,
                hasIMU: true,
                hasCameraPose: true,
            },
            spatialSteps: [
                {
                    ...SYNTHETIC_BASE_OKEM.steps[0],
                    spatialReferenceFrames: [
                        { landmarks: [{ x: 0.5, y: 0.5, z: 0.3, depth: 300 }], timestamp: 0 },
                    ],
                },
            ],
        }

        expect(hasSpatialData(spatialOkem)).toBe(true)
    })

    it('hasSpatialData should return false for standard OKEM', () => {
        expect(hasSpatialData(SYNTHETIC_BASE_OKEM as any)).toBe(false)
    })

    it('hasSpatialData should return false for OKEM with empty spatial frames', () => {
        const spatialOkem: SpatialOKEM = {
            ...SYNTHETIC_BASE_OKEM,
            spatialMetadata: { source: 'stera', hasDepth: true, hasLiDAR: false, hasIMU: false, hasCameraPose: true },
            spatialSteps: [{ ...SYNTHETIC_BASE_OKEM.steps[0], spatialReferenceFrames: [] }],
        }

        expect(hasSpatialData(spatialOkem)).toBe(false)
    })

    it('toStandardOKEM should strip spatial data', () => {
        const spatialOkem: SpatialOKEM = {
            ...SYNTHETIC_BASE_OKEM,
            spatialMetadata: { source: 'stera', hasDepth: true, hasLiDAR: false, hasIMU: false, hasCameraPose: true },
            spatialSteps: [{ ...SYNTHETIC_BASE_OKEM.steps[0], spatialReferenceFrames: [] }],
        }

        const standard = toStandardOKEM(spatialOkem)

        expect(standard.id).toBe(spatialOkem.id)
        expect((standard as any).spatialMetadata).toBeUndefined()
        expect((standard as any).spatialSteps).toBeUndefined()
    })

    it('mergeSpatialData should create SpatialOKEM from standard OKEM', () => {
        const spatialSteps: SpatialStep[] = [
            {
                ...SYNTHETIC_BASE_OKEM.steps[0],
                spatialReferenceFrames: [
                    { landmarks: [{ x: 0.5, y: 0.5, z: 0.3, depth: 300 }], timestamp: 0 },
                ],
            },
        ]
        const metadata: SpatialCaptureMetadata = {
            source: 'stera',
            hasDepth: true,
            hasLiDAR: false,
            hasIMU: false,
            hasCameraPose: true,
        }

        const merged = mergeSpatialData(SYNTHETIC_BASE_OKEM, spatialSteps, metadata)

        expect(merged.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect(merged.spatialMetadata).toBe(metadata)
        expect(merged.spatialSteps).toHaveLength(1)
        expect(hasSpatialData(merged)).toBe(true)
    })
})

// ── Stera Adapter ──────────────────────────────────────────────────────────

describe('Stera Adapter', () => {
    it('steraOutputToSpatialOKEM should convert Stera output to SpatialOKEM', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        // Check standard fields preserved
        expect(spatialOkem.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect(spatialOkem.procedureName).toBe(SYNTHETIC_BASE_OKEM.procedureName)
        expect(spatialOkem.steps).toHaveLength(2)

        // Check spatial metadata
        expect(spatialOkem.spatialMetadata).toBeDefined()
        expect(spatialOkem.spatialMetadata!.source).toBe('stera')
        expect(spatialOkem.spatialMetadata!.hasDepth).toBe(true)
        expect(spatialOkem.spatialMetadata!.deviceModel).toBe('iPhone 15 Pro')

        // Check spatial steps
        expect(spatialOkem.spatialSteps).toHaveLength(2)
        expect(spatialOkem.spatialSteps![0].spatialReferenceFrames).toBeDefined()
    })

    it('steraOutputToSpatialOKEM should map frames to correct steps by time', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        // Step 0: 0-500ms, Step 1: 500-1000ms
        // Synthetic frames: 0-29 frames at 30fps = 0-966ms
        // Step 0 gets frames 0-14, Step 1 gets frames 15-29
        const step0Frames = spatialOkem.spatialSteps![0].spatialReferenceFrames!
        const step1Frames = spatialOkem.spatialSteps![1].spatialReferenceFrames!

        expect(step0Frames.length).toBeGreaterThan(0)
        expect(step1Frames.length).toBeGreaterThan(0)
    })

    it('steraOutputToSpatialOKEM should include world coordinates when camera pose available', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        const firstFrame = spatialOkem.spatialSteps![0].spatialReferenceFrames![0]
        expect(firstFrame.cameraPose).toBeDefined()
        expect(firstFrame.cameraPosition).toBeDefined()

        // Check that world coordinates were computed
        const firstLandmark = firstFrame.landmarks[0]
        expect(firstLandmark.worldX).toBeDefined()
        expect(firstLandmark.worldY).toBeDefined()
        expect(firstLandmark.worldZ).toBeDefined()
    })

    it('steraOutputToSpatialOKEM should preserve standard referenceFrames', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        // Standard referenceFrames should be untouched
        expect(spatialOkem.steps[0].referenceFrames).toEqual(SYNTHETIC_BASE_OKEM.steps[0].referenceFrames)
        expect(spatialOkem.steps[1].referenceFrames).toEqual(SYNTHETIC_BASE_OKEM.steps[1].referenceFrames)
    })
})

// ── Supabase Serialization ─────────────────────────────────────────────────

describe('Supabase Serialization', () => {
    it('serializeSpatialOKEMForSupabase should separate spatial and standard data', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        const { okemRow, spatialMetadata, spatialSteps } = serializeSpatialOKEMForSupabase(spatialOkem)

        // Standard OKEM row
        expect(okemRow.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect(okemRow.steps).toHaveLength(2)

        // Spatial data separated
        expect(spatialMetadata).toBeDefined()
        expect(spatialMetadata!.source).toBe('stera')
        expect(spatialSteps).toHaveLength(2)
    })

    it('serializeSpatialOKEMForSupabase should handle non-spatial OKEM', () => {
        const { okemRow, spatialMetadata, spatialSteps } = serializeSpatialOKEMForSupabase(SYNTHETIC_BASE_OKEM as any)

        expect(okemRow.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect(spatialMetadata).toBeNull()
        expect(spatialSteps).toBeNull()
    })

    it('deserializeSpatialOKEMFromSupabase should restore SpatialOKEM', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)
        const { okemRow, spatialMetadata, spatialSteps } = serializeSpatialOKEMForSupabase(spatialOkem)

        const restored = deserializeSpatialOKEMFromSupabase(okemRow, spatialMetadata, spatialSteps) as SpatialOKEM

        expect(restored.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect(restored.spatialMetadata).toBeDefined()
        expect(restored.spatialMetadata!.source).toBe('stera')
        expect(restored.spatialSteps).toHaveLength(2)
    })

    it('deserializeSpatialOKEMFromSupabase should return RegistryOKEM when no spatial data', () => {
        const restored = deserializeSpatialOKEMFromSupabase(SYNTHETIC_BASE_OKEM, null, null)

        expect(restored.id).toBe(SYNTHETIC_BASE_OKEM.id)
        expect((restored as any).spatialMetadata).toBeUndefined()
    })
})

// ── Backward Compatibility ─────────────────────────────────────────────────

describe('Backward Compatibility', () => {
    it('standard OKEM should not have spatial fields', () => {
        const okem = SYNTHETIC_BASE_OKEM

        expect(okemHasSpatialData(okem)).toBe(false)
        expect((okem as any).spatialMetadata).toBeUndefined()
        expect((okem as any).spatialSteps).toBeUndefined()
    })

    it('SpatialOKEM should be assignable to RegistryOKEM', () => {
        const spatialOkem: SpatialOKEM = {
            ...SYNTHETIC_BASE_OKEM,
            spatialMetadata: { source: 'stera', hasDepth: true, hasLiDAR: false, hasIMU: false, hasCameraPose: true },
            spatialSteps: [],
        }

        // SpatialOKEM should be usable wherever RegistryOKEM is expected
        const standard: RegistryOKEM = spatialOkem
        expect(standard.id).toBe(SYNTHETIC_BASE_OKEM.id)
    })

    it('GhostHandPractice can read SpatialOKEM as standard OKEM', () => {
        const spatialOkem = steraOutputToSpatialOKEM(SYNTHETIC_STERA_OUTPUT, SYNTHETIC_BASE_OKEM)

        // Simulate what GhostHandPractice does: read steps
        const steps = spatialOkem.steps.map(s => ({
            index: s.index,
            name: s.name,
            description: s.description,
            referenceFrames: s.referenceFrames,
            durationMs: s.durationMs,
            isCritical: s.isCritical,
            criticalLandmarks: s.criticalLandmarks,
            spatialVariance: s.spatialVariance,
            actionVerb: s.actionVerb,
            targetObject: s.targetObject,
            semanticType: s.semanticType,
        }))

        expect(steps).toHaveLength(2)
        expect(steps[0].name).toBe('Approach cable')
        expect(steps[1].isCritical).toBe(true)
    })

    it('existing Landmark fields should not be affected', () => {
        const landmark: SpatialLandmark = {
            x: 0.5,
            y: 0.5,
            z: 0.3,
            visibility: 0.9,
            depth: 300,
            worldX: 0.1,
        }

        // Standard Landmark access should work
        const { x, y, z, visibility } = landmark
        expect(x).toBe(0.5)
        expect(y).toBe(0.5)
        expect(z).toBe(0.3)
        expect(visibility).toBe(0.9)
    })

    it('okemHasSpatialData should detect spatial data in metadata JSONB', () => {
        // Simulate Supabase row with spatial data in metadata column
        const rowWithSpatial = {
            id: 'test',
            steps: [],
            metadata: {
                spatialMetadata: { source: 'stera', hasDepth: true },
            },
        }

        expect(okemHasSpatialData(rowWithSpatial)).toBe(true)
    })

    it('okemHasSpatialData should return false for standard row', () => {
        const standardRow = {
            id: 'test',
            steps: [],
            metadata: {},
        }

        expect(okemHasSpatialData(standardRow)).toBe(false)
    })
})

// ── Synthetic Fixture Validation ───────────────────────────────────────────

describe('Synthetic Fixture', () => {
    it('SYNTHETIC_STERA_OUTPUT should have valid structure', () => {
        expect(SYNTHETIC_STERA_OUTPUT.metadata.source).toBe('stera')
        expect(SYNTHETIC_STERA_OUTPUT.frames).toHaveLength(30)
        expect(SYNTHETIC_STERA_OUTPUT.metadata.hasDepth).toBe(true)
        expect(SYNTHETIC_STERA_OUTPUT.metadata.hasCameraPose).toBe(true)
    })

    it('each frame should have 21 joints', () => {
        for (const frame of SYNTHETIC_STERA_OUTPUT.frames) {
            expect(frame.hands).toHaveLength(1)
            expect(frame.hands[0].joints).toHaveLength(21)
        }
    })

    it('SYNTHETIC_BASE_OKEM should have valid structure', () => {
        expect(SYNTHETIC_BASE_OKEM.id).toBe('test-okem-001')
        expect(SYNTHETIC_BASE_OKEM.steps).toHaveLength(2)
        expect(SYNTHETIC_BASE_OKEM.steps[0].referenceFrames).toHaveLength(3)
        expect(SYNTHETIC_BASE_OKEM.steps[1].isCritical).toBe(true)
    })
})
