import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Xion Stack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The bulletproof fullstack template with Next.js, Supabase, Stripe, and world-class UI components.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🚀 Next.js 14+</h3>
            <p className="text-muted-foreground">
              Latest App Router with server components, automatic optimizations, and zero-config deployment.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🗄️ Supabase</h3>
            <p className="text-muted-foreground">
              PostgreSQL database with built-in auth, real-time subscriptions, and auto-generated APIs.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">💳 Stripe</h3>
            <p className="text-muted-foreground">
              Complete payment processing with checkout, subscriptions, and webhook handling.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🎨 shadcn/ui</h3>
            <p className="text-muted-foreground">
              50+ pre-built, accessible components with Tailwind CSS styling.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">⚡ Performance</h3>
            <p className="text-muted-foreground">
              Optimized for speed with automatic code splitting, image optimization, and caching.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
