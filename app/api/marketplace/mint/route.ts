import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { skill_id, price, title, description } = await request.json()

        if (!skill_id || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Verify Ownership
        const { data: skill, error: skillError } = await supabase
            .from('skills')
            .select('creator_id')
            .eq('id', skill_id)
            .single()

        if (skillError || !skill) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
        }

        // Note: In MVP, some legacy skills might have null creator_id. 
        // We strictly enforce that only the creator can mint.
        if ((skill as any).creator_id !== user.id) {
            return NextResponse.json({ error: 'You do not own this skill' }, { status: 403 })
        }

        // 2. Create Listing
        const { data: listing, error: listingError } = await supabase
            .from('marketplace_listings')
            .insert({
                skill_id,
                seller_id: user.id,
                title,
                description,
                price: parseFloat(price),
                status: 'active'
            } as any)
            .select()
            .single()

        if (listingError) {
            // Check for duplicate listing constraint
            if (listingError.code === '23505') { // Postgres unique_violation
                return NextResponse.json({ error: 'Skill is already listed for sale' }, { status: 409 })
            }
            throw listingError
        }

        return NextResponse.json({ success: true, listing })

    } catch (error: any) {
        console.error('Minting Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
