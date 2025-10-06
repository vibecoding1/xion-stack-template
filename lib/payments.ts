/**
 * Configurable Payments System
 * 
 * Supports multiple payment providers:
 * - Stripe (recommended)
 * - Mock payments (for development)
 * - No payments (disabled)
 */

import { config, isFeatureEnabled, isProviderEnabled } from './config'

// Types
export interface PaymentProvider {
  createCheckoutSession: (items: CheckoutItem[], successUrl: string, cancelUrl: string) => Promise<CheckoutSession>
  createSubscription: (priceId: string, customerId: string) => Promise<Subscription>
  cancelSubscription: (subscriptionId: string) => Promise<void>
  getCustomer: (customerId: string) => Promise<Customer | null>
  createCustomer: (email: string, name?: string) => Promise<Customer>
  getPaymentMethods: (customerId: string) => Promise<PaymentMethod[]>
}

export interface CheckoutItem {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  image?: string
}

export interface CheckoutSession {
  id: string
  url: string
  status: 'open' | 'complete' | 'expired'
}

export interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'incomplete' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface Customer {
  id: string
  email: string
  name?: string
  created: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
}

// Stripe Payment Provider
class StripePaymentProvider implements PaymentProvider {
  private stripe: any

  constructor() {
    if (isProviderEnabled('stripe')) {
      this.stripe = require('./stripe').stripe
    }
  }

  async createCheckoutSession(items: CheckoutItem[], successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    if (!this.stripe) throw new Error('Stripe not configured')

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return {
      id: session.id,
      url: session.url,
      status: session.status
    }
  }

  async createSubscription(priceId: string, customerId: string): Promise<Subscription> {
    if (!this.stripe) throw new Error('Stripe not configured')

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.stripe) throw new Error('Stripe not configured')
    await this.stripe.subscriptions.cancel(subscriptionId)
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    if (!this.stripe) throw new Error('Stripe not configured')

    try {
      const customer = await this.stripe.customers.retrieve(customerId)
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: new Date(customer.created * 1000).toISOString()
      }
    } catch (error) {
      return null
    }
  }

  async createCustomer(email: string, name?: string): Promise<Customer> {
    if (!this.stripe) throw new Error('Stripe not configured')

    const customer = await this.stripe.customers.create({
      email,
      name,
    })

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: new Date(customer.created * 1000).toISOString()
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    if (!this.stripe) throw new Error('Stripe not configured')

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data.map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      } : undefined
    }))
  }
}

// Mock Payment Provider (for development/testing)
class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(items: CheckoutItem[], successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    // Simulate successful checkout
    return {
      id: `mock_session_${Date.now()}`,
      url: successUrl,
      status: 'complete'
    }
  }

  async createSubscription(priceId: string, customerId: string): Promise<Subscription> {
    return {
      id: `mock_sub_${Date.now()}`,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancelAtPeriodEnd: false
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Mock cancellation
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return {
      id: customerId,
      email: 'mock@example.com',
      name: 'Mock Customer',
      created: new Date().toISOString()
    }
  }

  async createCustomer(email: string, name?: string): Promise<Customer> {
    return {
      id: `mock_customer_${Date.now()}`,
      email,
      name: name || 'Mock Customer',
      created: new Date().toISOString()
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return [
      {
        id: 'mock_pm_1',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025
        }
      }
    ]
  }
}

// No Payment Provider (when payments are disabled)
class NoPaymentProvider implements PaymentProvider {
  async createCheckoutSession(): Promise<CheckoutSession> {
    throw new Error('Payments are disabled')
  }

  async createSubscription(): Promise<Subscription> {
    throw new Error('Payments are disabled')
  }

  async cancelSubscription(): Promise<void> {
    throw new Error('Payments are disabled')
  }

  async getCustomer(): Promise<Customer | null> {
    throw new Error('Payments are disabled')
  }

  async createCustomer(): Promise<Customer> {
    throw new Error('Payments are disabled')
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    throw new Error('Payments are disabled')
  }
}

// Factory function to get the appropriate payment provider
export const getPaymentProvider = (): PaymentProvider => {
  if (!isFeatureEnabled('payments')) {
    return new NoPaymentProvider()
  }

  if (isProviderEnabled('stripe')) {
    return new StripePaymentProvider()
  }

  // Fallback to mock provider for development
  if (process.env.NODE_ENV === 'development') {
    return new MockPaymentProvider()
  }

  return new NoPaymentProvider()
}

// Export the payment provider instance
export const payments = getPaymentProvider()

// Helper functions for common operations
export const createCheckout = async (items: CheckoutItem[], successUrl: string, cancelUrl: string) => {
  return await payments.createCheckoutSession(items, successUrl, cancelUrl)
}

export const createCustomerSubscription = async (priceId: string, customerId: string) => {
  return await payments.createSubscription(priceId, customerId)
}

export const cancelCustomerSubscription = async (subscriptionId: string) => {
  return await payments.cancelSubscription(subscriptionId)
}

// React hook for payment operations
export const usePayments = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    execute,
    isPaymentsEnabled: isFeatureEnabled('payments')
  }
}
