import React from 'react'
import { RealityOverlay, OverlayItem } from '@/lib/db-types'
import { ArrowRight, Info } from 'lucide-react'

interface RealityCanvasProps {
    image: string
    overlay: RealityOverlay
}

const OverlayElement = ({ item }: { item: OverlayItem }) => {
    const [x, y, w, h] = item.coordinates

    // Default styles
    const borderColor = item.color || '#ef4444' // Red-500 default
    const bgColor = item.color ? `${item.color}33` : '#ef444433' // 20% opacity

    const style: React.CSSProperties = {
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        borderColor: borderColor,
    }

    if (item.shape === 'arrow') {
        // For arrow, we interpret coords as start/end or simple point
        // Simplified: render icon at x,y
        return (
            <div
                className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
            >
                <div className="relative">
                    <ArrowRight className="w-8 h-8 text-red-600 font-bold drop-shadow-md animate-bounce" style={{ color: borderColor }} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.label}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="absolute border-2 rounded-lg transition-all duration-300 hover:bg-opacity-40 group cursor-help"
            style={{
                ...style,
                backgroundColor: bgColor,
                boxShadow: `0 0 10px ${borderColor}`
            }}
        >
            {/* Label Tag */}
            <div className="absolute -top-7 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <Info className="w-3 h-3" />
                {item.label}
            </div>

            {/* Label Always Visible (Mobile friendly) */}
            <div className={`absolute bottom-full left-0 mb-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-[${borderColor}] rounded shadow-sm md:hidden`}>
                {item.label}
            </div>
        </div>
    )
}

export default function RealityCanvas({ image, overlay }: RealityCanvasProps) {
    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 group">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Reality Layer
                    </span>
                </div>
            </div>

            {/* Image */}
            <img
                src={image}
                alt="Reality Analysis"
                className="w-full h-auto object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
            />

            {/* Overlay Layer */}
            <div className="absolute inset-0 z-0">
                {overlay?.items?.map((item, idx) => (
                    <OverlayElement key={idx} item={item} />
                ))}
            </div>

            {/* Grid Effect (Decoration) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQgMEgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />
        </div>
    )
}
