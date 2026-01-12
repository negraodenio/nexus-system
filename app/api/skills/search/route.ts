import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')

    if (!query || query.trim() === '') {
        return NextResponse.json({ skills: [] })
    }

    try {
        const keywords = query.toLowerCase().split(' ')

        // Get skills with tags
        const { data: allSkills, error } = await supabase
            .from('skills')
            .select('id, title, category, tags, description, video_url')
            .limit(50)

        if (error) {
            console.error("DB Error:", error)
            return NextResponse.json({ skills: [] })
        }

        // Filter skills where ANY keyword matches ANY tag
        const matched = (allSkills || []).filter(skill => {
            if (!skill.tags || skill.tags.length === 0) return false
            const tagLower = skill.tags.map((t: string) => t.toLowerCase())
            return keywords.some(kw => tagLower.some((tag: string) => tag.includes(kw)))
        })

        return NextResponse.json({ skills: matched.slice(0, 3) })

    } catch (error) {
        console.error("Skill Search Error:", error)
        return NextResponse.json({ skills: [], error: 'Search failed' }, { status: 500 })
    }
}
