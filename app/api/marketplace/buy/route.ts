import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // 1. Authenticate User
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse Request
        const { listing_id } = await request.json()
        if (!listing_id) {
            return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })
        }

        // 3. Fetch Listing Details (Ensure it exists and is active)
        const { data: listingData, error: listingError } = await supabase
            .from('marketplace_listings')
            .select('*')
            .eq('id', listing_id)
            .eq('status', 'active')
            .single()

        const listing: any = listingData

        if (listingError || !listing) {
            return NextResponse.json({ error: 'Listing not found or inactive' }, { status: 404 })
        }

        // 4. Validate Logic
        if (listing.seller_id === user.id) {
            return NextResponse.json({ error: 'Cannot buy your own skill' }, { status: 400 })
        }

        // 5. Check if already purchased (Optional but good UX)
        // For digital goods, multiple purchases might be allowed, but usually you only need one access.
        // Let's check if a transaction exists for this user and listing.
        const { data: existingTx } = await supabaseAdmin
            .from('transactions')
            .select('id')
            .eq('listing_id', listing_id)
            .eq('buyer_id', user.id)
            .single()

        if (existingTx) {
            return NextResponse.json({ error: 'You already own this skill' }, { status: 400 })
        }

        // 6. Record Transaction (Mock Payment Success)
        // Using supabaseAdmin to bypass RLS "insert" policy if needed, 
        // and to act as the "System" verifying the payment.
        const { data: transaction, error: txError } = await supabaseAdmin
            .from('transactions')
            .insert({
                listing_id: listing.id,
                buyer_id: user.id,
                seller_id: listing.seller_id,
                amount: listing.price,
                currency: listing.currency || 'BRL'
            })
            .select()
            .single()

        if (txError) {
            console.error('Transaction Error:', txError)
            return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
        }

        return NextResponse.json({ success: true, transaction })

    } catch (err) {
        console.error('Purchase API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
