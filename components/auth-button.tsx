'use client'

import { supabase } from '@/lib/supabase'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, User as UserIcon, X, Mail, Lock, Eye, EyeOff, Brain } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AuthButtonProps {
    onAuthChange?: (user: User | null) => void
}

export function AuthButton({ onAuthChange }: AuthButtonProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null)
            onAuthChange?.(session?.user ?? null)
            setLoading(false)
        })

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
    const [showPassword, setShowPassword] = useState(false)

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

    const handlePasswordReset = async () => {
        if (!email) {
            showToast('Introduza o email primeiro', 'error')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://www.nexusmotion.pt/auth/reset-password'
        })
        if (error) {
            showToast(`Erro: ${error.message}`, 'error')
        } else {
            showToast('Email de redefinição enviado! Verifique a sua caixa de entrada.', 'success')
        }
        setLoading(false)
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
            setShowModal(false)
            setLoading(false)
            router.push('/dashboard/progress')
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        setLoading(false)
    }

    if (loading && !showModal) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)' }} />
                <div className="w-20 h-4 rounded" style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)' }} />
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: 'rgba(37, 99, 235, 0.3)' }}>
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full"
                        />
                    ) : (
                        <UserIcon className="w-5 h-5" style={{ color: '#38BDF8' }} />
                    )}
                    <span className="text-sm text-white font-medium max-w-[120px] truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30"
            >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div
                        className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10"
                        style={{ backgroundColor: '#111827' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full transition-colors"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-14 h-14 flex items-center justify-center border rounded-2xl"
                                style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(37, 99, 235, 0.3)' }}
                            >
                                <Brain className="w-7 h-7 text-blue-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-black text-white text-center mb-1">Bem-vindo de volta</h2>
                        <p className="text-gray-400 text-center text-sm mb-8">Entra para continuares a aprender</p>

                        {/* Google button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-800 rounded-2xl font-bold hover:bg-gray-100 transition-colors mb-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com Google
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-gray-500" style={{ backgroundColor: '#111827' }}>ou entra com email</span>
                            </div>
                        </div>

                        {/* Email form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none transition-all border"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Senha"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl text-white outline-none transition-all border"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'A entrar...' : 'Entrar'}
                            </button>
                        </form>

                        {/* Forgot password */}
                        <div className="mt-5 text-center">
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Esqueceu a senha?
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
