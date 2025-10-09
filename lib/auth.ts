/**
 * Configurable Authentication System
 * 
 * Supports multiple authentication providers:
 * - Supabase Auth (recommended)
 * - Custom JWT
 * - No authentication (disabled)
 */

import React from 'react'
import { config, isFeatureEnabled, isProviderEnabled } from './config'

// Types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  metadata?: Record<string, any>
}

export interface AuthProvider {
  signIn: (email: string, password: string) => Promise<User | null>
  signUp: (email: string, password: string, name?: string) => Promise<User | null>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<User | null>
}

// Supabase Auth Provider
class SupabaseAuthProvider implements AuthProvider {
  private supabase: any

  constructor() {
    if (isProviderEnabled('supabase')) {
      // Dynamic import to avoid errors when Supabase is not configured
      this.supabase = require('./supabase').supabase
    }
  }

  async signIn(email: string, password: string): Promise<User | null> {
    if (!this.supabase) return null
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return this.transformUser(data.user)
  }

  async signUp(email: string, password: string, name?: string): Promise<User | null> {
    if (!this.supabase) return null
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    
    if (error) throw error
    return this.transformUser(data.user)
  }

  async signOut(): Promise<void> {
    if (!this.supabase) return
    await this.supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.supabase) return null
    
    const { data: { user } } = await this.supabase.auth.getUser()
    return user ? this.transformUser(user) : null
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.supabase) return
    await this.supabase.auth.resetPasswordForEmail(email)
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    if (!this.supabase) return null
    
    const { data, error } = await this.supabase.auth.updateUser({
      data: updates
    })
    
    if (error) throw error
    return this.transformUser(data.user)
  }

  private transformUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      role: user.user_metadata?.role || 'user',
      metadata: user.user_metadata
    }
  }
}


// Mock Auth Provider (for development/testing)
class MockAuthProvider implements AuthProvider {
  private users: Map<string, User> = new Map()

  async signIn(email: string, password: string): Promise<User | null> {
    // Mock authentication - always succeeds
    const user: User = {
      id: 'mock-user-1',
      email,
      name: email.split('@')[0],
      role: 'user'
    }
    this.users.set(email, user)
    return user
  }

  async signUp(email: string, password: string, name?: string): Promise<User | null> {
    const user: User = {
      id: `mock-user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: 'user'
    }
    this.users.set(email, user)
    return user
  }

  async signOut(): Promise<void> {
    // Mock sign out
  }

  async getCurrentUser(): Promise<User | null> {
    // Return first user for mock
    return this.users.values().next().value || null
  }

  async resetPassword(email: string): Promise<void> {
    // Mock password reset
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    // Mock profile update
    return null
  }
}

// No Auth Provider (when authentication is disabled)
class NoAuthProvider implements AuthProvider {
  async signIn(): Promise<User | null> {
    throw new Error('Authentication is disabled')
  }

  async signUp(): Promise<User | null> {
    throw new Error('Authentication is disabled')
  }

  async signOut(): Promise<void> {
    // No-op
  }

  async getCurrentUser(): Promise<User | null> {
    return null
  }

  async resetPassword(): Promise<void> {
    throw new Error('Authentication is disabled')
  }

  async updateProfile(): Promise<User | null> {
    throw new Error('Authentication is disabled')
  }
}

// Factory function to get the appropriate auth provider
export const getAuthProvider = (): AuthProvider => {
  if (!isFeatureEnabled('authentication')) {
    return new NoAuthProvider()
  }

  if (isProviderEnabled('supabase')) {
    return new SupabaseAuthProvider()
  }

  // Fallback to mock provider for development
  if (process.env.NODE_ENV === 'development') {
    return new MockAuthProvider()
  }

  return new NoAuthProvider()
}

// Export the auth provider instance
export const auth = getAuthProvider()

// React hook for authentication
export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!isFeatureEnabled('authentication')) {
      setLoading(false)
      return
    }

    auth.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    const user = await auth.signIn(email, password)
    setUser(user)
    return user
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const user = await auth.signUp(email, password, name)
    setUser(user)
    return user
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    const user = await auth.updateProfile(updates)
    setUser(user)
    return user
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAuthEnabled: isFeatureEnabled('authentication')
  }
}
