'use client'

import React from 'react'
import { Users, Shield, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label: string
  }
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">
              +{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const activities = [
    {
      id: 1,
      action: 'User registered',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success'
    },
    {
      id: 2,
      action: 'Access level updated',
      user: 'VIP Lounge',
      time: '5 minutes ago',
      type: 'info'
    },
    {
      id: 3,
      action: 'Biometric scan completed',
      user: 'Jane Smith',
      time: '10 minutes ago',
      type: 'success'
    },
    {
      id: 4,
      action: 'System health check',
      user: 'Automated',
      time: '15 minutes ago',
      type: 'info'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system activities and user actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.action}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.user}
                </p>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SystemStatus() {
  const services = [
    { name: 'ZKTECO API', status: 'healthy', uptime: '99.9%' },
    { name: 'Database', status: 'healthy', uptime: '100%' },
    { name: 'Fingerprint Scanner', status: 'warning', uptime: '95.2%' },
    { name: 'Access Control', status: 'healthy', uptime: '99.8%' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of all system services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${
                  service.status === 'healthy' ? 'text-green-500' :
                  service.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  service.status === 'healthy' ? 'text-green-600' :
                  service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {service.status}
                </div>
                <div className="text-xs text-muted-foreground">
                  {service.uptime} uptime
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your access control system.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="1,234"
          description="Active registered users"
          icon={Users}
          trend={{ value: 12, label: 'from last month' }}
        />
        <StatCard
          title="Access Levels"
          value="8"
          description="Configured access levels"
          icon={Shield}
          trend={{ value: 2, label: 'new this week' }}
        />
        <StatCard
          title="Active Sessions"
          value="45"
          description="Currently active users"
          icon={Activity}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          description="Overall system uptime"
          icon={CheckCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <SystemStatus />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Users className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">Register User</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Shield className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Access</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Activity className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">System Health</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}