import { NextResponse } from 'next/server'
import { generateEvents, generateMetrics } from '@/lib/synthetic-data'

export async function GET() {
    const events = generateEvents(200)
    const activeAlerts = events.filter(e => e.status === 'ACTIVE' && (e.severity === 'CRITICAL' || e.severity === 'HIGH'))
    const metrics = generateMetrics()

    return NextResponse.json({
        alerts: activeAlerts.slice(0, 20),
        metrics,
        generated_at: new Date().toISOString(),
    })
}
