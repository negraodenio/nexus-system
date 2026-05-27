// ============================================================
// NEXUS SYSTEM — Synthetic Operational Data Engine
// Generates realistic Smart City events for Lisboa, Portugal
// ============================================================

export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
export type EventStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'

export interface OperationalEvent {
    id: string
    type: string
    title: string
    description: string
    severity: EventSeverity
    status: EventStatus
    lat: number
    lng: number
    zone: string
    timestamp: string
    sensor_id: string
    ai_insight?: string
    attestation_hash?: string
}

export interface SystemMetrics {
    sensors_active: number
    sensors_total: number
    open_alerts: number
    events_per_hour: number
    system_health: number
    ai_latency_ms: number
    attestations_today: number
    uptime_hours: number
}

export interface SensorNode {
    id: string
    type: string
    lat: number
    lng: number
    zone: string
    status: 'online' | 'offline' | 'degraded'
    last_reading: string
}

// ── Lisboa Zones & Coordinates ──
const LISBOA_ZONES = [
    { name: 'Baixa-Chiado', lat: 38.7103, lng: -9.1365 },
    { name: 'Parque das Nações', lat: 38.7633, lng: -9.0950 },
    { name: 'Campo Grande', lat: 38.7580, lng: -9.1575 },
    { name: 'Belém', lat: 38.6966, lng: -9.2063 },
    { name: 'Alfama', lat: 38.7118, lng: -9.1300 },
    { name: 'Avenida da Liberdade', lat: 38.7200, lng: -9.1460 },
    { name: 'Marquês de Pombal', lat: 38.7253, lng: -9.1498 },
    { name: 'Saldanha', lat: 38.7340, lng: -9.1460 },
    { name: 'Areeiro', lat: 38.7400, lng: -9.1350 },
    { name: 'Benfica', lat: 38.7530, lng: -9.2000 },
    { name: 'Lumiar', lat: 38.7720, lng: -9.1680 },
    { name: 'Olivais', lat: 38.7710, lng: -9.1100 },
    { name: 'Alcântara', lat: 38.7050, lng: -9.1780 },
    { name: 'Marvila', lat: 38.7450, lng: -9.1050 },
    { name: 'Campolide', lat: 38.7300, lng: -9.1630 },
    { name: 'Graça', lat: 38.7170, lng: -9.1310 },
    { name: 'Santos', lat: 38.7060, lng: -9.1550 },
    { name: 'Expo', lat: 38.7685, lng: -9.0935 },
    { name: 'Telheiras', lat: 38.7620, lng: -9.1700 },
    { name: 'Ajuda', lat: 38.7080, lng: -9.1930 },
] as const

const EVENT_TYPES = [
    { type: 'traffic_anomaly', label: 'Traffic Anomaly', icon: '🚗', defaultSeverity: 'HIGH' as EventSeverity },
    { type: 'sensor_offline', label: 'Sensor Offline', icon: '📡', defaultSeverity: 'MEDIUM' as EventSeverity },
    { type: 'air_quality', label: 'Air Quality Alert', icon: '🌫️', defaultSeverity: 'HIGH' as EventSeverity },
    { type: 'power_outage', label: 'Power Grid Anomaly', icon: '⚡', defaultSeverity: 'CRITICAL' as EventSeverity },
    { type: 'crowd_density', label: 'Crowd Density Alert', icon: '👥', defaultSeverity: 'MEDIUM' as EventSeverity },
    { type: 'network_latency', label: 'Network Latency Spike', icon: '🌐', defaultSeverity: 'HIGH' as EventSeverity },
    { type: 'water_pressure', label: 'Water Pressure Drop', icon: '💧', defaultSeverity: 'MEDIUM' as EventSeverity },
    { type: 'noise_violation', label: 'Noise Level Exceeded', icon: '🔊', defaultSeverity: 'LOW' as EventSeverity },
    { type: 'waste_overflow', label: 'Waste Container Full', icon: '🗑️', defaultSeverity: 'LOW' as EventSeverity },
    { type: 'structural_alert', label: 'Structural Vibration', icon: '🏗️', defaultSeverity: 'CRITICAL' as EventSeverity },
    { type: 'fire_detection', label: 'Fire Risk Detected', icon: '🔥', defaultSeverity: 'CRITICAL' as EventSeverity },
    { type: 'flood_warning', label: 'Flood Risk Warning', icon: '🌊', defaultSeverity: 'HIGH' as EventSeverity },
]

const AI_INSIGHTS = [
    'Pattern matches prior incident #{id} from {days} days ago. Recommend preventive dispatch.',
    'Anomaly detected: {metric} readings {pct}% above 2σ band for {mins} minutes. Auto-escalating.',
    'Correlated with {n} similar events in {zone} over last 72h. Cluster forming.',
    'Historical data suggests peak at {time}. Pre-positioning resources recommended.',
    'Sensor cross-validation: {n} adjacent nodes confirm reading. Confidence: {conf}%.',
    'AI prediction: {pct}% probability of escalation within next 2 hours based on temporal patterns.',
    'Event signature matches known failure mode FM-{id}. Maintenance team alerted.',
    'No prior pattern found. Flagging as novel anomaly for model retraining.',
]

// ── Deterministic seeded random for consistent demo data ──
function seededRandom(seed: number): () => number {
    let s = seed
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    }
}

function generateId(prefix: string, index: number): string {
    return `${prefix}-${String(index).padStart(4, '0')}`
}

// ── Sensor Node Generator ──
export function generateSensors(count: number = 50): SensorNode[] {
    const rng = seededRandom(42)
    const sensors: SensorNode[] = []
    const types = ['traffic_cam', 'air_quality', 'noise_meter', 'water_sensor', 'power_monitor', 'crowd_counter', 'weather_station', 'structural_sensor']

    for (let i = 0; i < count; i++) {
        const zone = LISBOA_ZONES[Math.floor(rng() * LISBOA_ZONES.length)]
        const jitterLat = (rng() - 0.5) * 0.008
        const jitterLng = (rng() - 0.5) * 0.008
        const statusRoll = rng()

        sensors.push({
            id: generateId('SNS', i),
            type: types[Math.floor(rng() * types.length)],
            lat: zone.lat + jitterLat,
            lng: zone.lng + jitterLng,
            zone: zone.name,
            status: statusRoll > 0.92 ? 'offline' : statusRoll > 0.85 ? 'degraded' : 'online',
            last_reading: new Date(Date.now() - Math.floor(rng() * 300000)).toISOString(),
        })
    }
    return sensors
}

// ── Event Generator ──
export function generateEvents(count: number = 200): OperationalEvent[] {
    const rng = seededRandom(1337)
    const events: OperationalEvent[] = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
        const zone = LISBOA_ZONES[Math.floor(rng() * LISBOA_ZONES.length)]
        const eventType = EVENT_TYPES[Math.floor(rng() * EVENT_TYPES.length)]
        const jitterLat = (rng() - 0.5) * 0.006
        const jitterLng = (rng() - 0.5) * 0.006

        // Vary severity from default
        const severities: EventSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
        const sevIndex = severities.indexOf(eventType.defaultSeverity)
        const sevShift = Math.floor(rng() * 3) - 1
        const finalSeverity = severities[Math.max(0, Math.min(4, sevIndex + sevShift))]

        // Status distribution: 60% active, 25% acknowledged, 15% resolved
        const statusRoll = rng()
        const status: EventStatus = statusRoll > 0.4 ? 'ACTIVE' : statusRoll > 0.15 ? 'ACKNOWLEDGED' : 'RESOLVED'

        // Timestamp: spread over last 24 hours, more recent = more dense
        const hoursAgo = Math.pow(rng(), 2) * 24
        const timestamp = new Date(now - hoursAgo * 3600000)

        // AI insight for ~40% of events
        const hasInsight = rng() > 0.6
        let aiInsight: string | undefined
        if (hasInsight) {
            const template = AI_INSIGHTS[Math.floor(rng() * AI_INSIGHTS.length)]
            aiInsight = template
                .replace('{id}', String(Math.floor(rng() * 9000) + 1000))
                .replace('{days}', String(Math.floor(rng() * 30) + 1))
                .replace('{metric}', eventType.label)
                .replace('{pct}', String(Math.floor(rng() * 40) + 15))
                .replace('{mins}', String(Math.floor(rng() * 60) + 5))
                .replace('{n}', String(Math.floor(rng() * 8) + 2))
                .replace('{zone}', zone.name)
                .replace('{time}', `${Math.floor(rng() * 12) + 12}:${String(Math.floor(rng() * 60)).padStart(2, '0')}`)
                .replace('{conf}', String(Math.floor(rng() * 15) + 85))
        }

        // Attestation hash for resolved events
        const hasAttestation = status === 'RESOLVED' && rng() > 0.3
        const attestationHash = hasAttestation
            ? `0x${Array.from({ length: 16 }, () => Math.floor(rng() * 16).toString(16)).join('')}`
            : undefined

        events.push({
            id: generateId('EVT', i),
            type: eventType.type,
            title: `${eventType.icon} ${eventType.label}`,
            description: `${eventType.label} detected in ${zone.name}. Sensor ${generateId('SNS', Math.floor(rng() * 50))} reporting anomalous readings.`,
            severity: finalSeverity,
            status,
            lat: zone.lat + jitterLat,
            lng: zone.lng + jitterLng,
            zone: zone.name,
            timestamp: timestamp.toISOString(),
            sensor_id: generateId('SNS', Math.floor(rng() * 50)),
            ai_insight: aiInsight,
            attestation_hash: attestationHash,
        })
    }

    // Sort by timestamp descending (most recent first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return events
}

// ── System Metrics Generator ──
export function generateMetrics(): SystemMetrics {
    const hour = new Date().getHours()
    // Simulate higher activity during business hours
    const activityMultiplier = hour >= 8 && hour <= 20 ? 1.0 : 0.6

    return {
        sensors_active: Math.floor(247 * (0.92 + Math.random() * 0.08)),
        sensors_total: 264,
        open_alerts: Math.floor((8 + Math.random() * 12) * activityMultiplier),
        events_per_hour: Math.floor((1200 + Math.random() * 800) * activityMultiplier),
        system_health: parseFloat((99.0 + Math.random() * 0.9).toFixed(1)),
        ai_latency_ms: Math.floor(800 + Math.random() * 1400),
        attestations_today: Math.floor(280 + Math.random() * 120),
        uptime_hours: Math.floor(720 + Math.random() * 48),
    }
}

// ── Severity Helpers ──
export const SEVERITY_CONFIG = {
    CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', pulse: true, label: 'Critical' },
    HIGH: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', pulse: false, label: 'High' },
    MEDIUM: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', pulse: false, label: 'Medium' },
    LOW: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', pulse: false, label: 'Low' },
    INFO: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.15)', pulse: false, label: 'Info' },
} as const

export function countBySeverity(events: OperationalEvent[]): Record<EventSeverity, number> {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
    for (const e of events) {
        if (e.status === 'ACTIVE') counts[e.severity]++
    }
    return counts
}
