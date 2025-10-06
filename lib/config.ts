/**
 * Xion Stack Configuration System
 * 
 * This file contains all feature toggles and configuration options.
 * Users can enable/disable features by setting environment variables.
 * All features are optional and gracefully degrade when disabled.
 */

// Feature Toggle Types
export interface FeatureConfig {
  enabled: boolean
  required?: boolean
  fallback?: string
}

export interface XionConfig {
  // Core Features
  features: {
    authentication: FeatureConfig
    database: FeatureConfig
    payments: FeatureConfig
    realtime: FeatureConfig
    analytics: FeatureConfig
    email: FeatureConfig
    fileUpload: FeatureConfig
    notifications: FeatureConfig
  }
  
  // Service Providers
  providers: {
    supabase: FeatureConfig & {
      url?: string
      anonKey?: string
    }
    stripe: FeatureConfig & {
      publishableKey?: string
      secretKey?: string
      webhookSecret?: string
    }
    auth0: FeatureConfig & {
      domain?: string
      clientId?: string
      clientSecret?: string
    }
    sendgrid: FeatureConfig & {
      apiKey?: string
    }
    aws: FeatureConfig & {
      accessKeyId?: string
      secretAccessKey?: string
      region?: string
    }
  }
  
  // UI Configuration
  ui: {
    theme: 'light' | 'dark' | 'system'
    primaryColor: string
    showBranding: boolean
    enableAnimations: boolean
  }
  
  // App Configuration
  app: {
    name: string
    description: string
    url: string
    supportEmail: string
  }
}

// Default Configuration
const defaultConfig: XionConfig = {
  features: {
    authentication: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true',
      required: false,
      fallback: 'No authentication required'
    },
    database: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true',
      required: false,
      fallback: 'Using local storage'
    },
    payments: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
      required: false,
      fallback: 'Payments disabled'
    },
    realtime: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
      required: false,
      fallback: 'Real-time features disabled'
    },
    analytics: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      required: false,
      fallback: 'Analytics disabled'
    },
    email: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_EMAIL === 'true',
      required: false,
      fallback: 'Email features disabled'
    },
    fileUpload: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === 'true',
      required: false,
      fallback: 'File upload disabled'
    },
    notifications: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
      required: false,
      fallback: 'Notifications disabled'
    }
  },
  
  providers: {
    supabase: {
      enabled: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      required: false,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    stripe: {
      enabled: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY),
      required: false,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    auth0: {
      enabled: !!(process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID),
      required: false,
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET
    },
    sendgrid: {
      enabled: !!process.env.SENDGRID_API_KEY,
      required: false,
      apiKey: process.env.SENDGRID_API_KEY
    },
    aws: {
      enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      required: false,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    }
  },
  
  ui: {
    theme: (process.env.NEXT_PUBLIC_THEME as 'light' | 'dark' | 'system') || 'system',
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#3b82f6',
    showBranding: process.env.NEXT_PUBLIC_SHOW_BRANDING !== 'false',
    enableAnimations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false'
  },
  
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Xion Stack App',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Built with the bulletproof Xion Stack',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'
  }
}

// Export the configuration
export const config = defaultConfig

// Helper functions
export const isFeatureEnabled = (feature: keyof XionConfig['features']): boolean => {
  return config.features[feature].enabled
}

export const isProviderEnabled = (provider: keyof XionConfig['providers']): boolean => {
  return config.providers[provider].enabled
}

export const getFeatureFallback = (feature: keyof XionConfig['features']): string => {
  return config.features[feature].fallback || 'Feature disabled'
}

export const getProviderConfig = <T extends keyof XionConfig['providers']>(
  provider: T
): XionConfig['providers'][T] => {
  return config.providers[provider]
}

// Validation function
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Check required features
  Object.entries(config.features).forEach(([feature, config]) => {
    if (config.required && !config.enabled) {
      errors.push(`Required feature '${feature}' is disabled`)
    }
  })
  
  // Check provider dependencies
  if (config.features.database.enabled && !config.providers.supabase.enabled) {
    errors.push('Database feature enabled but Supabase provider not configured')
  }
  
  if (config.features.payments.enabled && !config.providers.stripe.enabled) {
    errors.push('Payments feature enabled but Stripe provider not configured')
  }
  
  if (config.features.email.enabled && !config.providers.sendgrid.enabled) {
    errors.push('Email feature enabled but SendGrid provider not configured')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Runtime configuration check
export const checkRuntimeConfig = () => {
  const validation = validateConfig()
  if (!validation.valid) {
    console.warn('Xion Stack Configuration Issues:', validation.errors)
  }
  return validation
}
