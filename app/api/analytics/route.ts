import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'overview'

        // Initialize auth client for user-specific data
        const supabase = await createClient()

        if (type === 'my-skills') {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            const { data: skills, error } = await supabase
                .from('skills')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('My skills fetch error:', error)
                return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
            }

            return NextResponse.json({ skills: skills || [] })
        }

        if (type === 'overview') {
            // Get overall stats
            const [skillsResult, viewsResult, usersResult] = await Promise.all([
                supabaseAdmin.from('skills').select('id', { count: 'exact', head: true }),
                supabaseAdmin.from('skill_views').select('id', { count: 'exact', head: true }),
                supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true })
            ])

            return NextResponse.json({
                totalSkills: skillsResult.count || 0,
                totalViews: viewsResult.count || 0,
                totalUsers: usersResult.count || 0
            })
        }

        if (type === 'trending') {
            const { data, error } = await supabaseAdmin.rpc('get_trending_skills', {
                limit_count: 10
            })

            if (error) {
                console.error('Trending fetch error:', error)
                return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 500 })
            }

            return NextResponse.json({ trending: data || [] })
        }

        if (type === 'skill' && searchParams.get('id')) {
            const skillId = searchParams.get('id')

            const { data, error } = await supabaseAdmin.rpc('get_skill_analytics', {
                p_skill_id: skillId
            })

            if (error) {
                console.error('Skill analytics error:', error)
                return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
            }

            return NextResponse.json({ analytics: data?.[0] || null })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Track a skill view
export async function POST(request: Request) {
    try {
        const { skillId, sessionId, durationSeconds, completed } = await request.json()

        if (!skillId) {
            return NextResponse.json({ error: 'skillId is required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('skill_views')
            .insert({
                skill_id: skillId,
                session_id: sessionId || null,
                duration_seconds: durationSeconds || 0,
                completed: completed || false
            })

        if (error) {
            console.error('Track view error:', error)
            return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('View tracking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
