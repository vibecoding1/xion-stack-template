import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/realtime - Get real-time connection info
export async function GET(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const event = searchParams.get('event') || 'INSERT,UPDATE,DELETE'

    if (!table) {
      return NextResponse.json(
        { error: 'Table parameter is required' },
        { status: 400 }
      )
    }

    // Return real-time configuration
    return NextResponse.json({
      realtime: {
        enabled: true,
        table,
        events: event.split(','),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  } catch (error) {
    console.error('Realtime API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/realtime - Create real-time subscription
export async function POST(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { table, event = 'INSERT,UPDATE,DELETE', filter } = await request.json()

    if (!table) {
      return NextResponse.json(
        { error: 'Table is required' },
        { status: 400 }
      )
    }

    // This endpoint provides configuration for client-side real-time subscriptions
    // The actual subscription happens on the client side using Supabase client
    
    return NextResponse.json({
      subscription: {
        table,
        events: event.split(','),
        filter,
        config: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
