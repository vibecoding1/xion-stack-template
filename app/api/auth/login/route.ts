import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isFeatureEnabled } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Check if authentication is enabled
    if (!isFeatureEnabled('authentication')) {
      return NextResponse.json(
        { error: 'Authentication is disabled' },
        { status: 400 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await auth.signIn(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set session cookie (implement based on your auth provider)
    const response = NextResponse.json({ user })
    
    // Example for Supabase
    if (isProviderEnabled('supabase')) {
      // Set Supabase session cookie
      response.cookies.set('sb-access-token', 'session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
