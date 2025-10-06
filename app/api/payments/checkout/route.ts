import { NextRequest, NextResponse } from 'next/server'
import { payments } from '@/lib/payments'
import { isFeatureEnabled } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Check if payments are enabled
    if (!isFeatureEnabled('payments')) {
      return NextResponse.json(
        { error: 'Payments are disabled' },
        { status: 400 }
      )
    }

    const { items, successUrl, cancelUrl } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success and cancel URLs are required' },
        { status: 400 }
      )
    }

    const checkoutSession = await payments.createCheckoutSession(
      items,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ checkoutSession })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
