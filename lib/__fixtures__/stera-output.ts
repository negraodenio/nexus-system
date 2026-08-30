/**
 * @fileoverview Synthetic Stera Processing Output — Test Fixture
 * @description Synthetic data mimicking what process-stera.py would output
 *              from a real MCAP recording of "Insert USB cable into port".
 *
 *              SYNTHETIC TEST DATA — not from a real Stera capture.
 *              Used for unit testing the SpatialOKEM adapter.
 *
 * @version 1.0.0
 */

import type { SteraProcessingOutput } from '../core/stera-adapter'

/**
 * Synthetic Stera output for "Insert USB cable into port" skill.
 * Simulates:
 * - 30 frames at 30 FPS (1 second)
 * - Right hand only
 * - Camera pose available
 * - Depth available
 */
export const SYNTHETIC_STERA_OUTPUT: SteraProcessingOutput = {
    metadata: {
        source: 'stera',
        steraVersion: '0.1.0',
        deviceModel: 'iPhone 15 Pro',
        hasDepth: true,
        hasLiDAR: true,
        hasIMU: true,
        resolution: '1920x1080',
        fps: 30,
        hasCameraPose: true,
        sourceFile: 'insert-usb-cable.mcap',
        processedAt: 1724947200000, // 2024-08-29
        coordinateFrame: 'both',
        intrinsics: {
            fx: 1000.0,
            fy: 1000.0,
            cx: 960.0,
            cy: 540.0,
            width: 1920,
            height: 1080,
        },
        R_optical_to_link: [
            0, -1, 0,
            0, 0, -1,
            1, 0, 0,
        ],
    },
    frames: generateSyntheticFrames(),
}

/**
 * Generate 30 frames of synthetic hand data simulating USB cable insertion.
 * Motion: hand approaches from right, inserts cable, retracts.
 */
function generateSyntheticFrames() {
    const frames: SteraProcessingOutput['frames'] = []
    const NUM_FRAMES = 30
    const FPS = 30

    for (let i = 0; i < NUM_FRAMES; i++) {
        const t = i / (NUM_FRAMES - 1) // 0 → 1

        // Hand approaches from right (x: 0.3 → 0.5), inserts (x: 0.5), retracts (x: 0.5 → 0.3)
        const approachPhase = Math.min(t * 2, 1) // 0→0.5s: approach
        const insertPhase = Math.max(0, Math.min((t - 0.5) * 2, 1)) // 0.5→1s: insert

        // X position: starts at 0.3 (right), moves to 0.5 (center)
        const x = 0.3 + approachPhase * 0.2 - insertPhase * 0.05

        // Y position: stable around 0.5 (center)
        const y = 0.5 + Math.sin(t * Math.PI) * 0.02

        // Z position: approaches camera (depth decreases from 0.4 to 0.2)
        const z = 0.4 - approachPhase * 0.15 - insertPhase * 0.05

        // Camera pose: slight forward movement
        const cameraZ = -0.1 - t * 0.05

        // Generate 21 joints (simplified: all joints follow hand center with offsets)
        const joints = generateSyntheticJoints(x, y, z)

        frames.push({
            frameIndex: i,
            timestamp: i / FPS,
            hands: [
                {
                    handSide: 'right' as const,
                    joints,
                    confidence: 0.9 - t * 0.1, // Confidence decreases slightly
                },
            ],
            cameraPose: [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, cameraZ, 1,
            ],
        })
    }

    return frames
}

/**
 * Generate 21 synthetic joints for a hand at a given position.
 * MANO order: wrist, then [mcp, pip, dip, tip] for each finger.
 */
function generateSyntheticJoints(
    centerX: number,
    centerY: number,
    centerZ: number
): SteraProcessingOutput['frames'][0]['hands'][0]['joints'] {
    // Finger offsets from palm center (simplified)
    const fingerOffsets: Array<{ name: string; dx: number; dy: number; dz: number }> = [
        { name: 'wrist', dx: 0, dy: 0.05, dz: 0 },
        // Thumb
        { name: 'thumb_mcp', dx: -0.04, dy: 0.02, dz: 0.01 },
        { name: 'thumb_pip', dx: -0.06, dy: 0.01, dz: 0.02 },
        { name: 'thumb_dip', dx: -0.07, dy: 0, dz: 0.03 },
        { name: 'thumb_tip', dx: -0.08, dy: -0.01, dz: 0.04 },
        // Index
        { name: 'index_mcp', dx: -0.02, dy: -0.02, dz: 0 },
        { name: 'index_pip', dx: -0.02, dy: -0.05, dz: 0.01 },
        { name: 'index_dip', dx: -0.02, dy: -0.07, dz: 0.02 },
        { name: 'index_tip', dx: -0.02, dy: -0.09, dz: 0.03 },
        // Middle
        { name: 'middle_mcp', dx: 0, dy: -0.02, dz: 0 },
        { name: 'middle_pip', dx: 0, dy: -0.05, dz: 0.01 },
        { name: 'middle_dip', dx: 0, dy: -0.07, dz: 0.02 },
        { name: 'middle_tip', dx: 0, dy: -0.09, dz: 0.03 },
        // Ring
        { name: 'ring_mcp', dx: 0.02, dy: -0.02, dz: 0 },
        { name: 'ring_pip', dx: 0.02, dy: -0.05, dz: 0.01 },
        { name: 'ring_dip', dx: 0.02, dy: -0.07, dz: 0.02 },
        { name: 'ring_tip', dx: 0.02, dy: -0.09, dz: 0.03 },
        // Pinky
        { name: 'pinky_mcp', dx: 0.04, dy: -0.02, dz: 0 },
        { name: 'pinky_pip', dx: 0.04, dy: -0.04, dz: 0.01 },
        { name: 'pinky_dip', dx: 0.04, dy: -0.05, dz: 0.02 },
        { name: 'pinky_tip', dx: 0.04, dy: -0.06, dz: 0.03 },
    ]

    return fingerOffsets.map(f => ({
        x: centerX + f.dx,
        y: centerY + f.dy,
        z: centerZ + f.dz,
        confidence: 0.9,
        name: f.name,
    }))
}

/**
 * Synthetic base OKEM for testing SpatialOKEM creation.
 */
export const SYNTHETIC_BASE_OKEM = {
    id: 'test-okem-001',
    procedureName: 'Insert USB cable into port',
    specialistId: 'expert-001',
    skillId: 'skill-usb-cable',
    totalDurationMs: 1000,
    stepCount: 2,
    confidence: 0.85,
    warnings: [],
    steps: [
        {
            index: 0,
            name: 'Approach cable',
            description: 'Move hand toward USB cable',
            referenceFrames: [
                // 3 frames for step 0
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.3 + i * 0.01,
                    y: 0.5,
                    z: 0.4,
                    visibility: 0.9,
                })),
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.4 + i * 0.01,
                    y: 0.5,
                    z: 0.3,
                    visibility: 0.9,
                })),
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.5 + i * 0.01,
                    y: 0.5,
                    z: 0.25,
                    visibility: 0.9,
                })),
            ],
            durationMs: 500,
            meanVelocity: 0.15,
            isCritical: false,
            criticalLandmarks: [4, 8, 12, 16, 20],
            spatialVariance: 0.02,
            semanticType: 'action',
            actionVerb: 'approach',
            targetObject: 'USB cable',
        },
        {
            index: 1,
            name: 'Insert cable',
            description: 'Insert USB cable into port',
            referenceFrames: [
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.5 + i * 0.01,
                    y: 0.5,
                    z: 0.2,
                    visibility: 0.9,
                })),
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.5 + i * 0.01,
                    y: 0.5,
                    z: 0.15,
                    visibility: 0.9,
                })),
                Array.from({ length: 21 }, (_, i) => ({
                    x: 0.48 + i * 0.01,
                    y: 0.5,
                    z: 0.12,
                    visibility: 0.85,
                })),
            ],
            durationMs: 500,
            meanVelocity: 0.08,
            isCritical: true,
            criticalLandmarks: [4, 8],
            spatialVariance: 0.01,
            semanticType: 'precision',
            actionVerb: 'insert',
            targetObject: 'USB port',
        },
    ],
    guidance: [
        {
            stepNumber: 1,
            instruction: 'Approach the cable slowly',
            waitDurationMs: 2000,
            passThreshold: 0.7,
            isCritical: false,
        },
        {
            stepNumber: 2,
            instruction: 'Insert the cable straight',
            waitDurationMs: 3000,
            passThreshold: 0.8,
            isCritical: true,
        },
    ],
    createdAt: Date.now(),
}
