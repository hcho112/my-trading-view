'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-accent-foreground font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">NEAR Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">About this project</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">About This Project</h1>
          <p className="text-muted-foreground text-lg">
            A personal experiment with TradingView charts and cryptocurrency APIs
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">01.</span> The Story
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              I received a small amount of NEAR tokens from a previous work project and found myself
              constantly checking its price across various platforms. Rather than keep switching between
              apps and websites, I thought: why not build my own dashboard?
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This project became an opportunity to explore two technologies I&apos;ve been curious about:
              <span className="text-foreground font-medium"> TradingView Lightweight Charts</span> for
              professional-grade financial visualizations, and the
              <span className="text-foreground font-medium"> CoinGecko API</span> for real-time
              cryptocurrency data. What started as a simple price tracker evolved into a full dashboard
              with volume analytics and exchange comparisons.
            </p>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">02.</span> Technology Stack
          </h2>
          <div className="grid gap-4">
            {/* Frontend */}
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-medium text-foreground mb-2">Frontend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">Next.js 16</span> with App Router for server-side rendering and API routes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">TypeScript</span> for type-safe development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">TailwindCSS v4</span> for styling with CSS custom properties for theming</span>
                </li>
              </ul>
            </div>

            {/* Charts */}
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-medium text-foreground mb-2">Charts & Visualization</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">TradingView Lightweight Charts</span> for price and volume time-series</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">Custom SVG</span> for donut chart (TradingView doesn&apos;t support pie charts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">CSS-based bars</span> for exchange comparison chart</span>
                </li>
              </ul>
            </div>

            {/* Backend & Data */}
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-medium text-foreground mb-2">Backend & Data</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">CoinGecko API</span> for cryptocurrency data (prices, volumes, market info)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">MongoDB Atlas</span> for storing historical data (M0 free tier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">Next.js API Routes</span> for data fetching and transformation</span>
                </li>
              </ul>
            </div>

            {/* Infrastructure */}
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-medium text-foreground mb-2">Infrastructure</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">Vercel</span> for hosting and deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span><span className="text-foreground">GitHub Actions</span> for scheduled data fetching (cron jobs every 15 minutes)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">03.</span> How It Works
          </h2>
          <div className="p-4 rounded-lg bg-card border border-card-border font-mono text-sm">
            <pre className="text-muted-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────┐
│           GitHub Actions (Cron)             │
│         Triggers every 15 minutes           │
└─────────────────┬───────────────────────────┘
                  │ POST /api/cron/fetch-data
                  ▼
┌─────────────────────────────────────────────┐
│           Next.js API Routes                │
│  Fetches from CoinGecko, stores in MongoDB  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────────┐
│ CoinGecko API │   │  MongoDB Atlas    │
│ (3 endpoints) │   │ (prices, volumes) │
└───────────────┘   └───────────────────┘`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Data is fetched from CoinGecko every 15 minutes via GitHub Actions, stored in MongoDB,
            and served to the frontend through Next.js API routes.
          </p>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">04.</span> Limitations & Known Issues
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h3 className="font-medium text-yellow-500 mb-2">Free Tier Constraints</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><span className="text-foreground">CoinGecko API:</span> Limited to 10,000 calls/month (~288 calls/day with 3 endpoints per fetch)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><span className="text-foreground">MongoDB Atlas M0:</span> 512 MB storage limit with TTL indexes for auto-cleanup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><span className="text-foreground">No buy/sell volume data:</span> CoinGecko free tier doesn&apos;t provide order flow information</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h3 className="font-medium text-orange-500 mb-2">GitHub Actions Scheduling</h3>
              <p className="text-sm text-muted-foreground mb-2">
                GitHub Actions cron jobs run on a best-effort basis and may be delayed during peak times:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Jobs scheduled for busy times (especially around midnight UTC) may be delayed by several minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Occasional runs may be skipped entirely during high GitHub load periods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Data freshness depends on successful cron execution (typically within 15-20 minutes)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="font-medium text-blue-500 mb-2">Data Source Notes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><span className="text-foreground">Market Cap Rank:</span> From CoinGecko, may differ from CoinMarketCap due to different coin inclusion policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><span className="text-foreground">Exchange volumes:</span> Aggregated from CoinGecko&apos;s ticker data, excludes anomalous/stale data</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">05.</span> Links
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/hcho112/my-trading-view"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-card-border hover:border-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-foreground">View on GitHub</span>
            </a>
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-card-border hover:border-accent transition-colors"
            >
              <span className="text-foreground">Data by CoinGecko</span>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Built with Next.js, TradingView Charts, and CoinGecko API
          </p>
        </footer>
      </main>
    </div>
  );
}
