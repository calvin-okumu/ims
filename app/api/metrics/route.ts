import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')

    // Basic performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    }

    // Specific metric request
    if (metric) {
      switch (metric) {
        case 'memory':
          return NextResponse.json({
            metric: 'memory',
            data: metrics.memory,
            timestamp: metrics.timestamp
          })
        case 'uptime':
          return NextResponse.json({
            metric: 'uptime',
            data: metrics.uptime,
            timestamp: metrics.timestamp
          })
        case 'cpu':
          return NextResponse.json({
            metric: 'cpu',
            data: metrics.cpu,
            timestamp: metrics.timestamp
          })
        default:
          return NextResponse.json({ error: 'Unknown metric' }, { status: 400 })
      }
    }

    // Return all metrics
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    )
  }
}