/**
 * @fileoverview SpatialOKEM — Stera-enriched OKEM types
 * @description Extends the existing OKEM schema with optional spatial metadata
 *              from Stera expert capture (depth, camera pose, world coordinates).
 *
 *              This is ADDITIVE — existing OKEMs work exactly as before.
 *              Spatial fields are optional. When absent, Nexus falls back to
 *              standard 2D/normalized behavior.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { Landmark } from '../kinetic-engine'
import { RegistryOKEM, RegistryStep } from './okem-registry'

// ─────────────────────────────────────────────────────────────────────────────
// Spatial Landmark — extends Landmark with optional metric/world data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Spatially-enriched landmark.
 * Extends the base Landmark (x, y, z, visibility) with optional depth and
 * world coordinates from Stera capture.
 *
 * IMPORTANT: x, y, z remain as MediaPipe normalized coordinates (0-1).
 * The spatial fields are ADDITIVE and do not replace the base coordinates.
 */
export interface SpatialLandmark extends Landmark {
    /** Depth in millimetres from Stera depth sensor (optional) */
    depth?: number
    /** World X coordinate in metres from Stera camera pose (optional) */
    worldX?: number
    /** World Y coordinate in metres from Stera camera pose (optional) */
    worldY?: number
    /** World Z coordinate in metres from Stera camera pose (optional) */
    worldZ?: number
    /** Detection confidence from Stera hand tracker (optional) */
    confidence?: number
    /** Timestamp in milliseconds from Stera capture (optional) */
    timestamp?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Spatial Reference Frame — one frame of spatially-enriched landmarks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single spatial reference frame containing enriched landmarks
 * and optional camera/world metadata.
 */
export interface SpatialReferenceFrame {
    /** Landmarks with optional spatial data */
    landmarks: SpatialLandmark[]
    /** Timestamp in milliseconds */
    timestamp: number
    /** Camera pose as 4x4 matrix (column-major, metres) — optional */
    cameraPose?: number[]
    /** Camera optical frame position in world coordinates — optional */
    cameraPosition?: { x: number; y: number; z: number }
    /** Depth valid mask per landmark — optional */
    depthValid?: boolean[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Spatial Step — extends RegistryStep with spatial reference frames
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Spatially-enriched step.
 * Contains the standard referenceFrames (normalized) plus optional
 * spatialReferenceFrames (metric/world).
 */
export interface SpatialStep extends RegistryStep {
    /** Optional spatial reference frames from Stera capture */
    spatialReferenceFrames?: SpatialReferenceFrame[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Spatial Capture Metadata — provenance and device info
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata about the Stera capture that produced this SpatialOKEM.
 */
export interface SpatialCaptureMetadata {
    /** Source system — always "stera" for Stera captures */
    source: 'stera'
    /** Stera SDK version used for processing */
    steraVersion?: string
    /** Capture device model (e.g., "iPhone 15 Pro") */
    deviceModel?: string
    /** Whether depth sensor was available during capture */
    hasDepth: boolean
    /** Whether LiDAR was available during capture */
    hasLiDAR: boolean
    /** Whether IMU data was captured */
    hasIMU: boolean
    /** RGB resolution used */
    resolution?: string
    /** Capture frame rate */
    fps?: number
    /** Whether camera pose (6-DoF SLAM) was available */
    hasCameraPose: boolean
    /** Original MCAP file name (for traceability) */
    sourceFile?: string
    /** Processing timestamp */
    processedAt?: number
    /** Coordinate frame convention used */
    coordinateFrame?: 'optical' | 'world' | 'both'
}

// ─────────────────────────────────────────────────────────────────────────────
// SpatialOKEM — the enriched OKEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SpatialOKEM wraps the existing RegistryOKEM with optional spatial metadata.
 *
 * Key design decisions:
 * - SpatialOKEM IS-A RegistryOKEM (structural subtype)
 * - All standard OKEM fields remain unchanged
 * - spatialMetadata is optional — absent means standard OKEM
 * - spatialSteps are optional — absent means use standard referenceFrames
 * - Learner path reads standard referenceFrames; spatial is ADDITIVE
 */
export interface SpatialOKEM extends RegistryOKEM {
    /** Spatial capture metadata — absent = standard OKEM */
    spatialMetadata?: SpatialCaptureMetadata
    /** Spatially-enriched steps — absent = use standard referenceFrames */
    spatialSteps?: SpatialStep[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Stera Processing Output — raw output from Stera SDK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw hand detection output from Stera SDK.
 * This is the intermediate format before conversion to SpatialOKEM.
 */
export interface SteraHandDetection {
    /** Hand side */
    handSide: 'left' | 'right'
    /** 21 joints in MANO order (wrist + 5×4) — camera optical frame, metres */
    joints: Array<{
        x: number
        y: number
        z: number
        confidence: number
        name?: string
    }>
    /** Overall detection confidence */
    confidence: number
    /** Frame index */
    frameIndex: number
    /** Timestamp in seconds */
    timestamp: number
}

/**
 * Raw spatial capture output from Stera SDK processing.
 * This is the intermediate format that gets converted to SpatialOKEM.
 */
export interface SteraSpatialCapture {
    /** Hand detections per frame — keyed by frame index */
    handDetections: Map<number, SteraHandDetection[]>
    /** Camera poses per frame — 4x4 matrices, column-major */
    cameraPoses: Map<number, number[]>
    /** Depth maps per frame — uint16 mm */
    depthMaps: Map<number, Uint16Array>
    /** Camera intrinsics */
    intrinsics?: {
        fx: number
        fy: number
        cx: number
        cy: number
        width: number
        height: number
    }
    /** Capture metadata */
    metadata: SpatialCaptureMetadata
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a Stera Keypoint (optical frame, metres) to a SpatialLandmark
 * (normalized + spatial). Requires camera intrinsics for normalization.
 */
export function steraKeypointToSpatialLandmark(
    joint: { x: number; y: number; z: number; confidence: number; name?: string },
    intrinsics?: { fx: number; fy: number; cx: number; cy: number; width: number; height: number }
): SpatialLandmark {
    let normalizedX: number
    let normalizedY: number

    if (intrinsics && intrinsics.fx > 0 && intrinsics.fy > 0) {
        // Project optical frame to pixel space, then normalize
        const pixelX = (joint.x * intrinsics.fx) / joint.z + intrinsics.cx
        const pixelY = (joint.y * intrinsics.fy) / joint.z + intrinsics.cy
        normalizedX = pixelX / intrinsics.width
        normalizedY = pixelY / intrinsics.height
    } else {
        // Fallback: use raw optical coordinates as approximate normalized
        // This is imprecise but maintains compatibility
        normalizedX = 0.5 + joint.x * 0.5
        normalizedY = 0.5 + joint.y * 0.5
    }

    return {
        x: normalizedX,
        y: normalizedY,
        z: joint.z, // Keep depth as-is for MediaPipe compatibility
        visibility: joint.confidence,
        depth: Math.round(joint.z * 1000), // metres → mm
        worldX: undefined, // Will be filled by world transform if available
        worldY: undefined,
        worldZ: undefined,
        confidence: joint.confidence,
    }
}

/**
 * Convert Stera optical frame joints to world coordinates using camera pose.
 * This is the core spatial transformation.
 *
 * Coordinate frames (Stera convention):
 * - Optical: X right, Y down, Z forward (camera optical frame)
 * - Link: X forward, Y left, Z up (robotic convention)
 * - World: SLAM origin, Y-up
 *
 * Transform chain: Optical --R_o2l--> Link --cameraPose--> World
 * All matrices in column-major order (Stera/WebGL convention).
 */
export function opticalToWorld(
    joints: Array<{ x: number; y: number; z: number }>,
    cameraPose: number[], // 4x4 column-major matrix
    R_optical_to_link?: number[] // 3x3 rotation matrix, column-major
): Array<{ worldX: number; worldY: number; worldZ: number }> {
    const results: Array<{ worldX: number; worldY: number; worldZ: number }> = []

    for (const joint of joints) {
        // Step 1: Optical -> Link frame (R_optical_to_link is 3x3 column-major)
        let linkX: number, linkY: number, linkZ: number
        if (R_optical_to_link && R_optical_to_link.length === 9) {
            // Column-major: link = R @ optical
            // R[0],R[3],R[6] = first column (X axis in link coords)
            linkX = R_optical_to_link[0] * joint.x + R_optical_to_link[3] * joint.y + R_optical_to_link[6] * joint.z
            linkY = R_optical_to_link[1] * joint.x + R_optical_to_link[4] * joint.y + R_optical_to_link[7] * joint.z
            linkZ = R_optical_to_link[2] * joint.x + R_optical_to_link[5] * joint.y + R_optical_to_link[8] * joint.z
        } else {
            // Identity transform: optical ≈ link (no R_o2l provided)
            linkX = joint.x
            linkY = joint.y
            linkZ = joint.z
        }

        // Step 2: Link -> World (cameraPose is 4x4 column-major)
        // cameraPose = [R_world_from_link | t_world; 0 0 0 1]
        // Column-major layout:
        // [ 0  4  8 12 ]   [ R00 R01 R02  tx ]
        // [ 1  5  9 13 ] = [ R10 R11 R12  ty ]
        // [ 2  6 10 11 ]   [ R20 R21 R22  tz ]
        // [ 3  7 11 15 ]   [  0   0   0   1  ]
        const worldX = cameraPose[0] * linkX + cameraPose[4] * linkY + cameraPose[8] * linkZ + cameraPose[12]
        const worldY = cameraPose[1] * linkX + cameraPose[5] * linkY + cameraPose[9] * linkZ + cameraPose[13]
        const worldZ = cameraPose[2] * linkX + cameraPose[6] * linkY + cameraPose[10] * linkZ + cameraPose[14]

        results.push({ worldX, worldY, worldZ })
    }

    return results
}

/**
 * Check if a SpatialOKEM has meaningful spatial data.
 */
export function hasSpatialData(okem: SpatialOKEM): boolean {
    return (
        okem.spatialMetadata !== undefined &&
        okem.spatialSteps !== undefined &&
        okem.spatialSteps.length > 0 &&
        okem.spatialSteps.some(s => s.spatialReferenceFrames && s.spatialReferenceFrames.length > 0)
    )
}

/**
 * Create a standard (non-spatial) OKEM from a SpatialOKEM.
 * Strips spatial metadata, returning the base RegistryOKEM.
 */
export function toStandardOKEM(spatialOkem: SpatialOKEM): RegistryOKEM {
    const { spatialMetadata, spatialSteps, ...standard } = spatialOkem
    return standard
}

/**
 * Merge spatial data into an existing RegistryOKEM.
 * Returns a SpatialOKEM with both standard and spatial data.
 */
export function mergeSpatialData(
    okem: RegistryOKEM,
    spatialSteps: SpatialStep[],
    metadata: SpatialCaptureMetadata
): SpatialOKEM {
    return {
        ...okem,
        spatialMetadata: metadata,
        spatialSteps,
    }
}
