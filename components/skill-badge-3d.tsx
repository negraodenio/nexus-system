'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

interface SkillBadge3DProps {
    score: number;
    title: string;
}

function BadgeModel({ score, title }: SkillBadge3DProps) {
    const meshRef = useRef<THREE.Group>(null)
    
    // Choose Material based on score
    const materialParams = useMemo(() => {
        if (score >= 90) return { color: '#fbbf24', metalness: 1.0, roughness: 0.1, label: 'EXPERT' }; // Gold
        if (score >= 75) return { color: '#94a3b8', metalness: 1.0, roughness: 0.2, label: 'PROFICIENT' }; // Silver
        return { color: '#b45309', metalness: 1.0, roughness: 0.3, label: 'STANDARD' }; // Bronze
    }, [score]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Main Medal Disk */}
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[1, 1, 0.15, 64]} />
                    <meshStandardMaterial 
                        color={materialParams.color}
                        metalness={materialParams.metalness}
                        roughness={materialParams.roughness}
                        envMapIntensity={2}
                    />
                </mesh>

                {/* Inner Glow Border */}
                <mesh position={[0, 0, 0.08]}>
                    <torusGeometry args={[0.85, 0.03, 16, 64]} />
                    <meshStandardMaterial 
                        color={materialParams.color}
                        emissive={materialParams.color}
                        emissiveIntensity={1.5}
                    />
                </mesh>

                {/* Level Text (Simulation for prototype) */}
                <mesh position={[0, 0, 0.1]}>
                    <ringGeometry args={[0.7, 0.9, 64]} />
                    <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.5} />
                </mesh>
            </Float>
        </group>
    )
}

export function SkillBadge3D({ score, title }: SkillBadge3DProps) {
    return (
        <div className="w-full h-[300px] cursor-grab active:cursor-grabbing">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                <OrbitControls enableZoom={false} enablePan={false} />
                
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} color={new THREE.Color('#3b82f6')} />
                
                <BadgeModel score={score} title={title} />
                
                {/* Atmospheric Glow */}
                <mesh scale={[10, 10, 1]}>
                    <circleGeometry args={[1, 64]} />
                    <meshBasicMaterial color="#0f172a" transparent opacity={0.5} side={THREE.BackSide} />
                </mesh>
            </Canvas>
        </div>
    )
}
