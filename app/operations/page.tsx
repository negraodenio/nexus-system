'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Brain, ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Shield, Radio, Activity, AlertTriangle, Clock, Cpu, CheckCircle2, ChevronDown } from 'lucide-react'
import { generateEvents, generateSensors, generateMetrics, countBySeverity, SEVERITY_CONFIG } from '@/lib/synthetic-data'
import type { OperationalEvent, EventSeverity, SystemMetrics } from '@/lib/synthetic-data'

// Dynamic import for Leaflet (SSR-incompatible)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

// Leaflet CSS must be imported client-side
const LeafletCSS = () => {
    useEffect(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        return () => { document.head.removeChild(link) }
    }, [])
    return null
}

// ── Severity Badge ──
function SeverityBadge({ severity, count }: { severity: EventSeverity; count: number }) {
    const config = SEVERITY_CONFIG[severity]
    return (
        <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
            <div className="relative">
                <div className="w-2 h-2 rounded-full" style={{ background: config.color }} />
                {config.pulse && <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: config.color, opacity: 0.5 }} />}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: config.color }} className="uppercase tracking-widest font-bold">{count} {config.label}</span>
        </div>
    )
}

// ── Event Row ──
function EventRow({ event, onAcknowledge }: { event: OperationalEvent; onAcknowledge: (id: string) => void }) {
    const config = SEVERITY_CONFIG[event.severity]
    const time = new Date(event.timestamp)
    const minutesAgo = Math.floor((Date.now() - time.getTime()) / 60000)
    const timeLabel = minutesAgo < 1 ? 'just now' : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`

    return (
        <div className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors group" style={{ borderLeft: `3px solid ${config.color}` }}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: config.color }} className="uppercase tracking-widest font-bold">{event.severity}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{timeLabel}</span>
                    </div>
                    <p className="text-sm text-white/90 font-medium truncate">{event.title}</p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} className="text-white/30 mt-0.5">{event.zone} · {event.sensor_id}</p>
                </div>
                {event.status === 'ACTIVE' && (
                    <button onClick={() => onAcknowledge(event.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 text-white/40 hover:text-white"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        ACK
                    </button>
                )}
                {event.status === 'ACKNOWLEDGED' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/50 flex-shrink-0 mt-1" />
                )}
            </div>
            {event.ai_insight && (
                <div className="mt-2 px-3 py-2 text-[11px] text-emerald-400/80 leading-relaxed" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className="text-emerald-500 font-bold">AI:</span> {event.ai_insight}
                </div>
            )}
            {event.attestation_hash && (
                <div className="mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-600/40" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-emerald-600/40">{event.attestation_hash}</span>
                </div>
            )}
        </div>
    )
}

// ── Metric Card ──
function MetricCard({ icon: Icon, value, label, accent }: { icon: any; value: string | number; label: string; accent?: boolean }) {
    return (
        <div className="p-4 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: accent ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="uppercase tracking-widest text-white/30">{label}</span>
            </div>
            <div className="text-2xl font-black" style={{ color: accent ? '#10b981' : '#fff' }}>{value}</div>
        </div>
    )
}

// ── Main Mission Control ──
export default function MissionControlPage() {
    const [events, setEvents] = useState<OperationalEvent[]>([])
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [selectedSeverity, setSelectedSeverity] = useState<EventSeverity | 'ALL'>('ALL')
    const [showInsightsPanel, setShowInsightsPanel] = useState(true)
    const [tick, setTick] = useState(0)

    // Initialize data
    useEffect(() => {
        setEvents(generateEvents(200))
        setMetrics(generateMetrics())
    }, [])

    // Simulate real-time updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(generateMetrics())
            setTick(t => t + 1)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Add a new event occasionally
    useEffect(() => {
        if (tick > 0 && tick % 3 === 0) {
            const newEvents = generateEvents(5)
            setEvents(prev => [...newEvents.slice(0, 1), ...prev].slice(0, 200))
        }
    }, [tick])

    const sensors = useMemo(() => generateSensors(50), [])

    const filteredEvents = useMemo(() => {
        if (selectedSeverity === 'ALL') return events
        return events.filter(e => e.severity === selectedSeverity)
    }, [events, selectedSeverity])

    const severityCounts = useMemo(() => countBySeverity(events), [events])

    const handleAcknowledge = (eventId: string) => {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'ACKNOWLEDGED' as const } : e))
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const latestInsights = useMemo(() =>
        events.filter(e => e.ai_insight).slice(0, 5)
        , [events])

    if (!metrics) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} className="text-emerald-500 uppercase tracking-widest">Initializing Mission Control...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white" style={{
            background: '#0A0A0F',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
            backgroundSize: '30px 30px',
        }}>
            <LeafletCSS />

            {/* ── TOP BAR ── */}
            <header className="h-12 border-b border-white/5 flex items-center justify-between px-4" style={{ background: 'rgba(10,10,15,0.95)' }}>
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-emerald-500" />
                        <span className="font-black text-sm tracking-tighter">NEXUS</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#10b981' }} className="uppercase tracking-widest font-bold px-2 py-0.5 border border-emerald-500/20">MISSION CONTROL</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-4">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-emerald-500/60 uppercase tracking-widest">LIVE · LISBOA METROPOLITAN AREA</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-white/20 uppercase tracking-widest">{new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* ── SEVERITY BAR ── */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-3 overflow-x-auto" style={{ background: 'rgba(10,10,15,0.9)' }}>
                <button onClick={() => setSelectedSeverity('ALL')}
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
                    style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        background: selectedSeverity === 'ALL' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: selectedSeverity === 'ALL' ? '#fff' : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${selectedSeverity === 'ALL' ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
                    }}>
                    ALL ({events.filter(e => e.status === 'ACTIVE').length})
                </button>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as EventSeverity[]).map(sev => (
                    <button key={sev} onClick={() => setSelectedSeverity(sev)}>
                        <SeverityBadge severity={sev} count={severityCounts[sev]} />
                    </button>
                ))}
                <div className="flex-1" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-white/15 uppercase tracking-widest">
                    {events.filter(e => e.attestation_hash).length} attested · {events.filter(e => e.ai_insight).length} AI insights
                </span>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex" style={{ height: 'calc(100vh - 82px)' }}>

                {/* ── MAP AREA ── */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={[38.7223, -9.1393]}
                        zoom={12}
                        className="w-full h-full"
                        zoomControl={false}
                        attributionControl={false}
                        style={{ background: '#0A0A0F' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {/* Sensor nodes */}
                        {sensors.map(sensor => (
                            <CircleMarker
                                key={sensor.id}
                                center={[sensor.lat, sensor.lng]}
                                radius={3}
                                pathOptions={{
                                    color: sensor.status === 'online' ? '#10b981' : sensor.status === 'degraded' ? '#eab308' : '#ef4444',
                                    fillColor: sensor.status === 'online' ? '#10b981' : sensor.status === 'degraded' ? '#eab308' : '#ef4444',
                                    fillOpacity: 0.4,
                                    weight: 1,
                                }}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#0A0A0F', minWidth: 160 }}>
                                        <div className="font-bold">{sensor.id}</div>
                                        <div className="text-xs mt-1">{sensor.type} · {sensor.zone}</div>
                                        <div className="text-xs mt-1">Status: {sensor.status}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                        {/* Active events */}
                        {events.filter(e => e.status === 'ACTIVE').slice(0, 50).map(event => (
                            <CircleMarker
                                key={event.id}
                                center={[event.lat, event.lng]}
                                radius={event.severity === 'CRITICAL' ? 10 : event.severity === 'HIGH' ? 7 : 5}
                                pathOptions={{
                                    color: SEVERITY_CONFIG[event.severity].color,
                                    fillColor: SEVERITY_CONFIG[event.severity].color,
                                    fillOpacity: 0.6,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#0A0A0F', minWidth: 200 }}>
                                        <div className="font-bold">{event.title}</div>
                                        <div className="text-xs mt-1">{event.zone}</div>
                                        <div className="text-xs mt-1 font-bold" style={{ color: SEVERITY_CONFIG[event.severity].color }}>{event.severity}</div>
                                        {event.ai_insight && <div className="text-xs mt-2 italic text-emerald-700">AI: {event.ai_insight}</div>}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>

                    {/* ── METRICS OVERLAY (bottom-left) ── */}
                    <div className="absolute bottom-4 left-4 z-[1000] grid grid-cols-2 gap-1" style={{ width: 320 }}>
                        <MetricCard icon={Radio} value={`${metrics.sensors_active}/${metrics.sensors_total}`} label="Sensors" accent />
                        <MetricCard icon={AlertTriangle} value={metrics.open_alerts} label="Open Alerts" />
                        <MetricCard icon={Activity} value={`${metrics.events_per_hour}`} label="Events/Hour" />
                        <MetricCard icon={Cpu} value={`${metrics.system_health}%`} label="System Health" accent />
                        <MetricCard icon={Clock} value={`${metrics.ai_latency_ms}ms`} label="AI Latency" />
                        <MetricCard icon={Shield} value={metrics.attestations_today} label="Attestations" accent />
                    </div>

                    {/* ── AI INSIGHTS PANEL (bottom-right) ── */}
                    {showInsightsPanel && (
                        <div className="absolute bottom-4 right-[370px] z-[1000] w-[380px] border border-emerald-500/20" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
                            <div className="px-4 py-2.5 border-b border-emerald-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} className="text-emerald-500 uppercase tracking-widest font-bold">AI Insights Engine</span>
                                </div>
                                <button onClick={() => setShowInsightsPanel(false)} className="text-white/20 hover:text-white transition-colors">
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="max-h-[240px] overflow-y-auto">
                                {latestInsights.map((event, i) => (
                                    <div key={i} className="px-4 py-3 border-b border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SEVERITY_CONFIG[event.severity].color }} className="uppercase tracking-widest font-bold">{event.severity}</span>
                                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-white/20">{event.zone}</span>
                                        </div>
                                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} className="text-emerald-400/80 leading-relaxed">{event.ai_insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── EVENT TIMELINE SIDEBAR ── */}
                <div className="w-[360px] border-l border-white/5 flex flex-col" style={{ background: 'rgba(10,10,15,0.95)' }}>
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white/30" />
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} className="text-white/50 uppercase tracking-widest font-bold">Event Timeline</span>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }} className="text-white/20">{filteredEvents.length} events</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredEvents.slice(0, 50).map(event => (
                            <EventRow key={event.id} event={event} onAcknowledge={handleAcknowledge} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
