'use client'

import { supabase } from '@/lib/supabase'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AuthButtonProps {
    onAuthChange?: (user: User | null) => void
}

export function AuthButton({ onAuthChange }: AuthButtonProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null)
            onAuthChange?.(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null)
            onAuthChange?.(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [onAuthChange])

    const { showToast } = useToast()

    const [showModal, setShowModal] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) {
            console.error('Login error:', error)
            showToast(`Erro ao entrar: ${error.message}`, 'error')
            setLoading(false)
        }
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            showToast(`Erro: ${error.message}`, 'error')
            setLoading(false)
        } else {
            // Success handler usually handled by onAuthStateChange listener
            setShowModal(false)
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        setLoading(false)
    }

    if (loading && !showModal) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full animate-pulse">
                <div className="w-6 h-6 bg-gray-700 rounded-full" />
                <div className="w-20 h-4 bg-gray-700 rounded" />
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-full border border-indigo-500/30">
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full"
                        />
                    ) : (
                        <UserIcon className="w-5 h-5 text-indigo-400" />
                    )}
                    <span className="text-sm text-white font-medium max-w-[120px] truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    title="Sair"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-colors shadow-lg shadow-blue-500/20"
            >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="relative w-full max-w-sm bg-[#1c242f] border border-slate-700 rounded-2xl p-6 shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <UserIcon className="w-5 h-5 rotate-45" /> {/* Close Icon fallback with UserIcon rotated or similar if X not available? Let's assume X import was missing in snippet but Lucide likely has it. Actually X is not imported in original snippet. Need to add X import or use text. Wait, LogIn/LogOut/UserIcon are imported. I will add X to imports if I can or just use text 'x' */}
                            ✕
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 text-center">Login Nexus</h2>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-colors mb-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1c242f] text-slate-500">ou email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email (demo@meo.pt)"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Entrando...' : 'Entrar com Email'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
