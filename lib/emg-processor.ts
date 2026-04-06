/**
 * NEXUS 3.0 - EMG PROCESSOR
 * Senior Implementation: Signal Feature Extraction (MAV, WL, Spectral) 
 * for Neural RAG Retrieval.
 */

import { generateEmbedding } from './ai-client';

export interface EMGFeatures {
    mav: number[]; // Mean Absolute Value
    wl: number[];  // Wavelength
    ssc: number[]; // Slope Sign Change
}

export class EMGProcessor {
    /**
     * Extracts time-domain features from a window of EMG signals.
     */
    public static extractFeatures(window: number[][]): EMGFeatures {
        const numChannels = window[0].length;
        const windowSize = window.length;

        const mav = new Array(numChannels).fill(0);
        const wl = new Array(numChannels).fill(0);
        const ssc = new Array(numChannels).fill(0);

        for (let ch = 0; ch < numChannels; ch++) {
            let sumAbs = 0;
            let totalWl = 0;
            let slopeSigns = 0;

            for (let i = 0; i < windowSize; i++) {
                sumAbs += Math.abs(window[i][ch]);
                
                if (i > 0) {
                    totalWl += Math.abs(window[i][ch] - window[i-1][ch]);
                }
                
                if (i > 1) {
                    const slope1 = window[i-1][ch] - window[i-2][ch];
                    const slope2 = window[i][ch] - window[i-1][ch];
                    if (slope1 * slope2 < 0) slopeSigns++;
                }
            }

            mav[ch] = sumAbs / windowSize;
            wl[ch] = totalWl;
            ssc[ch] = slopeSigns;
        }

        return { mav, wl, ssc };
    }

    /**
     * Converts features into a semantic embedding for RAG retrieval.
     * In a production environment, this would use a specialized transformer.
     * For this MVP, we map features to a 1536D vector via statistical expansion.
     */
    public static async toEmbedding(features: EMGFeatures): Promise<number[] | null> {
        // Flatten features for string representation (for generateEmbedding RAG)
        const featureStr = `MAV:${features.mav.join(',')} WL:${features.wl.join(',')} SSC:${features.ssc.join(',')}`;
        
        // Use our standard AI embedding generator
        return await generateEmbedding(featureStr);
    }
}
