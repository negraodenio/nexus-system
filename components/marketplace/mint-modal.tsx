'use client'

import React, { useState } from 'react'
import { Store, X, Check, Loader2, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MintModalProps {
    skillId: string
    defaultTitle: string
    onClose: () => void
}

export function MintModal({ skillId, defaultTitle, onClose }: MintModalProps) {
    const router = useRouter()
    const [price, setPrice] = useState('0.00')
    const [title, setTitle] = useState(defaultTitle)
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleMint = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/marketplace/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill_id: skillId,
                    price,
                    title,
                    description
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to mint skill')
            }

            setSuccess(true)
            setTimeout(() => {
                onClose()
                router.push('/marketplace') // Redirect to marketplace to see it
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-green-500/50 p-8 rounded-2xl flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Minted Successfully!</h2>
                    <p className="text-slate-400">Your skill is now live on the marketplace.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Store className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Mint Skill</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Create Digital Asset</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Listing Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Price (BRL)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Platform fee: 0% (Beta)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                            placeholder="Describe what valuable knowledge this skill provides..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMint}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Minting...' : 'Mint to Marketplace'}
                    </button>
                </div>
            </div>
        </div>
    )
}
