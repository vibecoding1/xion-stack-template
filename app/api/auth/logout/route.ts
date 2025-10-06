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

    await auth.signOut()

    // Clear session cookie
    const response = NextResponse.json({ success: true })
    
    // Clear Supabase session cookie
    if (isProviderEnabled('supabase')) {
      response.cookies.set('sb-access-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
      })
    }

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
