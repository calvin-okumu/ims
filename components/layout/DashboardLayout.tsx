'use client'

import React, { useState } from 'react'
import {
  UserPlus,
  Users,
  Shield,
  Activity,
  Menu,
  X,
  Home,
  Settings,
  BarChart3
} from 'lucide-react'
import { Button } from '../ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeView: string
  onViewChange: (view: string) => void
}

interface NavItemProps {
  icon: React.ComponentType<{ size?: number }>
  label: string
  active: boolean
  onClick: () => void
  badge?: number
}

function NavItem({ icon: Icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function DashboardLayout({
  children,
  activeView,
  onViewChange
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'register', label: 'Register User', icon: UserPlus },
    { id: 'users', label: 'Users', icon: Users, badge: 5 },
    { id: 'access', label: 'Access Levels', icon: Shield, badge: 2 },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Access Control
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Banking System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeView === item.id}
                onClick={() => {
                  onViewChange(item.id)
                  setSidebarOpen(false)
                }}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>System Status: <span className="text-green-500">Healthy</span></p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {navigation.find(nav => nav.id === activeView)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your banking access control system
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle would go here */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}