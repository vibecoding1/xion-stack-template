import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/orders - Get all orders
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
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = supabase
      .from('orders')
      .select(`
        *,
        users:user_id (id, name, email),
        products:product_id (id, name, price)
      `, { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    // Add user filter
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orders: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { user_id, product_id, quantity, stripe_payment_intent_id } = await request.json()

    if (!user_id || !product_id || !quantity) {
      return NextResponse.json(
        { error: 'User ID, product ID, and quantity are required' },
        { status: 400 }
      )
    }

    // Get product price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const total = product.price * quantity

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        product_id,
        quantity,
        total,
        status: 'pending',
        stripe_payment_intent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        users:user_id (id, name, email),
        products:product_id (id, name, price)
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order: data }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
