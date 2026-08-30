/**
 * @fileoverview Stera Adapter — converts Stera SDK output to SpatialOKEM
 * @description Bridges the gap between Stera Python SDK processing and
 *              Nexus SpatialOKEM format. Reads the JSON export from the
 *              Python processing script and creates SpatialOKEM objects.
 *
 *              This adapter does NOT run Stera SDK — it only converts
 *              the already-processed output.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { Landmark } from '../kinetic-engine'
import { RegistryOKEM, RegistryStep } from './okem-registry'
import {
    SpatialOKEM,
    SpatialStep,
    SpatialReferenceFrame,
    SpatialLandmark,
    SpatialCaptureMetadata,
    SteraHandDetection,
    SteraSpatialCapture,
    steraKeypointToSpatialLandmark,
    opticalToWorld,
    mergeSpatialData,
    hasSpatialData,
} from './spatial-okem'

// ─────────────────────────────────────────────────────────────────────────────
// Stera Processing Output — JSON format from Python script
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JSON structure output by the Python processing script.
 * This is what the adapter reads.
 */
export interface SteraProcessingOutput {
    /** Capture metadata */
    metadata: {
        source: 'stera'
        steraVersion: string
        deviceModel: string
        hasDepth: boolean
        hasLiDAR: boolean
        hasIMU: boolean
        resolution: string
        fps: number
        hasCameraPose: boolean
        sourceFile: string
        processedAt: number
        coordinateFrame: 'optical' | 'world' | 'both'
        /** Camera intrinsics for normalization */
        intrinsics?: {
            fx: number
            fy: number
            cx: number
            cy: number
            width: number
            height: number
        }
        /** Optical-to-link rotation matrix (3x3, column-major) */
        R_optical_to_link?: number[]
    }
    /** Hand detections per frame */
    frames: Array<{
        frameIndex: number
        timestamp: number
        hands: Array<{
            handSide: 'left' | 'right'
            joints: Array<{
                x: number
                y: number
                z: number
                confidence: number
                name?: string
            }>
            confidence: number
        }>
        /** Camera pose as 4x4 matrix (column-major, metres) — optional */
        cameraPose?: number[]
    }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter: Stera Processing Output → SpatialOKEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert Stera processing output into a SpatialOKEM.
 *
 * @param steraOutput - JSON from Python processing script
 * @param baseOkem - Existing OKEM to enrich (standard referenceFrames)
 * @returns SpatialOKEM with both standard and spatial data
 */
export function steraOutputToSpatialOKEM(
    steraOutput: SteraProcessingOutput,
    baseOkem: RegistryOKEM
): SpatialOKEM {
    const { metadata, frames } = steraOutput

    // Build spatial metadata
    const spatialMetadata: SpatialCaptureMetadata = {
        source: 'stera',
        steraVersion: metadata.steraVersion,
        deviceModel: metadata.deviceModel,
        hasDepth: metadata.hasDepth,
        hasLiDAR: metadata.hasLiDAR,
        hasIMU: metadata.hasIMU,
        resolution: metadata.resolution,
        fps: metadata.fps,
        hasCameraPose: metadata.hasCameraPose,
        sourceFile: metadata.sourceFile,
        processedAt: metadata.processedAt,
        coordinateFrame: metadata.coordinateFrame,
    }

    // Build spatial reference frames for each step
    const spatialSteps: SpatialStep[] = baseOkem.steps.map((step, stepIndex) => {
        // Calculate time bounds for this step
        const stepStartMs = baseOkem.steps
            .slice(0, stepIndex)
            .reduce((sum, s) => sum + s.durationMs, 0)
        const stepEndMs = stepStartMs + step.durationMs

        // Filter frames that fall within this step's time range
        const stepFrames = frames.filter(f => {
            const frameMs = f.timestamp * 1000
            return frameMs >= stepStartMs && frameMs < stepEndMs
        })

        // Convert Stera detections to SpatialReferenceFrames
        const spatialReferenceFrames: SpatialReferenceFrame[] = stepFrames.map(frame => {
            // Use first hand detection (or dominant hand)
            const handDetection = frame.hands[0]
            if (!handDetection) {
                return {
                    landmarks: step.referenceFrames[0]?.map(lm => ({ ...lm })) ?? [],
                    timestamp: frame.timestamp * 1000,
                }
            }

            // Convert joints to SpatialLandmarks
            const spatialLandmarks: SpatialLandmark[] = handDetection.joints.map(joint => {
                const slm = steraKeypointToSpatialLandmark(joint, metadata.intrinsics)

                // Apply world transform if camera pose available
                if (frame.cameraPose && frame.cameraPose.length === 16) {
                    const [world] = opticalToWorld(
                        [{ x: joint.x, y: joint.y, z: joint.z }],
                        frame.cameraPose,
                        metadata.R_optical_to_link
                    )
                    slm.worldX = world.worldX
                    slm.worldY = world.worldY
                    slm.worldZ = world.worldZ
                }

                slm.timestamp = frame.timestamp * 1000
                return slm
            })

            // Build depth valid mask
            const depthValid = handDetection.joints.map(j => j.z > 0)

            return {
                landmarks: spatialLandmarks,
                timestamp: frame.timestamp * 1000,
                cameraPose: frame.cameraPose,
                cameraPosition: frame.cameraPose
                    ? {
                          x: frame.cameraPose[12],
                          y: frame.cameraPose[13],
                          z: frame.cameraPose[14],
                      }
                    : undefined,
                depthValid,
            }
        })

        return {
            ...step,
            spatialReferenceFrames,
        }
    })

    // Merge into SpatialOKEM
    return mergeSpatialData(baseOkem, spatialSteps, spatialMetadata)
}

// ─────────────────────────────────────────────────────────────────────────────
// Inverse: SpatialOKEM → Supabase JSON (for storage)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialize a SpatialOKEM for storage in Supabase.
 * Spatial data goes into the existing `metadata` JSONB column.
 */
export function serializeSpatialOKEMForSupabase(
    spatialOkem: SpatialOKEM
): {
    okemRow: Omit<RegistryOKEM, 'steps'> & { steps: any[] }
    spatialMetadata: SpatialCaptureMetadata | null
    spatialSteps: SpatialStep[] | null
} {
    const { spatialMetadata, spatialSteps, ...standardOkem } = spatialOkem

    return {
        okemRow: standardOkem,
        spatialMetadata: spatialMetadata ?? null,
        spatialSteps: spatialSteps ?? null,
    }
}

/**
 * Deserialize a SpatialOKEM from Supabase rows.
 */
export function deserializeSpatialOKEMFromSupabase(
    okemRow: any,
    spatialMetadataJson: any,
    spatialStepsJson: any
): SpatialOKEM | RegistryOKEM {
    // If no spatial data, return standard OKEM
    if (!spatialMetadataJson || !spatialStepsJson) {
        return okemRow as RegistryOKEM
    }

    return {
        ...okemRow,
        spatialMetadata: spatialMetadataJson as SpatialCaptureMetadata,
        spatialSteps: spatialStepsJson as SpatialStep[],
    } as SpatialOKEM
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Check if an OKEM has spatial data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine if an OKEM object has spatial enrichment.
 * Works with both raw Supabase rows and typed objects.
 */
export function okemHasSpatialData(okem: any): boolean {
    if (!okem) return false
    if (okem.spatialMetadata && okem.spatialSteps) {
        return hasSpatialData(okem as SpatialOKEM)
    }
    // Check metadata JSONB column
    if (okem.metadata?.spatialMetadata) {
        return true
    }
    return false
}
