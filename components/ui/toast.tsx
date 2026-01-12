'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            min-w-[300px] bg-[#1c242f] border rounded-lg shadow-xl p-4 flex items-center pr-10 relative overflow-hidden animate-in slide-in-from-right fade-in duration-300
                            ${toast.type === 'success' ? 'border-green-500/50' :
                                toast.type === 'error' ? 'border-red-500/50' : 'border-indigo-500/50'}
                        `}
                    >
                        {/* Status Icon */}
                        <div className={`
                            absolute left-0 top-0 bottom-0 w-1
                            ${toast.type === 'success' ? 'bg-green-500' :
                                toast.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}
                        `} />

                        <div className="mr-3">
                            {toast.type === 'success' && <Check className="w-5 h-5 text-green-500" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
                        </div>

                        <p className="text-sm font-medium text-white">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within ToastProvider')
    return context
}
