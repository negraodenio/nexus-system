'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SkillCard } from '@/components/marketplace/skill-card'
import { 
    Search, Filter, ShoppingBag, Award, Sparkles, 
    TrendingUp, Shield, Database, Wallet, Info 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const fetchMarketplace = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                setUser(authUser)
                const { data: profile } = await (supabase.from('profiles').select('*').eq('id', authUser.id).single() as any)
                if (profile) setUser({ ...authUser, ...profile })
            }

            const { data, error } = await supabase
                .from('marketplace_listings')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (data) setListings(data)
            setIsLoading(false)
        }

        fetchMarketplace()
    }, [])

    const filteredListings = listings.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filter === 'all' || (filter === 'premium' && l.is_premium) || (filter === 'standard' && !l.is_premium))
    )

    return (
        <div className="min-h-screen bg-[#050a12] p-8 md:p-12 lg:p-16 text-white overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative">
                {/* Header / Wallet Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Nexus Ecosystem v3.0
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">
                            Telecom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">Module Library</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-xl font-medium">
                            Explore and activate certified physical intelligence protocols for your field teams. Standardized modules for maintenance and installation excellence.
                        </p>
                    </div>

                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] flex items-center gap-6 min-w-[280px]">
                        <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center p-2 border border-blue-400/30">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                Enterprise Plan Active
                            </div>
                            <div className="text-xl font-black text-white tracking-tight uppercase">
                                Unlimited Licenses
                            </div>
                            <div className="mt-1 text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                                Valid for 12 Operators
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-Header / Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="relative group lg:col-span-2">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by cinematic protocol or architect name..." 
                            className="w-full bg-[#111926]/50 border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[#111926]/50 rounded-3xl p-1.5 border border-white/5">
                        {['all', 'premium', 'standard'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === t ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em]">Synching with Commercial Ledger...</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300">No Listings Found</h3>
                        <p className="text-slate-500 max-w-sm text-center text-sm mt-3">
                            Refine your search parameters or check back later for new cinematic fragments.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { id: 'm1', title: 'ONT Installation', desc: 'Standardized protocol for GPON/XGS-PON terminal deployment and signal validation.', tech: 'Fiber-Optic', premium: true },
                            { id: 'm2', title: 'Fiber Fusion (Join)', desc: 'Precision-critical core alignment for minimal DB loss. 21-point tracking.', tech: 'Splicing', premium: true },
                            { id: 'm3', title: 'Splicing Protection', desc: 'Post-fusion protective tube shrinking and tray organization protocol.', tech: 'Splicing', premium: false },
                            { id: 'm4', title: 'Torque Validation', desc: 'Visual verification of mechanical connector tightening for safety compliance.', tech: 'Hardware', premium: false },
                            { id: 'm5', title: 'Labeling & Audit', desc: 'Multi-point validation of cabinet labeling and site cleanliness standards.', tech: 'Audit', premium: false },
                        ].map((m) => (
                            <SkillCard 
                                key={m.id} 
                                listing={{
                                    id: m.id,
                                    skill_id: m.id,
                                    title: m.title,
                                    description: m.desc,
                                    price: 0,
                                    currency: 'FREE',
                                    is_premium: m.premium,
                                    seller_id: 'NEXUS-CORP'
                                }} 
                                userId={user?.id} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Extra decorative bits */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
    )
}
