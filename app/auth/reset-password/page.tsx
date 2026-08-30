'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0A0F1A' }}>
        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-2xl border text-center"
          style={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Senha redefinida!</h1>
          <p className="text-gray-400 text-sm">A redirecionar para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0A0F1A' }}>
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl border"
        style={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
      >
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
        <h1 className="text-2xl font-black text-white text-center mb-2">Redefinir Senha</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Introduza a sua nova senha abaixo.</p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl text-white outline-none transition-all border"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-white outline-none transition-all border"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl text-sm border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? 'A redefinir...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  )
}
