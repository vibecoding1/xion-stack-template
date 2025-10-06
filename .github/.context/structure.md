# Xion Stack Template - Project Structure & Architecture

## Project Overview
Xion Stack is a bulletproof fullstack template built with Next.js 14+, Supabase, Stripe, and world-class UI components. Perfect for SaaS, e-commerce, and web applications.

## Core Technologies
- **Next.js 14+** (App Router) - React framework with server-side rendering
- **Supabase** - PostgreSQL database with built-in auth & real-time
- **Stripe** - Payment processing and subscription management
- **shadcn/ui** - 50+ pre-built, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation

## Directory Structure
```
app/
├── api/                    # API routes (Next.js App Router)
│   ├── auth/              # Authentication endpoints
│   ├── supabase/          # Supabase-specific API endpoints
│   └── payments/          # Stripe payment endpoints
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components (Navbar, Sidebar, etc.)
├── lib/                  # Utility libraries and configurations
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database providers
│   ├── payments.ts       # Payment processing
│   └── config.ts         # Feature toggles and configuration
└── globals.css           # Global styles and Tailwind imports

components/
├── ui/                   # shadcn/ui components (Button, Input, Card, etc.)
├── auth/                 # Login/Signup forms
└── layout/               # Navigation and layout components

lib/
├── supabase.ts           # Supabase client configuration
├── stripe.ts             # Stripe client configuration
├── utils.ts              # Utility functions (cn, formatDate, etc.)
└── config.ts             # Centralized configuration system
```

## Key Files & Purpose

### Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `env.example` - Environment variables template

### Core Application Files
- `app/layout.tsx` - Root layout with providers and global styles
- `app/page.tsx` - Landing page with feature showcase
- `middleware.ts` - Route protection and authentication

### Authentication System
- `lib/auth.ts` - Authentication hooks and context
- `components/auth/LoginForm.tsx` - User login form
- `components/auth/SignupForm.tsx` - User registration form
- `app/api/auth/login/route.ts` - Login API endpoint
- `app/api/auth/signup/route.ts` - Signup API endpoint

### Database Integration
- `lib/database.ts` - Database provider interface and implementations
- `app/api/supabase/users/route.ts` - User CRUD operations
- `app/api/supabase/products/route.ts` - Product management
- `app/api/supabase/orders/route.ts` - Order management
- `app/api/supabase/files/route.ts` - File upload to Supabase Storage
- `app/api/supabase/realtime/route.ts` - Real-time subscriptions

### Payment System
- `lib/payments.ts` - Payment processing hooks and context
- `app/api/payments/checkout/route.ts` - Stripe checkout session creation

### Layout System
- `components/layout/Navbar.tsx` - Main navigation bar
- `components/layout/Sidebar.tsx` - Dashboard sidebar
- `components/layout/PageLayout.tsx` - Configurable page layouts
- `components/layout/Breadcrumbs.tsx` - Navigation breadcrumbs
- `components/layout/Footer.tsx` - Site footer

## Key Methods & Functions

### Authentication
- `useAuth()` - Hook for authentication state management
- `login(email, password)` - User login function
- `signup(email, password, name)` - User registration function
- `logout()` - User logout function

### Database Operations
- `getDatabaseProvider()` - Factory function for database providers
- `SupabaseDatabaseProvider` - Supabase implementation
- `LocalStorageDatabaseProvider` - Local storage fallback
- `NoDatabaseProvider` - No database mode

### Payment Processing
- `usePayments()` - Hook for payment operations
- `createCheckoutSession()` - Create Stripe checkout session
- `handlePaymentSuccess()` - Process successful payments

### Configuration
- `config` - Centralized configuration object
- `isFeatureEnabled(feature)` - Check if feature is enabled
- `isProviderEnabled(provider)` - Check if provider is enabled

## Database Schema
- `users` table: id, email, name, created_at, updated_at
- `products` table: id, name, price, description, image_url, created_at
- `orders` table: id, user_id, product_id, quantity, total, status, created_at
- `files` table: id, name, path, size, mime_type, created_at

## API Endpoints
- `GET/POST /api/supabase/users` - User management
- `GET/POST /api/supabase/products` - Product CRUD
- `GET/POST /api/supabase/orders` - Order management
- `GET/POST /api/supabase/files` - File uploads
- `GET/POST /api/supabase/realtime` - Real-time subscriptions
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/payments/checkout` - Stripe checkout

## Layout Variants
- `LayoutVariants.Landing` - Marketing pages (navbar + footer)
- `LayoutVariants.Dashboard` - Admin panels (navbar + sidebar + breadcrumbs)
- `LayoutVariants.Auth` - Authentication forms (centered, no navigation)
- `LayoutVariants.Minimal` - Just content (no navigation)
- `LayoutVariants.Full` - Complete layout (everything)

## Environment Variables
- `NEXT_PUBLIC_ENABLE_AUTH` - Enable/disable authentication
- `NEXT_PUBLIC_ENABLE_DATABASE` - Enable/disable database features
- `NEXT_PUBLIC_ENABLE_PAYMENTS` - Enable/disable payment processing
- `NEXT_PUBLIC_ENABLE_REALTIME` - Enable/disable real-time features
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side)
