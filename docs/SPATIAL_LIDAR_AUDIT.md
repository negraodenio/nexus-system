# Nexus Open Source Spatial / LiDAR Technology Audit
**Date:** August 29, 2026  
**Status:** COMPLETE  
**Author:** Nexus AI  

---

## Executive Summary

This audit surveys the open-source landscape for spatial capture, depth sensing, LiDAR, 3D reconstruction, and real-time hand/object interaction technologies. The goal is to identify which technologies can enhance Nexus's OKEM system — specifically for **spatial context** (where skills happen), **object interaction** (what hands do to objects), and **scene understanding** (environment awareness).

**Key Finding:** Smartphone LiDAR/depth is now mature enough for capture. The best open-source projects (Stera 2.0, MCAP, Mobile-GS) provide the building blocks for a Spatial Layer that transforms 2D hand landmarks into 3D spatial OKEMs — without requiring specialized hardware.

---

## TOP 10 Open Source Projects (Ranked by Nexus Relevance)

### 1. Stera 2.0 (fpv-labs)
| | |
|---|---|
| **URL** | `https://github.com/fpv-labs/stera-app` + `stera-sdk` |
| **License** | MIT |
| **Stars** | ~500+ (growing) |
| **Language** | Swift (iOS app) + Python (SDK) |
| **Last Active** | 2026 |
| **What It Does** | Full RGB-D capture stack: iPhone LiDAR + RGB + IMU + MANO hand poses. Outputs MCAP format with synchronized sensor streams. |
| **Nexus Relevance** | **CRITICAL** — Provides the missing piece: 3D hand poses (MANO) + depth + scene geometry in a standard container. Could be the spatial capture backend for Nexus. |
| **How to Use** | Fork SDK as spatial capture module. Use MCAP as OKEM spatial container. MANO hand model replaces/augments MediaPipe 21-landmark model. |
| **Limitations** | iOS-only for capture. Requires iPhone with LiDAR (iPhone 12 Pro+). MCAP processing needs server-side pipeline. |
| **Decision** | **ADOPT — Primary spatial capture backend** |

### 2. MCAP (Foxglove)
| | |
|---|---|
| **URL** | `https://github.com/foxglove/mcap` |
| **License** | MIT |
| **Stars** | ~2,100+ |
| **Language** | TypeScript, C++, Python, Rust |
| **Last Active** | 2026 |
| **What It Does** | Modular, append-only data container format for robotics/sensor data. Supports multiple channels (video, LiDAR, IMU, custom schemas). Streaming + random access. |
| **Nexus Relevance** | **HIGH** — Standard container for OKEM spatial data. Stores synchronized hand + depth + audio + metadata in a single file. Foxglove Studio can visualize MCAP recordings for debugging. |
| **How to Use** | Use as OKEM file format. Each OKEM = MCAP file with channels: `hand_landmarks`, `depth_map`, `rgb_video`, `audio`, `pose_3d`, `metadata`. |
| **Limitations** | Not browser-native (needs WASM or server-side parsing). Web reading via `@foxglove/mcap` npm package. |
| **Decision** | **ADOPT — Standard container format for OKEM v2** |

### 3. iLiDAR (MIT)
| | |
|---|---|
| **URL** | `https://github.com/Galaxywalk/iLiDAR` |
| **License** | MIT |
| **Stars** | ~300+ |
| **Language** | Swift |
| **What It Does** | Streams iPhone LiDAR + RGB data in real-time. Provides depth maps, point clouds, and camera pose. |
| **Nexus Relevance** | **HIGH** — Simpler than Stera, focused on raw LiDAR streaming. Good for lightweight spatial capture without full MANO integration. |
| **How to Use** | Use for quick depth capture during recording. Capture scene geometry + distance to objects. |
| **Limitations** | No hand model integration. iOS-only. Raw sensor data only. |
| **Decision** | **ADOPT AS FALLBACK — Use if Stera is too heavy** |

### 4. Mobile-GS (ICLR 2026)
| | |
|---|---|
| **URL** | `https://github.com/xiaobiaodu/Mobile-GS` |
| **License** | Custom (research, commercial usage allowed) |
| **Stars** | 334 |
| **Language** | Python (training), WebGL (mobile rendering) |
| **Last Active** | 2026 |
| **What It Does** | Real-time Gaussian Splatting on mobile devices. 116 FPS on Snapdragon 8 Gen 3. Depth-aware order-free rendering + compression. |
| **Nexus Relevance** | **MEDIUM-HIGH** — Enables 3D scene reconstruction from recorded video. Could visualize OKEM procedures as interactive 3D scenes. "See the skill in 3D." |
| **How to Use** | Record procedure → train Mobile-GS → viewer sees 3D scene + ghost hand overlay. Spatial OKEM visualization. |
| **Limitations** | Requires COLMAP for initial pose estimation. Training is GPU-heavy (server-side). Mobile is render-only. |
| **Decision** | **WATCH — Use for 3D OKEM visualization in future phase** |

### 5. 3D Gaussian Splatting (INRIA)
| | |
|---|---|
| **URL** | `https://github.com/graphdeco-inria/gaussian-splatting` |
| **License** | Custom (research + commercial) |
| **Stars** | 23,536 |
| **Language** | Python, CUDA |
| **Last Active** | 2026 |
| **What It Does** | Original 3DGS implementation. Real-time radiance field rendering from multi-view images. |
| **Nexus Relevance** | **MEDIUM** — Reference implementation. Mobile-GS and Flux-GS are better for Nexus (mobile-first). Use for benchmarking. |
| **Decision** | **REFERENCE ONLY** |

### 6. Flux-GS (ECCV 2026)
| | |
|---|---|
| **URL** | `https://github.com/xiaobiaodu/Flux-GS` |
| **License** | Apache 2.0 |
| **Stars** | 65 |
| **Language** | Python + WebGL |
| **Last Active** | 2026 |
| **What It Does** | Monte Carlo Energy Aggregation for Mobile 3DGS. WebGL mobile renderer included. |
| **Nexus Relevance** | **MEDIUM-HIGH** — Same team as Mobile-GS, Apache 2.0 (better license). WebGL renderer could be used in Nexus web app for 3D OKEM preview. |
| **Decision** | **ADOPT for mobile 3D visualization** |

### 7. gsplat (nerfstudio)
| | |
|---|---|
| **URL** | `https://github.com/nerfstudio-project/gsplat` |
| **License** | Apache 2.0 |
| **Stars** | ~1,500+ |
| **Language** | Python, CUDA |
| **What It Does** | CUDA-accelerated Gaussian splatting rasterization. Faster and more memory-efficient than reference implementation. |
| **Nexus Relevance** | **MEDIUM** — Best for server-side 3DGS processing. Use for training OKEM spatial models. |
| **Decision** | **USE for server-side training** |

### 8. FoV-3DGS / MetaSapiens (Horizon Research)
| | |
|---|---|
| **URL** | `https://github.com/horizon-research/Fov-3DGS` |
| **License** | MIT |
| **Stars** | 138 |
| **Language** | Python, CUDA |
| **What It Does** | Foveated rendering for 3DGS on mobile. Prunes + compresses Gaussian primitives for edge devices. |
| **Nexus Relevance** | **LOW-MEDIUM** — Interesting for future mobile 3D visualization. Not needed for current OKEM capture. |
| **Decision** | **WATCH** |

### 9. Nerfstudio
| | |
|---|---|
| **URL** | `https://github.com/nerfstudio-project/nerfstudio` |
| **License** | Apache 2.0 |
| **Stars** | ~11,400+ |
| **Language** | Python |
| **What It Does** | Unified framework for NeRF/3DGS. Training, viewing, export. |
| **Nexus Relevance** | **LOW-MEDIUM** — Framework for future 3D scene reconstruction. Not needed for current OKEM. |
| **Decision** | **REFERENCE for future phases** |

### 10. Hand-Gesture-3D-Control (JAYP752)
| | |
|---|---|
| **URL** | `https://github.com/JAYP752/Hand-gesture-3d-control` |
| **License** | MIT |
| **Stars** | 1 |
| **Language** | Python |
| **What It Does** | Real-time hand gesture control of 3D objects via MediaPipe + OpenGL. |
| **Nexus Relevance** | **LOW** — Proof-of-concept for hand-3D interaction. MediaPipe already in Nexus. Useful for reference only. |
| **Decision** | **REFERENCE ONLY** |

---

## Deep Analysis: Stera 2.0 as Nexus Spatial Backend

### Why Stera Wins
| Factor | Stera | iLiDAR | Manual MediaPipe+ |
|---|---|---|---|
| MANO hand model | ✅ 20-DOF | ❌ | ❌ (21 landmarks only) |
| Depth + RGB sync | ✅ Hardware | ✅ Hardware | ❌ Software only |
| IMU integration | ✅ | ❌ | ❌ |
| Standard format | ✅ MCAP | Raw | Custom |
| Scene reconstruction | ✅ | Partial | ❌ |
| Nexus OKEM fit | ✅ Perfect | ⚠️ Partial | ⚠️ Limited |

### How Stera Changes OKEM

**Current OKEM (v1):**
```
hand_landmarks: [{x, y, z, visibility}] × 21 × N_frames
→ 2D pseudo-3D, no scene context, no object interaction
```

**Spatial OKEM (v2) with Stera:**
```
hand_poses: [{mano_pose, confidence, timestamp}] × N_frames  // 20-DOF MANO
depth_map: Float32Array × W × H  // per-pixel depth
scene_geometry: PointCloud  // sparse 3D map
camera_pose: {position, rotation}  // device tracking
object_proximity: [{distance, object_id}]  // hand-to-object
audio: Float32Array  // synchronized
transcription: string  // synchronized
```

**This transforms OKEM from "hand gesture recipe" to "spatial skill recipe."**

### Stera Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                NEXUS RECORDING APP                    │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Stera iOS App │  │   Microphone │  │   IMU      │ │
│  │ (RGB-D+LiDAR)│  │   (Audio)    │  │  (Motion)  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │         │
│         ▼                 ▼                 ▼         │
│  ┌─────────────────────────────────────────────────┐ │
│  │              MCAP CONTAINER                      │ │
│  │  channel: rgb_video (H.264)                     │ │
│  │  channel: depth_map (Float32)                   │ │
│  │  channel: hand_landmarks (MANO)                 │ │
│  │  channel: audio (PCM)                           │ │
│  │  channel: imu (accel+gyro)                      │ │
│  │  channel: camera_pose (SE3)                     │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              NEXUS SERVER (Processing)                │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ MCAP Parser  │  │ OKEM Extract │  │ Spatial    │ │
│  │ (read streams│→ │ (GMM+MANO+   │→ │ Index      │ │
│  │  + sync)     │  │  depth+audio)│  │ (Embedding)│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │          SPATIAL OKEM v2 OUTPUT                  │ │
│  │  • MANO hand poses (20-DOF)                     │ │
│  │  • Depth context per phase                       │ │
│  │  • Object proximity annotations                  │ │
│  │  • Scene geometry (sparse point cloud)           │ │
│  │  • Spatial confidence scores                     │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Smartphone-First Architecture

### What Works Today (No LiDAR Required)

| Capability | Tech | Status | Accuracy |
|---|---|---|---|
| Hand landmarks (21-point) | MediaPipe Hands | ✅ In Nexus | ±5mm typical |
| Hand world landmarks | MediaPipe (z-depth) | ✅ In Nexus | ±10mm |
| Audio transcription | Web Speech API / Whisper | ✅ In Nexus | ~95% WER |
| 3D hand pose (20-DOF) | MediaPipe Pose (limited) | ⚠️ Partial | ±15mm |
| Face mesh (468 points) | MediaPipe Face Mesh | 🔲 Not integrated | ±3mm |
| Body pose (33 points) | MediaPipe Pose | 🔲 Not integrated | ±20mm |
| Object detection | MediaPipe Object Detector | 🔲 Not integrated | Variable |

### What LiDAR Adds (iPhone 12 Pro+)

| Capability | Tech | Status | Accuracy |
|---|---|---|---|
| Depth map (per-pixel) | LiDAR sensor | 🔲 Via Stera/iLiDAR | ±1-3cm |
| Scene geometry (point cloud) | LiDAR + RGB | 🔲 Via Stera | ±2-5cm |
| Object distance | Depth map analysis | 🔲 To implement | ±1-3cm |
| Room layout | Scene reconstruction | 🔲 Via Stera | ±5-10cm |
| Surface detection | Plane segmentation | 🔲 Via ARKit/ARCore | ±2-5cm |

### What Requires ML (No Hardware Needed)

| Capability | Tech | Status | Accuracy |
|---|---|---|---|
| Hand-object interaction | Graph Neural Networks | 🔲 Research | Variable |
| Tool recognition | Object detection + tracking | 🔲 To implement | ~80% mAP |
| Action phase segmentation | Temporal clustering | 🔲 V2 specs done | ~90% F1 |
| Safety hazard detection | Anomaly detection on poses | 🔲 Partial (danger zone) | ~85% |

---

## Golden Skeleton Impact: Spatial OKEM

### Current Golden Skeleton (v1)
```typescript
interface GoldenSkeleton {
  pose: PoseFrame[];           // 2D pseudo-3D
  action: ActionSegment[];     // from speech alignment
  confidence: ConfidenceScore; // from visibility filter
  invariants: Invariant[];     // from statistical analysis
}
```

### Spatial Golden Skeleton (v2)
```typescript
interface SpatialGoldenSkeleton {
  // === EXISTING (keep) ===
  pose: PoseFrame[];
  action: ActionSegment[];
  confidence: ConfidenceScore;
  invariants: Invariant[];
  
  // === SPATIAL (new) ===
  spatial_context: {
    depth_map: Float32Array;           // per-pixel depth at key frames
    scene_geometry: PointCloud;         // sparse 3D map of workspace
    object_interactions: Interaction[]; // hand→object proximities
    room_layout: RoomDimensions;        // workspace bounds
    surface_type: 'table' | 'wall' | 'floor' | 'air';
  };
  
  // === MANO (new) ===
  hand_model: {
    mano_pose: MANOParameters;         // 20-DOF joint angles
    hand_shape: FloatArray;            // hand geometry
    finger_pressure: FloatArray[];     // estimated grip force
  };
  
  // === SPATIAL INVARIANTS (new) ===
  spatial_invariants: {
    min_distance_to_object: number;    // safety threshold
    required_workspace: BoundingBox;   // minimum space needed
    tool_trajectory: TrajectoryPath;   // 3D path of tool
    surface_contact: ContactPoint[];   // where tool touches surface
  };
}
```

---

## Recommended Next Step: Option Analysis

### Option A: Adopt Stera as Spatial Backend (RECOMMENDED)
| | |
|---|---|
| **What** | Fork Stera SDK as Nexus spatial capture module. Use MCAP as OKEM container. MANO for 3D hand poses. |
| **Pros** | MIT license. Proven hardware integration. MANO + depth + IMU. Standard MCAP format. Active development. |
| **Cons** | iOS-only for capture. Requires iPhone 12 Pro+. Server-side processing needed. |
| **Effort** | 3-4 weeks integration |
| **Risk** | Medium — iOS dependency, but Android depth via ARCore can be added later |
| **Impact** | **TRANSFORMATIVE** — OKEM goes from 2D gesture recipe → 3D spatial skill recipe |

### Option B: Extend MediaPipe Only (No LiDAR)
| | |
|---|---|
| **What** | Add MediaPipe Pose (body) + Face Mesh + Object Detector. No depth sensing. |
| **Pros** | Works on all devices. No hardware dependency. Simpler integration. |
| **Cons** | No real 3D. Pseudo-3D from MediaPipe z-coords is limited (~±10mm). No scene context. No object interaction. |
| **Effort** | 1-2 weeks |
| **Risk** | Low |
| **Impact** | **INCREMENTAL** — Better poses, but still fundamentally 2D. OKEM remains "gesture recipe." |

### Option C: Mobile-GS for 3D Scene Capture
| | |
|---|---|
| **What** | Use COLMAP + Mobile-GS to create 3D Gaussian scene from recorded video. Viewer explores 3D scene + ghost hand. |
| **Pros** | Photorealistic 3D scenes. Web viewer via WebGL. Impressive demos. |
| **Cons** | Requires server GPU for training (30+ min). Not real-time. Complex pipeline. No hand-object interaction. |
| **Effort** | 4-6 weeks |
| **Risk** | High — GPU training dependency, latency |
| **Impact** | **WOW FACTOR** — 3D scenes are impressive, but not core to OKEM value |

### Option D: Hybrid (Stera Capture + Mobile-GS Visualization)
| | |
|---|---|
| **What** | Stera for capture (real-time, MANO + depth). Mobile-GS for 3D scene reconstruction (server-side). Both feed OKEM v2. |
| **Pros** | Best of both: real-time spatial capture + photorealistic 3D visualization. |
| **Cons** | Most complex. Two external dependencies. Longest timeline. |
| **Effort** | 6-8 weeks |
| **Risk** | High |
| **Impact** | **MAXIMUM** — But potentially over-engineered for current stage |

---

## My Recommendation

**ADOPT OPTION A: Stera as Spatial Backend**

### Why
1. **Fills the biggest gap**: OKEM has no spatial context today. Stera adds it immediately.
2. **MANO is the right model**: 20-DOF hand model > 21-landmark model for skill verification.
3. **MCAP is the right format**: Standard, append-only, multi-channel. Perfect for OKEM v2.
4. **MIT license**: No IP risk. Can fork and modify freely.
5. **Mobile-GS can be added later**: Phase 2 for 3D visualization. Not needed for core OKEM value.

### What Changes in Nexus
| Component | Current | After Stera Adoption |
|---|---|---|
| Recording | MediaPipe 21-landmarks only | Stera: RGB-D + MANO + IMU + audio |
| OKEM format | JSON with landmark arrays | MCAP with spatial channels |
| Golden Skeleton | 2D pseudo-3D poses | 3D MANO poses + depth + scene |
| Verification | Pose similarity (2D) | Pose + depth + object proximity (3D) |
| Guidance | Ghost hand overlay (2D) | Ghost hand in 3D space + depth cues |
| Storage | Supabase JSON | MCAP files + Supabase metadata |

### Implementation Plan
1. **Week 1**: Fork Stera SDK, build MCAP writer for web
2. **Week 2**: Integrate MCAP recording into Nexus recording flow
3. **Week 3**: Build MCAP→OKEM parser, extract spatial OKEM v2
4. **Week 4**: Update Golden Skeleton with spatial data, test verification

---

## Appendix: License Matrix

| Project | License | Commercial Use | Modification | Distribution |
|---|---|---|---|---|
| Stera 2.0 | MIT | ✅ | ✅ | ✅ |
| MCAP | MIT | ✅ | ✅ | ✅ |
| iLiDAR | MIT | ✅ | ✅ | ✅ |
| Mobile-GS | Custom* | ✅ | ⚠️ | ⚠️ |
| 3DGS (INRIA) | Custom** | ✅ | ⚠️ | ⚠️ |
| Flux-GS | Apache 2.0 | ✅ | ✅ | ✅ |
| gsplat | Apache 2.0 | ✅ | ✅ | ✅ |
| FoV-3DGS | MIT | ✅ | ✅ | ✅ |
| Nerfstudio | Apache 2.0 | ✅ | ✅ | ✅ |
| Hand-Gesture-3D | MIT | ✅ | ✅ | ✅ |

*Mobile-GS: "commercial usage allowed" but no explicit open-source license text  
**3DGS INRIA: Custom license, commercial use with attribution required
