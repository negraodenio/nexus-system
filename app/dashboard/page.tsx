'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart3, Users, Eye, TrendingUp, Loader2, Plus, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { MintModal } from '@/components/marketplace/mint-modal'

interface OverviewStats {
    totalSkills: number
    totalViews: number
    totalUsers: number
}

interface TrendingSkill {
    skill_id: string
    title: string
    view_count: number
}

interface MySkill {
    id: string
    title: string
    created_at: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<OverviewStats | null>(null)
    const [trending, setTrending] = useState<TrendingSkill[]>([])
    const [mySkills, setMySkills] = useState<MySkill[]>([])
    const [loading, setLoading] = useState(true)
    const [mintSkill, setMintSkill] = useState<MySkill | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, trendingRes, mySkillsRes] = await Promise.all([
                    fetch('/api/analytics?type=overview'),
                    fetch('/api/analytics?type=trending'),
                    fetch('/api/analytics?type=my-skills')
                ])

                const statsData = await statsRes.json()
                const trendingData = await trendingRes.json()
                const mySkillsData = await mySkillsRes.json()

                setStats(statsData)
                setTrending(trendingData.trending || [])
                setMySkills(mySkillsData.skills || [])
            } catch (error) {
                console.error('Dashboard fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#101822] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#101822] text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Nexus
                    </Link>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-500" />
                        <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#1c242f] rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Skills</p>
                                <p className="text-3xl font-bold">{stats?.totalSkills || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1c242f] rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <Eye className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Views</p>
                                <p className="text-3xl font-bold">{stats?.totalViews || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1c242f] rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Users</p>
                                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* My Created Skills */}
                    <div className="bg-[#1c242f] rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold">My Created Skills</h2>
                            </div>
                            <Link href="/skills" className="text-xs text-indigo-400 hover:text-indigo-300">
                                Create New
                            </Link>
                        </div>

                        {mySkills.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">
                                You haven&apos;t created any skills yet.
                                <br />
                                <Link href="/skills" className="text-indigo-400 hover:underline mt-2 inline-block">Record one now!</Link>
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {mySkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="flex items-center justify-between p-4 bg-[#151c26] rounded-lg group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-500">
                                                ID
                                            </div>
                                            <div>
                                                <p className="font-medium group-hover:text-indigo-400 transition-colors">{skill.title || "Untitled Skill"}</p>
                                                <p className="text-sm text-slate-400">{new Date(skill.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setMintSkill(skill)}
                                            className="px-3 py-1.5 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded border border-green-600/20 transition-all text-xs font-bold flex items-center gap-1"
                                        >
                                            <DollarSign className="w-3 h-3" /> Mint
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trending Skills */}
                    <div className="bg-[#1c242f] rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold">Trending Skills (Last 7 Days)</h2>
                        </div>

                        {trending.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No data yet. Start viewing skills to see trends!</p>
                        ) : (
                            <div className="space-y-3">
                                {trending.map((skill, index) => (
                                    <div
                                        key={skill.skill_id}
                                        className="flex items-center justify-between p-4 bg-[#151c26] rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-slate-500">#{index + 1}</span>
                                            <div>
                                                <p className="font-medium">{skill.title}</p>
                                                <p className="text-sm text-slate-400">{skill.skill_id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Eye className="w-4 h-4" />
                                            <span className="font-bold">{skill.view_count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mint Modal */}
            {mintSkill && (
                <MintModal
                    skillId={mintSkill.id}
                    defaultTitle={mintSkill.title || "My Amazing Skill"}
                    onClose={() => setMintSkill(null)}
                />
            )}
        </div>
    )
}
