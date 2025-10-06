'use client'

import React from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { config } from '@/lib/config'

interface PageLayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
  showFooter?: boolean
  showSidebar?: boolean
  showBreadcrumbs?: boolean
  sidebarCollapsed?: boolean
  className?: string
  containerClassName?: string
}

export function PageLayout({
  children,
  showNavbar = true,
  showFooter = true,
  showSidebar = false,
  showBreadcrumbs = false,
  sidebarCollapsed = false,
  className = '',
  containerClassName = '',
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Navigation Bar */}
      {showNavbar && <Navbar />}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar collapsed={sidebarCollapsed} />
        )}

        {/* Content */}
        <main className={`flex-1 ${showSidebar ? 'ml-0' : ''}`}>
          {/* Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="border-b bg-muted/30">
              <div className="container mx-auto px-4 py-3">
                <Breadcrumbs />
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className={`container mx-auto px-4 py-8 ${containerClassName}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}

// Predefined layout variants
export const LayoutVariants = {
  // Full layout with everything
  Full: (props: Omit<PageLayoutProps, 'showNavbar' | 'showFooter' | 'showSidebar' | 'showBreadcrumbs'>) => (
    <PageLayout
      showNavbar={true}
      showFooter={true}
      showSidebar={false}
      showBreadcrumbs={true}
      {...props}
    />
  ),

  // Dashboard layout with sidebar
  Dashboard: (props: Omit<PageLayoutProps, 'showNavbar' | 'showFooter' | 'showSidebar' | 'showBreadcrumbs'>) => (
    <PageLayout
      showNavbar={true}
      showFooter={false}
      showSidebar={true}
      showBreadcrumbs={true}
      {...props}
    />
  ),

  // Landing page layout
  Landing: (props: Omit<PageLayoutProps, 'showNavbar' | 'showFooter' | 'showSidebar' | 'showBreadcrumbs'>) => (
    <PageLayout
      showNavbar={true}
      showFooter={true}
      showSidebar={false}
      showBreadcrumbs={false}
      {...props}
    />
  ),

  // Minimal layout
  Minimal: (props: Omit<PageLayoutProps, 'showNavbar' | 'showFooter' | 'showSidebar' | 'showBreadcrumbs'>) => (
    <PageLayout
      showNavbar={false}
      showFooter={false}
      showSidebar={false}
      showBreadcrumbs={false}
      {...props}
    />
  ),

  // Auth layout
  Auth: (props: Omit<PageLayoutProps, 'showNavbar' | 'showFooter' | 'showSidebar' | 'showBreadcrumbs'>) => (
    <PageLayout
      showNavbar={false}
      showFooter={false}
      showSidebar={false}
      showBreadcrumbs={false}
      className="bg-muted/30"
      containerClassName="max-w-md mx-auto"
      {...props}
    />
  ),
}
