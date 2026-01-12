'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
})

interface MermaidRendererProps {
    code: string
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                setError(false)
                if (ref.current && code) {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
                    const { svg } = await mermaid.render(id, code)
                    setSvg(svg)
                }
            } catch (err) {
                console.error('Mermaid render error:', err)
                setError(true)
            }
        }

        renderDiagram()
    }, [code])

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                Falha ao renderizar diagrama. Código inválido ou complexo demais.
                <pre className="mt-2 text-xs overflow-auto">{code}</pre>
            </div>
        )
    }

    return (
        <div
            ref={ref}
            className="w-full overflow-x-auto flex justify-center p-4 bg-white rounded-lg border border-gray-100"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
