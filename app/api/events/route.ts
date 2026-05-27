import { NextResponse } from 'next/server'
import { generateEvents } from '@/lib/synthetic-data'
import type { EventSeverity } from '@/lib/synthetic-data'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') as EventSeverity | null
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    let events = generateEvents(200)

    if (severity) {
        events = events.filter(e => e.severity === severity)
    }
    if (type) {
        events = events.filter(e => e.type === type)
    }
    if (status) {
        events = events.filter(e => e.status === status)
    }

    return NextResponse.json({
        events: events.slice(0, limit),
        total: events.length,
        generated_at: new Date().toISOString(),
    })
}
