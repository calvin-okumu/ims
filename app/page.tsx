'use client'

import React, { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Dashboard from '../components/dashboard/Dashboard'

export default function ModernApp() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'register':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Registration</h1>
              <p className="text-muted-foreground">
                Register new users and manage their access credentials.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                Registration form will be implemented here
              </p>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">
                View and manage all registered users in the system.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                User management interface will be implemented here
              </p>
            </div>
          </div>
        )
      case 'access':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
              <p className="text-muted-foreground">
                Manage access levels and permissions for users and areas.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                Access control interface will be implemented here
              </p>
            </div>
          </div>
        )
      case 'monitoring':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
              <p className="text-muted-foreground">
                Monitor system health, performance metrics, and alerts.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                Monitoring dashboard will be implemented here
              </p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                View reports and analytics about system usage and performance.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                Analytics dashboard will be implemented here
              </p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Configure system settings and preferences.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <p className="text-center text-muted-foreground">
                Settings interface will be implemented here
              </p>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
    >
      {renderContent()}
    </DashboardLayout>
  )
}