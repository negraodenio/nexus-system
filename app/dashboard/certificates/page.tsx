'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CertificateCard } from '@/components/certificate-card'
import { Shield, Award, Search, Filter, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function CertificatesPage() {
    const [attestations, setAttestations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const fetchAttestations = async () => {
            const { data, error } = await (supabase.from('skill_attestations').select(`
                *,
                skills (
                    title
                )
            `).order('created_at', { ascending: false }) as any)

            if (data) {
                const formatted = (data as any[]).map(a => ({
                    ...a,
                    skillTitle: a.skills?.title || 'Unknown Skill',
                    timestamp: new Date(a.created_at).getTime(),
                    transactionHash: a.transaction_hash,
                    ipfsHash: a.ipfs_hash
                }))
                setAttestations(formatted)
            }
            setIsLoading(false)
        }

        fetchAttestations()
    }, [])

    return (
        <div className="min-h-screen bg-[#050a12] p-8 md:p-12 lg:p-16">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                <Award className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Vault of Excellence</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                            Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Competence</span>
                        </h1>
                        <p className="mt-4 text-slate-500 text-lg max-w-2xl font-medium">
                            Your immutable record of physical mastery. Every motion pattern verified on-chain to ensure authentic surgical and technical authority.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                            {['all', 'expert', 'proficient'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === f ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Querying Physical Ledger...</p>
                    </div>
                ) : attestations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <Sparkles className="w-16 h-16 text-slate-800 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">No Certifications Yet</h3>
                        <p className="text-slate-500 max-w-md text-center text-sm mb-8">
                            Reach an alignment score of <span className="text-blue-500 font-bold">95%+</span> in practice mode to automatically mint your first Proof of Competence.
                        </p>
                        <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">
                            Start Mastering
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {attestations
                            .filter(a => filter === 'all' || (filter === 'expert' && a.score >= 90) || (filter === 'proficient' && a.score >= 75))
                            .map((attestation) => (
                                <CertificateCard key={attestation.id} attestation={attestation} />
                            ))}
                    </div>
                )}
            </div>

            {/* Decorative Grid */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        </div>
    )
}
