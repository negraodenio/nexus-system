/**
 * NEXUS VISION WORKER v1.0
 * Offloads MediaPipe inference to a background thread.
 */

import { FilesetResolver, HandLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm/vision_bundle.mjs';

let handLandmarker;

async function init() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "IMAGE", // Use IMAGE mode for more control per-frame
        numHands: 1
    });
    self.postMessage({ type: 'READY' });
}

self.onmessage = async (e) => {
    if (e.data.type === 'INIT') {
        await init();
        return;
    }

    if (e.data.type === 'PROCESS' && handLandmarker) {
        const { imageBitmap, timestamp } = e.data;
        
        try {
            const results = handLandmarker.detect(imageBitmap);
            
            // Send results back to main thread
            self.postMessage({
                type: 'RESULTS',
                results,
                timestamp
            });
            
            // Clean up bitmap
            imageBitmap.close();
        } catch (err) {
            console.error("Worker Inference Error:", err);
            self.postMessage({ type: 'ERROR', error: err.message });
        }
    }
};
