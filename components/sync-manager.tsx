'use client'

import { useEffect, useState, useCallback } from 'react'
import { db, PendingSkill } from '@/lib/db-local'
import { supabase } from '@/lib/supabase'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

export function SyncManager() {
    const [isOnline, setIsOnline] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)

    // Watch pending skills count
    const pendingCount = useLiveQuery(
        () => db.pendingSkills.where('status').equals('pending').count()
    )

    const uploadSkill = useCallback(async (item: PendingSkill) => {
        // Update status to prevent double sync
        await db.pendingSkills.update(item.id!, { status: 'uploading' })

        // 1. Create skill record
        const { data: skill, error: skillError } = await (supabase as any)
            .from('skills')
            .insert({ title: item.title, difficulty_level: 1 })
            .select()
            .single()

        if (skillError || !skill) throw new Error('Skill insert failed')

        // 2. Upload video
        const videoFileName = `${skill.id}.webm`
        const { error: uploadError } = await supabase.storage
            .from('skill_videos')
            .upload(videoFileName, item.videoBlob, { contentType: 'video/webm', upsert: true })

        if (uploadError) throw new Error('Storage upload failed')

        // 3. Update video URL
        const { data: { publicUrl } } = supabase.storage
            .from('skill_videos')
            .getPublicUrl(videoFileName)

        await (supabase as any)
            .from('skills')
            .update({ video_url: publicUrl })
            .eq('id', skill.id)

        // 4. Save skeleton frames
        const CHUNK_SIZE = 100
        interface SkeletonFrame {
            frame_index: number;
            landmarks: unknown;
        }
        const payload = (item.skeletonFrames as any[]).map((f: SkeletonFrame) => ({
            skill_id: skill.id,
            frame_index: f.frame_index,
            landmarks: f.landmarks
        }))

        for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
            const chunk = payload.slice(i, i + CHUNK_SIZE)
            await (supabase as any).from('skill_frames').insert(chunk)
        }

        // 5. Trigger Semantic Search Embedding
        try {
            await fetch('/api/skills/semantic-search', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skillId: skill.id,
                    title: item.title,
                    description: '',
                    instructions: (item as any).sopInstructions || '' 
                })
            })
        } catch (err) {
            console.error('Semantic sync indexing error:', err)
        }

        // 6. Success! Remove from local DB
        await db.pendingSkills.delete(item.id!)
    }, [])

    const syncPendingSkills = useCallback(async () => {
        if (isSyncing || !navigator.onLine) return

        const pendingSkills = await db.pendingSkills
            .where('status').equals('pending')
            .toArray()

        if (pendingSkills.length === 0) return

        setIsSyncing(true)

        for (const item of pendingSkills) {
            try {
                await uploadSkill(item)
            } catch (error) {
                console.error(`Failed to sync skill ${item.id}:`, error)
            }
        }

        setIsSyncing(false)
    }, [isSyncing, uploadSkill])

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            syncPendingSkills()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [syncPendingSkills])

    if (isOnline && (!pendingCount || pendingCount === 0)) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg shadow-xl border border-slate-700">
            {!isOnline ? (
                <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold text-slate-300">Offline</span>
                </>
            ) : (
                <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-300">Online</span>
                        {isSyncing ? (
                            <span className="text-xs text-blue-400 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                            </span>
                        ) : (
                            pendingCount && pendingCount > 0 ? (
                                <span className="text-xs text-yellow-400">{pendingCount} pending upload(s)</span>
                            ) : null
                        )}
                    </div>
                    {pendingCount && pendingCount > 0 && !isSyncing && (
                        <button
                            onClick={syncPendingSkills}
                            className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs text-white hover:bg-blue-500"
                        >
                            Sync Now
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
