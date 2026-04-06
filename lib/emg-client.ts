/**
 * NEXUS 3.0 - EMG BCI CLIENT
 * Senior Implementation: Signal synthesis, denoising, and normalization.
 */

export interface EMGData {
  timestamp: number;
  channels: number[]; // 8 channels (0.0 - 1.0)
  quality: number;    // Signal quality (0.0 - 1.0)
}

export class EMGClient {
  private static instance: EMGClient;
  private isSimulating: boolean = false;
  private callback: ((data: EMGData) => void) | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): EMGClient {
    if (!EMGClient.instance) {
      EMGClient.instance = new EMGClient();
    }
    return EMGClient.instance;
  }

  /**
   * Start 60Hz EMG simulation.
   * Synthesizes muscle activation based on hand movement intent.
   */
  public startSimulation(onData: (data: EMGData) => void) {
    if (this.isSimulating) return;
    this.isSimulating = true;
    this.callback = onData;

    this.intervalId = setInterval(() => {
      const data = this.synthesizeSignal();
      if (this.callback) this.callback(data);
    }, 16.67); // ~60Hz
  }

  public stopSimulation() {
    this.isSimulating = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.callback = null;
  }

  /**
   * Generates a 8-channel EMG signal with noise and muscle firing patterns.
   */
  private synthesizeSignal(): EMGData {
    const now = Date.now();
    
    // Simulate baseline noise (floor)
    const channels = Array.from({ length: 8 }, () => {
      const noise = Math.random() * 0.05;
      // Add a slow sine wave to simulate baseline shift
      const drift = Math.sin(now / 500) * 0.02;
      return Math.max(0, noise + drift);
    });

    // Simulate "Muscle Firing" (spikes) every 2 seconds for a random channel
    if (Math.sin(now / 300) > 0.8) {
        const activeChannel = Math.floor(Math.random() * 8);
        channels[activeChannel] += 0.4 + Math.random() * 0.3;
    }

    return {
      timestamp: now,
      channels: this.applySmoothing(channels),
      quality: 0.95 // High quality for simulation
    };
  }

  /**
   * Simple Exponential Smoothing for the simulated signal.
   */
  private lastChannels: number[] = Array(8).fill(0);
  private applySmoothing(newChannels: number[]): number[] {
    const ALPHA = 0.3;
    this.lastChannels = newChannels.map((val, i) => 
      (val * ALPHA) + (this.lastChannels[i] * (1 - ALPHA))
    );
    return this.lastChannels;
  }

  /**
   * Normalization static utility.
   */
  public static normalize(channels: number[]): number[] {
    const max = Math.max(...channels, 0.001);
    return channels.map(c => c / max);
  }
}
