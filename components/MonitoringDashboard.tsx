'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive, Zap } from 'lucide-react'

interface HealthData {
  status: string
  timestamp: string
  uptime: number
  version: string
  environment: string
}

interface MetricsData {
  timestamp: string
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  cpu: {
    user: number
    system: number
  }
  version: string
  platform: string
  environment: string
}

interface AlertData {
  id: string
  type: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  source: string
  timestamp: string
  resolved: boolean
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, metricsRes, alertsRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/metrics'),
          fetch('/api/alerts?limit=10')
        ])

        if (healthRes.ok) {
          const healthData = await healthRes.json()
          setHealth(healthData)
        }

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          setMetrics(metricsData)
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          setAlerts(alertsData.alerts || [])
        }
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'error': return 'text-red-500 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold">System Health</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${health?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {health?.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">{health ? formatUptime(health.uptime) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">{health?.environment || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Memory Usage</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Heap Used:</span>
              <span className="font-medium">{metrics ? formatBytes(metrics.memory.heapUsed) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Heap Total:</span>
              <span className="font-medium">{metrics ? formatBytes(metrics.memory.heapTotal) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">RSS:</span>
              <span className="font-medium">{metrics ? formatBytes(metrics.memory.rss) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Performance</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">{metrics?.platform || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Node Version:</span>
              <span className="font-medium">{metrics?.version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">{metrics ? formatUptime(metrics.uptime) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold">Recent Alerts</h2>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>No active alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium uppercase text-sm">{alert.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'error' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Source: {alert.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <div className="ml-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Refresh Data
          </button>
          <button
            onClick={() => fetch('/api/alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'manual',
                message: 'Manual system check performed',
                severity: 'info',
                source: 'monitoring-dashboard'
              })
            })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Create Test Alert
          </button>
          <button
            onClick={() => window.open('/api/health', '_blank')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Activity className="w-5 h-5" />
            View Raw Metrics
          </button>
        </div>
      </div>
    </div>
  )
}