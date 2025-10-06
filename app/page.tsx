'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { config, isFeatureEnabled, isProviderEnabled } from '@/lib/config'
import { useAuth } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { LayoutVariants } from '@/components/layout/PageLayout'
import { useState } from 'react'

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const { user, isAuthenticated, isAuthEnabled } = useAuth()

  const handleAuthSuccess = () => {
    setShowAuth(false)
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  return (
    <LayoutVariants.Landing>
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to {config.app.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {config.app.description}
          </p>
        </div>

        {/* Authentication Section */}
        {isAuthEnabled && (
          <div className="space-y-4">
            {isAuthenticated ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Welcome back, {user?.name || user?.email}! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  onClick={() => setShowAuth(true)}
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                
                {showAuth && (
                  <div className="flex justify-center">
                    {authMode === 'login' ? (
                      <LoginForm 
                        onSuccess={handleAuthSuccess}
                        onSwitchToSignup={toggleAuthMode}
                      />
                    ) : (
                      <SignupForm 
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={toggleAuthMode}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>

        {/* Feature Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isFeatureEnabled('authentication') ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {isFeatureEnabled('authentication') ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isFeatureEnabled('database') ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {isFeatureEnabled('database') ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isFeatureEnabled('payments') ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {isFeatureEnabled('payments') ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Real-time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isFeatureEnabled('realtime') ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {isFeatureEnabled('realtime') ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🗄️</span>
                <span>Supabase</span>
                <div className={`w-2 h-2 rounded-full ${isProviderEnabled('supabase') ? 'bg-green-500' : 'bg-gray-300'}`} />
              </CardTitle>
              <CardDescription>
                {isProviderEnabled('supabase') 
                  ? 'PostgreSQL database with built-in auth, real-time subscriptions, and auto-generated APIs.'
                  : 'Supabase not configured. Database features will use local storage fallback.'
                }
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💳</span>
                <span>Stripe</span>
                <div className={`w-2 h-2 rounded-full ${isProviderEnabled('stripe') ? 'bg-green-500' : 'bg-gray-300'}`} />
              </CardTitle>
              <CardDescription>
                {isProviderEnabled('stripe')
                  ? 'Complete payment processing with checkout, subscriptions, and webhook handling.'
                  : 'Stripe not configured. Payment features will use mock provider.'
                }
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎨</span>
                <span>shadcn/ui</span>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </CardTitle>
              <CardDescription>
                50+ pre-built, accessible components with Tailwind CSS styling.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Configuration Info */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>App Name:</strong> {config.app.name}
            </div>
            <div>
              <strong>Theme:</strong> {config.ui.theme}
            </div>
            <div>
              <strong>Primary Color:</strong> {config.ui.primaryColor}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
          </div>
        </div>
      </div>
    </LayoutVariants.Landing>
  )
}
