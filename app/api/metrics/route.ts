import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const memoryUsage = process.memoryUsage()

    return NextResponse.json(
        {
            system: {
                memory_rss: memoryUsage.rss,
                memory_heap_total: memoryUsage.heapTotal,
                memory_heap_used: memoryUsage.heapUsed,
                cpu_usage: process.cpuUsage()
            },
            application: {
                active_requests: 0, // Placeholder for real metric
                error_rate: 0
            }
        },
        { status: 200 }
    )
}
