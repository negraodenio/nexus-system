import { createClient } from '@/lib/supabase-server'
import { Store, Search, Filter } from 'lucide-react'
import { ListingCard } from '@/components/marketplace/listing-card'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
    const supabase = await createClient()

    // Fetch active listings with skill details
    const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
            *,
            skill:skills (
                title,
                video_url,
                description
            )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Type assertion to handle missing DB types
    const listings = data as any[] | null

    if (error) {
        console.error('Marketplace fetch error:', error)
    }

    return (
        <div className="min-h-screen bg-[#101822] text-white">
            {/* Header */}
            <div className="border-b border-slate-800 bg-[#1c242f]/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Skill Marketplace
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            <input
                                placeholder="Search skills..."
                                className="bg-[#101822] border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all focus:w-80"
                            />
                        </div>
                        <button className="p-2 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                            <Filter className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {listings && listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">Marketplace is Empty</h3>
                        <p className="text-slate-500 mb-6">Be the first to mint a skill and list it for sale!</p>
                        <a href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors">
                            Go to Dashboard to Mint
                        </a>
                    </div>
                )}
            </main>
        </div>
    )
}
