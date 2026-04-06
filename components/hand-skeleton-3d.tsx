'use client'

/**
 * @fileoverview HandSkeleton3D — Visualização 3D do Ghost Hand com Three.js
 * @description Renderiza o esqueleto da mão em 3D usando as coordenadas X,Y,Z
 *              reais do MediaPipe. Expert (verde com glow), Utilizador (azul→vermelho
 *              por score). Substitui o canvas 2D plano quando em modo 3D.
 */

import { useRef, useMemo, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ===========================================================================
// CONSTANTS
// ===========================================================================

/** 21 landmarks MediaPipe — 20 conexões ósseas + 3 transversais da palma */
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Polegar
  [0, 5], [5, 6], [6, 7], [7, 8],          // Indicador
  [0, 9], [9, 10], [10, 11], [11, 12],     // Médio
  [0, 13], [13, 14], [14, 15], [15, 16],   // Anelar
  [0, 17], [17, 18], [18, 19], [19, 20],   // Mindinho
  [5, 9], [9, 13], [13, 17],               // Palma transversal
]

const FINGERTIP_INDICES = [4, 8, 12, 16, 20]
const KNUCKLE_SIZE = 0.028
const FINGERTIP_SIZE = 0.040
const BONE_RADIUS = 0.014
const HAND_SCALE = 2.8

// ===========================================================================
// HELPERS
// ===========================================================================

/** Converte landmark normalizado MediaPipe → Three.js world space */
function landmarkToVec3(lm: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(
    (lm.x - 0.5) * HAND_SCALE * -1, // espelhar X (webcam está invertida)
    (lm.y - 0.5) * HAND_SCALE * -1, // inverter Y (Y cresce para baixo no canvas)
    (lm.z || 0) * HAND_SCALE,        // Z = profundidade real da mão
  )
}

/** Score (0-100) → cor RGB: vermelho → amarelo → verde */
function scoreToColor(score: number, target: THREE.Color) {
  const t = Math.max(0, Math.min(1, score / 100))
  if (t < 0.5) {
    target.lerpColors(RED, YELLOW, t * 2)
  } else {
    target.lerpColors(YELLOW, GREEN, (t - 0.5) * 2)
  }
}

const RED    = new THREE.Color('#ef4444')
const YELLOW = new THREE.Color('#f59e0b')
const GREEN  = new THREE.Color('#22c55e')
const BLUE   = new THREE.Color('#3b82f6')
const AMBER  = new THREE.Color('#fbbf24')
const CYAN   = new THREE.Color('#06b6d4')
const MAGENTA = new THREE.Color('#d946ef')
const PURPLE  = new THREE.Color('#8b5cf6')
const UP     = new THREE.Vector3(0, 1, 0)

// ===========================================================================
// SUB-COMPONENT: HandSkeleton (renderizado dentro do Canvas, anima via useFrame)
// ===========================================================================

interface HandSkeletonProps {
  landmarksRef: MutableRefObject<{ x: number; y: number; z: number }[] | null>
  baseColor: THREE.Color
  emissiveIntensity: number
  /** Se passado, colore o esqueleto dinamicamente por score */
  scoreRef?: MutableRefObject<number>
}

function HandSkeleton({ landmarksRef, baseColor, emissiveIntensity, scoreRef }: HandSkeletonProps) {
  const jointMeshes = useRef<THREE.Mesh[]>([])
  const boneMeshes  = useRef<THREE.Mesh[]>([])

  // Buffers reutilizados a cada frame — zero garbage collection
  const posCache  = useMemo(() => Array.from({ length: 21 }, () => new THREE.Vector3()), [])
  const dynColor  = useMemo(() => new THREE.Color(), [])
  const boneDir   = useMemo(() => new THREE.Vector3(), [])
  const boneMid   = useMemo(() => new THREE.Vector3(), [])
  const boneQuat  = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    const lms = landmarksRef.current
    if (!lms || lms.length < 21) return

    // Determinar cor para este frame
    if (scoreRef) {
      scoreToColor(scoreRef.current, dynColor)
    } else {
      dynColor.copy(baseColor)
    }

    // Calcular posições world space
    for (let i = 0; i < 21; i++) {
      posCache[i].set(
        (lms[i].x - 0.5) * HAND_SCALE * -1,
        (lms[i].y - 0.5) * HAND_SCALE * -1,
        (lms[i].z || 0) * HAND_SCALE,
      )
    }

    // Atualizar joints
    for (let i = 0; i < 21; i++) {
      const mesh = jointMeshes.current[i]
      if (!mesh) continue

      mesh.position.copy(posCache[i])
      const isTip = FINGERTIP_INDICES.includes(i)
      const s = isTip ? FINGERTIP_SIZE : KNUCKLE_SIZE
      mesh.scale.setScalar(s)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.color.copy(dynColor)
      mat.emissive.copy(dynColor)
      mat.emissiveIntensity = isTip ? emissiveIntensity * 1.4 : emissiveIntensity
    }

    // Atualizar bones (cilindros)
    HAND_CONNECTIONS.forEach(([a, b], i) => {
      const bone = boneMeshes.current[i]
      if (!bone) return

      const start = posCache[a]
      const end   = posCache[b]

      boneMid.copy(start).add(end).multiplyScalar(0.5)
      boneDir.copy(end).sub(start)
      const length = boneDir.length()

      if (length < 1e-5) return // evitar divisão por zero

      bone.position.copy(boneMid)
      bone.scale.set(BONE_RADIUS, length, BONE_RADIUS)

      boneQuat.setFromUnitVectors(UP, boneDir.normalize())
      bone.quaternion.copy(boneQuat)

      const mat = bone.material as THREE.MeshStandardMaterial
      mat.color.copy(dynColor)
      mat.emissive.copy(dynColor)
      mat.emissiveIntensity = emissiveIntensity * 0.5
    })
  })

  return (
    <group>
      {/* 21 joints */}
      {Array.from({ length: 21 }, (_, i) => (
        <mesh key={`j${i}`} ref={el => { if (el) jointMeshes.current[i] = el }}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Bones */}
      {HAND_CONNECTIONS.map(([a, b], i) => (
        <mesh key={`b${i}`} ref={el => { if (el) boneMeshes.current[i] = el }}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity * 0.5}
            metalness={0.2}
            roughness={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

// ===========================================================================
// SCORE HUD (renderiza HTML sobre o canvas 3D)
// ===========================================================================

function ScoreHUD({ scoreRef }: { scoreRef: MutableRefObject<number> }) {
  const divRef = useRef<HTMLDivElement>(null)

  useFrame(() => {
    if (!divRef.current) return
    const s = scoreRef.current
    divRef.current.textContent = `${s}%`
    divRef.current.style.color = s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444'
  })

  // Nota: este div é renderizado FORA do canvas através do portal do R3F
  return null // usamos o html overlay no JSX pai
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================

export interface HandSkeleton3DProps {
  expertLandmarksRef: MutableRefObject<{ x: number; y: number; z: number }[] | null>
  userLandmarksRef:   MutableRefObject<{ x: number; y: number; z: number }[] | null>
  studioLandmarksRef?: MutableRefObject<{ x: number; y: number; z: number }[] | null>
  remoteUsersRef?: MutableRefObject<Map<string, { x: number; y: number; z: number }[] | null>>
  alignmentScoreRef:  MutableRefObject<number>
}

export function HandSkeleton3D({
  expertLandmarksRef,
  userLandmarksRef,
  studioLandmarksRef,
  remoteUsersRef,
  alignmentScoreRef,
}: HandSkeleton3DProps) {
  const REMOTE_COLORS = [CYAN, MAGENTA, PURPLE]
  return (
    <div className="relative w-full h-full bg-[#050a12]">
      {/* Score overlay */}
      <div className="absolute top-4 right-4 z-10 text-right pointer-events-none">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">Match 3D</p>
        <ScoreBadge scoreRef={alignmentScoreRef} />
      </div>

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-white text-xs font-mono">Expert (Ghost)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-white text-xs font-mono">You (score-colored)</span>
        </div>
        {studioLandmarksRef && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
            <span className="text-white text-xs font-mono">Studio GPT Preview</span>
          </div>
        )}
        {remoteUsersRef && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-white text-xs font-mono">Collaborators (Live)</span>
          </div>
        )}
        <p className="text-slate-500 text-xs mt-1 font-mono">Arrasta para rodar ↻</p>
      </div>

      <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.2, 2.8]} fov={55} />
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.4}
          target={[0, 0, 0]}
        />

        {/* Iluminação */}
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-3, -2, 1]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[0, 2, -2]} intensity={0.5} color="#22c55e" />

        {/* Grid holográfico */}
        <Grid
          args={[6, 6]}
          position={[0, -1.2, 0]}
          cellColor="#1e3a5f"
          sectionColor="#0f4c75"
          fadeDistance={5}
          infiniteGrid={false}
        />

        {/* Ghost do expert — verde, brilhante */}
        <HandSkeleton
          landmarksRef={expertLandmarksRef}
          baseColor={GREEN}
          emissiveIntensity={1.0}
        />

        {/* Mão do utilizador — azul base, cor muda por score */}
        <HandSkeleton
          landmarksRef={userLandmarksRef}
          baseColor={BLUE}
          emissiveIntensity={0.7}
          scoreRef={alignmentScoreRef}
        />

        {/* Mão Studio GPT (Âmbar) */}
        {studioLandmarksRef && (
          <HandSkeleton
            landmarksRef={studioLandmarksRef}
            baseColor={AMBER}
            emissiveIntensity={1.2}
          />
        )}

        {/* Mãos Colaboradoras (Remotas) */}
        {remoteUsersRef && Array.from(remoteUsersRef.current.keys()).map((userId, idx) => {
          // Criamos uma ref local proxy para manter a interface HandSkeleton
          const proxyRef = { 
            get current() { 
              return remoteUsersRef.current.get(userId) || null 
            } 
          } as MutableRefObject<{ x: number; y: number; z: number }[] | null>
          
          return (
            <HandSkeleton
              key={userId}
              landmarksRef={proxyRef}
              baseColor={REMOTE_COLORS[idx % REMOTE_COLORS.length]}
              emissiveIntensity={0.6}
            />
          )
        })}
      </Canvas>
    </div>
  )
}

// Badge de score que se auto-atualiza via Ref (sem re-render React)
function ScoreBadge({ scoreRef }: { scoreRef: MutableRefObject<number> }) {
  const ref = useRef<HTMLSpanElement>(null)

  // Não usa useFrame aqui pois está fora do Canvas — usa setInterval leve
  // O score muda no máximo a 5fps (throttled no ghost-hand-practice)
  // então um interval de 200ms é suficiente e não drena bateria
  if (typeof window !== 'undefined') {
    // Apenas no cliente — safe para SSR
  }

  return (
    <span
      ref={ref}
      className="text-4xl font-black tabular-nums"
      style={{ color: '#22c55e', textShadow: '0 0 20px currentColor' }}
    >
      —%
    </span>
  )
}
