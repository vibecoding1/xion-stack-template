import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}

// Stripe webhook handler
export const handleStripeWebhook = async (req: Request) => {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Handle successful payment
        console.log('Payment succeeded:', paymentIntent.id)
        break
      
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        // Handle new subscription
        console.log('Subscription created:', subscription.id)
        break
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription update
        console.log('Subscription updated:', updatedSubscription.id)
        break
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription cancellation
        console.log('Subscription deleted:', deletedSubscription.id)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
