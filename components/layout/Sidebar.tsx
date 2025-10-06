'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingCart,
  Bell
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  className?: string
}

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: ShoppingCart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'New' },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: '3' },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ collapsed: initialCollapsed = false, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold">Dashboard</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed ? (
          <div className="text-xs text-muted-foreground">
            <p>Xion Stack v1.0.0</p>
            <p>Built with Next.js & shadcn/ui</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">X</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
