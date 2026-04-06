'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { HandSkeleton3D } from '@/components/hand-skeleton-3d'
import { StudioConsole } from '@/components/studio-console'
import { ParametricMotionEngine } from '@/lib/parametric-motion'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Box } from 'lucide-react'
import Link from 'next/link'

export default function NexusStudioPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [recipe, setRecipe] = useState<any | null>(null)
    const [generatedFrames, setGeneratedFrames] = useState<any[][]>([])
    
    // Refs for the 3D renderer
    const expertLandmarksRef = useRef<any[] | null>(null)
    const userLandmarksRef = useRef<any[] | null>(null)
    const studioLandmarksRef = useRef<any[] | null>(null)
    const alignmentScoreRef = useRef<number>(0)
    
    const animationFrameRef = useRef<number | null>(null)
    const currentFrameIdxRef = useRef(0)

    // Handle Generation
    const handleGenerate = async (prompt: string) => {
        setIsGenerating(true)
        setRecipe(null)
        setGeneratedFrames([])
        studioLandmarksRef.current = null

        try {
            const response = await fetch('/api/generate-skill', {
                method: 'POST',
                body: JSON.stringify({ prompt })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            const newRecipe = data.recipe
            setRecipe(newRecipe)

            // Convert recipe to sequence of landmarks
            const frames = ParametricMotionEngine.generateSequence(newRecipe)
            setGeneratedFrames(frames)
            
            toast.success('Motion Архитект generated the skill sequence!')
        } catch (error: any) {
            console.error('Generation failed:', error)
            toast.error(`Architecture failed: ${error.message}`)
        } finally {
            setIsGenerating(false)
        }
    }

    // Animation Loop for Studio Preview
    useEffect(() => {
        if (generatedFrames.length === 0) return

        const animate = () => {
            const idx = currentFrameIdxRef.current % generatedFrames.length
            studioLandmarksRef.current = generatedFrames[idx]
            currentFrameIdxRef.current++
            
            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [generatedFrames])

    // Save to Database (Bake)
    const handleSave = async () => {
        if (!recipe || generatedFrames.length === 0) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // 1. Create Skill record
            const { data: skill, error: skillErr } = await (supabase
                .from('skills')
                .insert({
                    user_id: user.id,
                    title: recipe.skillName,
                    description: recipe.reasoning,
                    category: 'Generated',
                    difficulty: 'Intermediate',
                    is_published: true
                } as any)
                .select()
                .single() as any)

            if (skillErr) throw skillErr

            // 2. Insert Frames
            const framesToInsert = generatedFrames.map((landmarks, index) => ({
                skill_id: skill.id,
                frame_index: index,
                landmarks: [landmarks] // Store as array of hands
            }))

            const { error: framesErr} = await (supabase
                .from('skill_frames')
                .insert(framesToInsert as any) as any)

            if (framesErr) throw framesErr

            toast.success('Skill baked and published to Nexus Registry!')
        } catch (error: any) {
            console.error('Save failed:', error)
            toast.error(`Baking failed: ${error.message}`)
        }
    }

    return (
        <div className="flex h-screen bg-[#050a12] overflow-hidden">
            {/* Sidebar / Console */}
            <StudioConsole 
                onGenerate={handleGenerate} 
                onSave={handleSave} 
                isGenerating={isGenerating} 
                recipe={recipe} 
            />

            {/* Main Preview Area */}
            <div className="flex-1 relative flex flex-col">
                {/* Header Overlay */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-md transition-all text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                            <Box className="w-4 h-4 text-amber-500" />
                            Kinetic Preview Stage
                        </div>
                    </div>
                </div>

                {/* 3D Stage */}
                <div className="flex-1">
                    <HandSkeleton3D 
                        expertLandmarksRef={expertLandmarksRef}
                        userLandmarksRef={userLandmarksRef}
                        studioLandmarksRef={studioLandmarksRef}
                        alignmentScoreRef={alignmentScoreRef}
                    />
                </div>

                {/* Status Bar */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-between items-center px-10">
                    <div className="flex gap-8 text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${generatedFrames.length > 0 ? 'bg-amber-500 pulse' : 'bg-slate-700'}`} />
                            RENDERER: {generatedFrames.length > 0 ? 'ACTIVE' : 'IDLE'}
                        </span>
                        <span>FPS: 30 FIXED</span>
                        <span>INTERPOLATION: LINEAR</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
