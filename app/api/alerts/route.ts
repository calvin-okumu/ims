import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory alert storage (in production, use a database)
let alerts: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    let filteredAlerts = alerts

    if (type) {
      filteredAlerts = alerts.filter(alert => alert.type === type)
    }

    // Return most recent alerts
    const recentAlerts = filteredAlerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      alerts: recentAlerts,
      total: filteredAlerts.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, message, severity = 'info', source = 'system' } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      )
    }

    const alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      source,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    // Add alert to storage
    alerts.push(alert)

    // Keep only last 1000 alerts
    if (alerts.length > 1000) {
      alerts = alerts.slice(-1000)
    }

    // In production, you would send notifications here
    // - Email notifications
    // - Slack/Discord webhooks
    // - SMS alerts for critical issues
    // - PagerDuty/monitoring service alerts

    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`)

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// PUT endpoint to resolve alerts
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, resolved = true } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const alertIndex = alerts.findIndex(alert => alert.id === id)

    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    alerts[alertIndex].resolved = resolved
    alerts[alertIndex].resolvedAt = new Date().toISOString()

    return NextResponse.json(alerts[alertIndex])
  } catch (error) {
    console.error('Alert update error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}