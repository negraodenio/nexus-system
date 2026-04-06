import React from 'react'
import { Context, ContextCategory } from '@/lib/db-types'
import { BookOpen, Wrench, ShieldCheck, Gamepad2, Briefcase, LucideIcon, Info, Sparkles } from 'lucide-react'

// MVP Hardcoded Contexts (Simulating DB)
export const AVAILABLE_CONTEXTS: (Context & { usage_hint: string })[] = [
    {
        id: 'ctx-meo',
        name: 'MEO Expert',
        description: 'Técnico de Campo',
        category: 'utility',
        icon: 'Wrench', // Changing to Wrench or similar
        visual_mode: 'reality',
        system_prompt: 'You are an expert Field Technician for MEO (Altice Portugal). You specialize in FiberGateway GR241GE routers and GPON networks. Your goal is to diagnose problems instantly. If you see a router with a red light, IDENTIFY it as a LOS (Loss of Signal) error on a FiberGateway and suggest checking the patch cord curvature. Always be professional, technical, and use MEO terminology (ONT, RF Overlay, FiberGateway). Use Reality Overlay to highlight the "PON" or "LOS" LEDs.',
        usage_hint: 'Modo exclusivo para demonstração MEO. Especialista em FiberGateways.'
    },
    {
        id: 'ctx-prisma',
        name: 'Nexus Prisma',
        description: 'Automático (Decisor)',
        category: 'utility',
        icon: 'Sparkles',
        visual_mode: 'reality', // Prisma decides, but defaults to reality capabilities
        system_prompt: 'You are Nexus Prisma, the Decider Agent. Your goal is to ANALYZE the user input (image context + text intent) and AUTOMATICALLY switching to the best persona (Technician, Detective, Teacher, or Zen). Use the "detected_mode" field to state your decision.',
        usage_hint: 'Deixe o Nexus decidir! Ele analisa a imagem e escolhe o melhor modo automaticamente.'
    },
    {
        id: 'ctx-explainer',
        name: 'Professor',
        description: 'Simples e educativo',
        category: 'education',
        icon: 'BookOpen',
        visual_mode: 'mermaid',
        system_prompt: 'You are an expert teacher. Explain concepts clearly. Use Mermaid diagrams.',
        usage_hint: 'Use para aprender conceitos novos do zero com didática clara.'
    },
    {
        id: 'ctx-mechanic',
        name: 'Técnico',
        description: 'Análise estrutural',
        category: 'utility',
        icon: 'Wrench',
        visual_mode: 'reality',
        system_prompt: 'You are an expert technician. Identify structural parts, materials, and assembly details in the image. If you recognize a specific brand or model (like IKEA, Hermann Miller), identify it and provide assembly or maintenance steps in the "steps" JSON field (Hybrid Mode). Use Reality Overlay for parts.',
        usage_hint: 'Use para montar móveis, identificar peças ou consertar algo.'
    },
    {
        id: 'ctx-sherlock',
        name: 'Detetive',
        description: 'Anti-Fake News (Validador)',
        category: 'utility',
        icon: 'ShieldCheck',
        visual_mode: 'reality',
        system_prompt: 'You are a forensic detective and Fact Checker. Analyze the content (image or text) for authenticity, manipulation, logical fallacies, or "Fake News" indicators. If it is a news screenshot, use Reality Overlay to highlight suspicious elements (fake headlines, mismatched dates, manipulated photos). If it is text, verify the facts against your training data and rate the veracity.',
        usage_hint: 'Use para verificar se uma notícia é verdadeira ou validar fatos.'
    },
    {
        id: 'ctx-debugger',
        name: 'Auto-Debugger',
        description: 'Diagnóstico de Hardware',
        category: 'utility',
        icon: 'ShieldCheck',
        visual_mode: 'reality',
        system_prompt: 'You are the Nexus Auto-Debugger. Your specialized goal is to identify issues in the PHYSICAL ENVIRONMENT that affect AR/AI performance. Check for: 1. Poor lighting / Glare. 2. Blur or focus issues. 3. Hand occlusion. 4. Camera angle. Suggest physical movements or lighting adjustments.',
        usage_hint: 'Use para calibrar o ambiente, melhorar a luz ou corrigir o ângulo da câmera.'
    },
    {
        id: 'ctx-gamer',
        name: 'Gamer',
        description: 'Analogias de jogos',
        category: 'social',
        icon: 'Gamepad2',
        visual_mode: 'comparison',
        system_prompt: 'You are a hardcore gamer. Explain using video game analogies (HP, XP, Boss fights).',
        usage_hint: 'Use para entender conceitos complexos através de metáforas de jogos.'
    }
]

interface ContextSelectorProps {
    selectedId: string
    onSelect: (context: Context & { usage_hint: string }) => void
}

const IconMap: Record<string, LucideIcon> = {
    'BookOpen': BookOpen,
    'Wrench': Wrench,
    'ShieldCheck': ShieldCheck,
    'Gamepad2': Gamepad2,
    'Briefcase': Briefcase,
    'Sparkles': Sparkles
}

export default function ContextSelector({ selectedId, onSelect }: ContextSelectorProps) {
    return (
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-3 min-w-max px-1">
                {AVAILABLE_CONTEXTS.map((ctx) => {
                    const Icon = IconMap[ctx.icon] || BookOpen
                    const isSelected = selectedId === ctx.id

                    return (
                        <button
                            key={ctx.id}
                            onClick={() => onSelect(ctx)}
                            className={`
                                relative flex flex-col items-center justify-center p-4 rounded-2xl w-32 h-32 transition-all duration-300 border-2
                                ${isSelected
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className={`p-2 rounded-full mb-2 ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <span className="font-bold text-sm">{ctx.name}</span>
                            <span className={`text-[10px] mt-1 ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}>
                                {ctx.category.toUpperCase()}
                            </span>

                            {/* Hint / Usage Info */}
                            <div className="absolute top-2 left-2 text-gray-300 hover:text-indigo-500 transition-colors z-10" title={ctx.usage_hint}>
                                <Info className="w-4 h-4" />
                            </div>

                            {/* Visual Mode Badge */}
                            {ctx.visual_mode === 'reality' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Realidade Aumentada (AR)" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
