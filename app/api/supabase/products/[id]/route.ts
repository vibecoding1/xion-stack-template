import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/supabase/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const updates = await request.json()
    const { id, created_at, ...updateData } = updates

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/supabase/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
