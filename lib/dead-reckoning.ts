/**
 * NEXUS 3.0 - DEAD RECKONING ENGINE
 * Mascarando o jitter da rede com predição linear de trajetória (Biomechanical Smoothing).
 */

export class DeadReckoning {
    private lastLandmarks: { x: number; y: number; z: number }[] | null = null;
    private velocity: { x: number; y: number; z: number }[] = Array(21).fill({ x: 0, y: 0, z: 0 });
    private lastUpdateAt: number = 0;

    /**
     * Updates the model with a new real packet.
     */
    public update(newLm: { x: number; y: number; z: number }[]) {
        const now = Date.now();
        const dt = (now - this.lastUpdateAt) / 1000; // in seconds

        if (this.lastLandmarks && dt > 0) {
            // Update Velocity for all 21 points
            this.velocity = newLm.map((lm, i) => ({
                x: (lm.x - this.lastLandmarks![i].x) / dt,
                y: (lm.y - this.lastLandmarks![i].y) / dt,
                z: ((lm.z || 0) - (this.lastLandmarks![i].z || 0)) / dt
            }));
        }

        this.lastLandmarks = JSON.parse(JSON.stringify(newLm));
        this.lastUpdateAt = now;
    }

    /**
     * Predicts landmarks for the current moment, even if a packet is delayed.
     */
    public predict(): { x: number; y: number; z: number }[] | null {
        if (!this.lastLandmarks) return null;

        const now = Date.now();
        const dt = (now - this.lastUpdateAt) / 1000;

        // Limiting prediction to 150ms max to avoid aberrant drift
        const clampedDt = Math.min(dt, 0.150);

        return this.lastLandmarks.map((lm, i) => ({
            x: lm.x + (this.velocity[i].x * clampedDt),
            y: lm.y + (this.velocity[i].y * clampedDt),
            z: (lm.z || 0) + (this.velocity[i].z * clampedDt)
        }));
    }

    /**
     * Smoothly blends between the current prediction and a new packet.
     */
    public static blend(
        current: { x: number; y: number; z: number }[],
        target: { x: number; y: number; z: number }[],
        alpha: number = 0.2
    ): { x: number; y: number; z: number }[] {
        return current.map((lm, i) => ({
            x: lm.x * (1 - alpha) + target[i].x * alpha,
            y: lm.y * (1 - alpha) + target[i].y * alpha,
            z: (lm.z || 0) * (1 - alpha) + (target[i].z || 0) * alpha
        }));
    }
}
