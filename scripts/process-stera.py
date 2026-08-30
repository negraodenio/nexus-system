#!/usr/bin/env python3
"""
Stereo → SpatialOKEM Processing Script

Processes an MCAP recording from Stera App and outputs JSON compatible
with the Nexus SpatialOKEM adapter.

Usage:
    python process-stera.py <input.mcap> <output.json> [--device-model "iPhone 15 Pro"]

Requirements:
    pip install "stera-sdk[mediapipe]"

This script:
1. Opens the MCAP file with Stera SDK
2. Detects hands using MediaPipe (21 joints, camera optical frame)
3. Extracts camera pose and depth per frame
4. Transforms hand joints to world coordinates when camera pose available
5. Outputs JSON in the format expected by stera-adapter.ts

License: Apache 2.0 (Stera SDK) — this script is part of Nexus (Proprietary)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import numpy as np
except ImportError:
    print("ERROR: numpy not installed. Run: pip install numpy", file=sys.stderr)
    sys.exit(1)

try:
    import stera
    from stera.data import MCAPReader
    from stera.models import HandTracker
    from stera.core.transforms import optical_to_world
except ImportError:
    print("ERROR: stera-sdk not installed. Run: pip install 'stera-sdk[mediapipe]'", file=sys.stderr)
    sys.exit(1)


def serialize_matrix_column_major(matrix: "np.ndarray") -> list:
    """
    Serialize a numpy matrix (3x3 or 4x4) to a flat list in COLUMN-MAJOR order.

    CONVENTION (canonical for Nexus SpatialOKEM):
      The TypeScript consumer (lib/core/spatial-okem.ts opticalToWorld) interprets
      matrices as column-major:
        - 3x3: link = R @ optical, read as [c0r0, c0r1, c0r2, c1r0, ...]
        - 4x4: rotation in [0..11], translation in [12, 13, 14]
      numpy's default flatten() is C-order (row-major) and would transpose the
      matrix / misplace the translation relative to what TypeScript expects.
      We therefore always use order='F' (Fortran = column-major).

    Args:
        matrix: numpy array (2D).

    Returns:
        Flat list of floats in column-major order.
    """
    return matrix.flatten(order="F").tolist()


def process_mcap(
    input_path: str,
    output_path: str,
    device_model: str = "unknown",
    max_frames: int = 0,
) -> dict:
    """
    Process an MCAP file and extract spatial hand data.

    Args:
        input_path: Path to .mcap file
        output_path: Path to write output JSON
        device_model: Device model string
        max_frames: Max frames to process (0 = all)

    Returns:
        Processing output dict
    """
    print(f"Opening MCAP: {input_path}")

    # Open recording
    session = MCAPReader(input_path)

    # Initialize hand tracker (MediaPipe — zero external setup)
    tracker = HandTracker(
        model="mediapipe",
        max_num_hands=2,
        min_detection_confidence=0.3,
        min_tracking_confidence=0.3,
    )

    # Detect capabilities from recording
    has_depth = session.has_depth
    has_camera_pose = session.has_camera_pose

    # Get intrinsics
    intrinsics = None
    try:
        rgb_K = session.rgb_intrinsics
        if rgb_K is not None:
            intrinsics = {
                "fx": float(rgb_K[0, 0]),
                "fy": float(rgb_K[1, 1]),
                "cx": float(rgb_K[0, 2]),
                "cy": float(rgb_K[1, 2]),
                "width": int(session.width),
                "height": int(session.height),
            }
    except Exception:
        pass

    # Get optical-to-link rotation
    R_optical_to_link = None
    try:
        R = session.R_optical_to_link
        if R is not None:
            # CONVENTION: serialize as COLUMN-MAJOR (see serialize_matrix_column_major).
            R_optical_to_link = serialize_matrix_column_major(R)
    except Exception:
        pass

    # Process frames
    frames_data = []
    frame_count = 0

    print("Processing frames...")
    for frame in session.frames():
        if max_frames > 0 and frame_count >= max_frames:
            break

        # Detect hands
        hands = tracker.detect_hands(frame)

        # Build frame data
        frame_entry = {
            "frameIndex": frame.index,
            "timestamp": float(frame.timestamp) if hasattr(frame, "timestamp") else frame_count / 30.0,
            "hands": [],
        }

        # Add camera pose if available
        if has_camera_pose and frame.camera_pose is not None:
            # camera_pose is Pose6D with rotation (3x3) and translation (3,)
            try:
                R_world = frame.camera_pose.rotation
                t_world = frame.camera_pose.translation
                # Build 4x4 matrix (column-major)
                pose_4x4 = np.eye(4)
                pose_4x4[:3, :3] = R_world
                pose_4x4[:3, 3] = t_world
                # CONVENTION: serialize as COLUMN-MAJOR (see serialize_matrix_column_major).
                # TypeScript (spatial-okem.ts opticalToWorld) reads rotation in [0..11]
                # and translation in [12, 13, 14]. order='F' keeps them aligned.
                frame_entry["cameraPose"] = serialize_matrix_column_major(pose_4x4)
            except Exception:
                pass

        # Add hand detections
        for hand in hands:
            hand_data = {
                "handSide": hand.hand_side,
                "joints": [],
                "confidence": float(hand.confidence),
            }

            # Extract 21 joints in MANO order
            for kp in hand.all_keypoints:
                joint = {
                    "x": float(kp.x),
                    "y": float(kp.y),
                    "z": float(kp.z),
                    "confidence": float(kp.confidence) if hasattr(kp, "confidence") else 1.0,
                }
                if hasattr(kp, "name") and kp.name:
                    joint["name"] = kp.name
                hand_data["joints"].append(joint)

            frame_entry["hands"].append(hand_data)

        frames_data.append(frame_entry)
        frame_count += 1

        if frame_count % 30 == 0:
            print(f"  Processed {frame_count} frames...")

    print(f"Processed {frame_count} frames total")

    # Build output
    output = {
        "metadata": {
            "source": "stera",
            "steraVersion": getattr(stera, "__version__", "unknown"),
            "deviceModel": device_model,
            "hasDepth": bool(has_depth),
            "hasLiDAR": False,  # Can't detect from MCAP alone
            "hasIMU": False,  # Would need to check IMU topic
            "resolution": f"{getattr(session, 'width', '?')}x{getattr(session, 'height', '?')}",
            "fps": 30,  # Default
            "hasCameraPose": bool(has_camera_pose),
            "sourceFile": os.path.basename(input_path),
            "processedAt": int(time.time() * 1000),
            "coordinateFrame": "both" if has_camera_pose else "optical",
            "intrinsics": intrinsics,
            "R_optical_to_link": R_optical_to_link,
        },
        "frames": frames_data,
    }

    # Write output
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Output written to: {output_path}")
    print(f"  Frames: {len(frames_data)}")
    print(f"  Depth: {has_depth}")
    print(f"  Camera pose: {has_camera_pose}")

    return output


def main():
    parser = argparse.ArgumentParser(
        description="Process Stera MCAP recording for Nexus SpatialOKEM"
    )
    parser.add_argument("input", help="Path to .mcap file")
    parser.add_argument("output", help="Path to output .json file")
    parser.add_argument(
        "--device-model", default="unknown", help="Device model string"
    )
    parser.add_argument(
        "--max-frames", type=int, default=0, help="Max frames to process (0=all)"
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    process_mcap(
        input_path=args.input,
        output_path=args.output,
        device_model=args.device_model,
        max_frames=args.max_frames,
    )


if __name__ == "__main__":
    main()
