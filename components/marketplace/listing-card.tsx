'use client'

import React, { useState } from 'react'
import { ShoppingCart, Check, Loader2, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { getApiUrl } from '@/lib/api-config'

// Interface for the Listing data structure
interface ListingProps {
    listing: {
        id: string
        skill_id: string
        seller_id: string
        title: string
        description?: string
        price: number
        currency?: string
        status: string
        created_at: string
        skill?: {
            title?: string
            video_url?: string
            description?: string
        }
    }
}
export function ListingCard({ listing }: ListingProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [buying, setBuying] = useState(false)
    const [purchased, setPurchased] = useState(false)
    const [hover, setHover] = useState(false)

    // Use skill data if available, fallback to listing data
    const displayTitle = listing.skill?.title || listing.title
    const displayDesc = listing.description || listing.skill?.description || "No description provided."
    const videoUrl = listing.skill?.video_url

    const handleBuy = async () => {
        if (purchased) return

        // In a real app, we'd open a modal or Stripe integration here
        if (!confirm(`Confirm purchase of "${displayTitle}" for ${listing.currency} ${listing.price}?`)) return

        setBuying(true)
        try {
            // Call API to record purchase
            const response = await fetch(getApiUrl('/api/marketplace/buy'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: listing.id })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Purchase failed')
            }

            setPurchased(true)
            showToast(`Successfully purchased "${displayTitle}"!`, 'success')
            router.refresh()
        } catch (error: any) {
            console.error('Purchase failed', error)
            showToast(error.message || 'Purchase failed', 'error')
        } finally {
            setBuying(false)
        }
    }

    return (
        <div
            className="bg-[#1c242f] rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-all group flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Thumbnail / Video Preview */}
            <div className="h-48 bg-slate-800 relative flex items-center justify-center group-hover:bg-slate-700 transition-colors overflow-hidden">
                {videoUrl ? (
                    hover ? (
                        <video
                            src={videoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover animate-in fade-in duration-300"
                        />
                    ) : (
                        <video
                            src={videoUrl + '#t=0.5'}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    )
                ) : (
                    <PlayCircle className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                )}

                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white backdrop-blur-sm z-10">
                    VIDEO
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white line-clamp-1" title={displayTitle}>
                        {displayTitle}
                    </h3>
                    <span className="text-green-400 font-bold font-mono bg-green-900/20 px-2 py-0.5 rounded">
                        {listing.currency} {listing.price}
                    </span>
                </div>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {displayDesc}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                    <div className="text-xs text-slate-500 flex flex-col">
                        <span>Seller</span>
                        <span className="text-indigo-400 font-mono text-xs">{listing.seller_id.slice(0, 6)}...</span>
                    </div>

                    {purchased ? (
                        <button disabled className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-bold flex items-center gap-2 cursor-default border border-green-500/30">
                            <Check className="w-4 h-4" /> Owned
                        </button>
                    ) : (
                        <button
                            onClick={handleBuy}
                            disabled={buying}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        >
                            {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                            Buy Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
