import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { email, name, role = 'user', metadata = {} } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role,
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
