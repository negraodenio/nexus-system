'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CheckCircle, Shield, Globe, Award, Database, Box } from 'lucide-react'
import { PurchaseService } from '@/lib/marketplace/purchase-service'
import { toast } from 'sonner'

interface SkillCardProps {
    listing: {
        id: string;
        skill_id: string;
        title: string;
        description: string;
        price: number;
        currency: string;
        is_premium: boolean;
        seller_id: string;
    }
    userId: string;
}

export function SkillCard({ listing, userId }: SkillCardProps) {
    const handleBuy = async () => {
        toast.info(`Initiating transaction for ${listing.title}...`)
        
        try {
            const result = await PurchaseService.buySkill(userId, listing.id, listing.price)
            if (result.success) {
                toast.success('Successfully licensed!', {
                    description: `Transaction: ${result.transactionId?.substring(0, 10)}... Profit split 80/20 settled.`,
                })
            } else {
                toast.error(`Transaction failed: ${result.error}`)
            }
        } catch (err) {
            toast.error('Blockchain simulation error.')
        }
    }

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`relative group bg-[#111926]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-xl transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}
        >
            {/* Thumbnail Preview Area */}
            <div className="h-48 bg-gradient-to-br from-[#1b273a] to-[#0f172a] relative overflow-hidden flex items-center justify-center">
                {/* Simulated 3D Thumbnail (Box icon for now) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <Box className={`w-20 h-20 ${listing.is_premium ? 'text-amber-500 animate-pulse' : 'text-blue-500'} opacity-20`} />
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                        <Database className="w-3 h-3 text-blue-500" />
                        21-LM KINETIC
                    </div>
                </div>
                {listing.is_premium && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-black rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        PREMIUM
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center p-1 border border-white/10">
                            <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-tight">Verified Architect</span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2 leading-tight uppercase tracking-tight">
                        {listing.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6">
                        {listing.description || 'No description available for this cinematic fragment.'}
                    </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">License Price</div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black ${listing.is_premium ? 'text-amber-500' : 'text-white'}`}>
                                    {listing.price}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">NC</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">Royalties</div>
                             <div className="text-xs font-bold text-green-500">80/20 SPLIT</div>
                        </div>
                    </div>

                    <button
                        onClick={handleBuy}
                        className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all group ${
                            listing.is_premium 
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/10' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Buy License
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-600 font-mono">
                        <Shield className="w-3 h-3" />
                        SECURED BY POLYGON IMMUTABILITY
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
