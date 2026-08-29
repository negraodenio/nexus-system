/**
 * NEXUS 3.0 - PARAMETRIC MOTION ENGINE
 * Biomechanical Architect: Synthesizes 21-point hand landmarks from kinematic recipes.
 */

import { type Landmark } from './kinetic-engine'

export interface MotionRecipe {
    duration: number; // In frames (30fps)
    basePosition: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
    fingers: {
        thumb: number; // 0.0 (open) to 1.0 (closed)
        index: number;
        middle: number;
        ring: number;
        pinky: number;
    }[]; // Array of keyframes (one per frame or interpolated)
}

export class ParametricMotionEngine {
    // 21 landmarks relative to wrist (0, 0, 0) in standard rest pose
    private static readonly RELATIVE_REST_POSE: { [key: number]: [number, number, number] } = {
        0:  [0, 0, 0],       // Wrist
        1:  [0.1, -0.05, 0], // Thumb CMC
        2:  [0.18, -0.1, 0.02],
        3:  [0.23, -0.15, 0.04],
        4:  [0.28, -0.2, 0.06], // Thumb Tip
        5:  [0.05, -0.25, 0.02], // Index MCP
        6:  [0.05, -0.35, 0.04],
        7:  [0.05, -0.42, 0.05],
        8:  [0.05, -0.48, 0.06], // Index Tip
        9:  [0, -0.26, 0],     // Middle MCP
        10: [0, -0.37, 0.01],
        11: [0, -0.45, 0.02],
        12: [0, -0.52, 0.03], // Middle Tip
        13: [-0.05, -0.25, -0.02], // Ring MCP
        14: [-0.05, -0.35, -0.03],
        15: [-0.05, -0.42, -0.04],
        16: [-0.05, -0.48, -0.05], // Ring Tip
        17: [-0.1, -0.22, -0.04], // Pinky MCP
        18: [-0.1, -0.3, -0.05],
        19: [-0.1, -0.36, -0.06],
        20: [-0.1, -0.42, -0.07], // Pinky Tip
    };

    /**
     * Generates a sequence of frames from a recipe.
     */
    public static generateSequence(recipe: MotionRecipe): any[][] {
        const frames = [];
        for (let i = 0; i < recipe.duration; i++) {
            const progress = i / recipe.duration;
            const fingerState = recipe.fingers[Math.min(i, recipe.fingers.length - 1)];
            frames.push(this.generateFrame(recipe.basePosition, recipe.rotation, fingerState));
        }
        return frames;
    }

    /**
     * Generates a single frame (21 landmarks).
     */
    public static generateFrame(
        basePos: { x: number; y: number; z: number },
        rotation: { pitch: number; yaw: number; roll: number },
        fingers: { thumb: number; index: number; middle: number; ring: number; pinky: number }
    ): any[] {
        const landmarks = [];
        
        for (let i = 0; i < 21; i++) {
            let [rx, ry, rz] = this.RELATIVE_REST_POSE[i];

            // Apply "Flexion" logic (bend fingers based on index)
            if (i >= 1 && i <= 4) [rx, ry, rz] = this.applyFlexion(rx, ry, rz, fingers.thumb, i, 1);
            if (i >= 5 && i <= 8) [rx, ry, rz] = this.applyFlexion(rx, ry, rz, fingers.index, i, 5);
            if (i >= 9 && i <= 12) [rx, ry, rz] = this.applyFlexion(rx, ry, rz, fingers.middle, i, 9);
            if (i >= 13 && i <= 16) [rx, ry, rz] = this.applyFlexion(rx, ry, rz, fingers.ring, i, 13);
            if (i >= 17 && i <= 20) [rx, ry, rz] = this.applyFlexion(rx, ry, rz, fingers.pinky, i, 17);

            // Apply Global Hand Rotation
            const [rotatedX, rotatedY, rotatedZ] = this.rotatePoint(rx, ry, rz, rotation);

            // Translate to Base Position
            landmarks.push({
                x: basePos.x + rotatedX,
                y: basePos.y + rotatedY,
                z: basePos.z + rotatedZ,
                visibility: 1.0
            });
        }

        return landmarks;
    }

    private static applyFlexion(x: number, y: number, z: number, flexion: number, index: number, baseIndex: number): [number, number, number] {
        const offset = index - baseIndex;
        if (offset === 0) return [x, y, z]; // MCP doesn't move much in this simplified model

        // Rotate joints inwards as flexion increases
        const angle = flexion * (Math.PI / 1.5) * (offset / 3);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Simple rotation around Z for finger curl (approximated)
        return [
            x,
            y * cosA - z * sinA, 
            y * sinA + z * cosA
        ];
    }

    private static rotatePoint(x: number, y: number, z: number, rot: { pitch: number; yaw: number; roll: number }): [number, number, number] {
        // Roll (Z)
        const x1 = x * Math.cos(rot.roll) - y * Math.sin(rot.roll);
        const y1 = x * Math.sin(rot.roll) + y * Math.cos(rot.roll);
        const z1 = z;

        // Pitch (X)
        const y2 = y1 * Math.cos(rot.pitch) - z1 * Math.sin(rot.pitch);
        const z2 = y1 * Math.sin(rot.pitch) + z1 * Math.cos(rot.pitch);
        const x2 = x1;

        // Yaw (Y)
        const x3 = x2 * Math.cos(rot.yaw) + z2 * Math.sin(rot.yaw);
        const z3 = -x2 * Math.sin(rot.yaw) + z2 * Math.cos(rot.yaw);
        const y3 = y2;

        return [x3, y3, z3];
    }
}
