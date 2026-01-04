# NEAR Protocol Trading Dashboard - Implementation Document

> **Project Status**: 🎉 ALL STAGES COMPLETE - Ready to Deploy!
> **Last Updated**: 2026-01-04

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Decision Analysis](#decision-analysis)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Implementation Stages](#implementation-stages)
6. [API & Data Strategy](#api--data-strategy)
7. [Hands-On TradingView Learning](#hands-on-tradingview-learning)
8. [Free Tier Constraints](#free-tier-constraints)
9. [Progress Tracker](#progress-tracker)

---

## Project Overview

### Purpose
A cryptocurrency dashboard tracking NEAR Protocol's trading activity across exchanges, with price visualization relative to major cryptocurrencies. Built as both a functional app and a portfolio piece demonstrating TradingView Lightweight Charts integration.

### Goals
1. **Primary**: Track NEAR trading volume distribution across top exchanges
2. **Secondary**: Visualize NEAR/USD price with BTC/ETH correlation
3. **Educational**: Learn TradingView Lightweight Charts through hands-on implementation
4. **Portfolio**: Create a polished, deployable project for portfolio showcase

### Key Features
- Real-time(ish) NEAR price tracking (15-min updates)
- Exchange volume distribution visualization
- Historical price charts with TradingView
- Volume trends over time
- Responsive, modern UI suitable for portfolio

### Learning Approach
**Hands-on implementation** - TradingView concepts are learned step-by-step during each stage:
- Each chart implementation includes explanation of concepts
- User can ask questions to test understanding
- Progressive complexity from basic line charts to advanced features

---

## Decision Analysis

### Why NEAR Volume Tracking (vs Price Comparison)?

After deep analysis, the **hybrid approach** was chosen:

| Criteria | Price Comparison | Volume Tracking | **Hybrid (Chosen)** |
|----------|-----------------|-----------------|---------------------|
| Uniqueness | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Portfolio Value | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Chart Variety | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| API Efficiency | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Learning Value | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Rationale**:
- Volume tracking is **unique** (most trackers focus only on price)
- Combining both gives **multiple chart types** to learn (line, bar, pie, area)
- Shows **data processing skills** (aggregating exchange data)
- Tells an **interesting story** (where is NEAR being traded?)
- Still includes familiar price charts for accessibility

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  CoinGecko   │    │    Vercel    │    │   MongoDB    │       │
│  │  API (Free)  │    │   (Hobby)    │    │ Atlas (M0)   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
└─────────┼───────────────────┼───────────────────┼───────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GitHub Actions ──(every 15 min)──► POST /api/cron/fetch-data   │
│         │                                    │                   │
│         │                                    ▼                   │
│         │                          ┌─────────────────┐          │
│         │                          │ CoinGecko API   │          │
│         │                          │ - /coins/near/  │          │
│         │                          │   tickers       │          │
│         │                          │ - /simple/price │          │
│         │                          └────────┬────────┘          │
│         │                                   │                    │
│         │                                   ▼                    │
│         │                          ┌─────────────────┐          │
│         │                          │  MongoDB Atlas  │          │
│         │                          │  - prices       │          │
│         │                          │  - volumes      │          │
│         │                          │  - metadata     │          │
│         │                          └────────┬────────┘          │
│         │                                   │                    │
│         ▼                                   ▼                    │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                   NEXT.JS APP                        │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │        │
│  │  │  Dashboard  │  │  /learn     │  │  API Routes │  │        │
│  │  │  (Charts)   │  │  (Tutorial) │  │  (Data)     │  │        │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
my-trading-view/
├── .github/
│   └── workflows/
│       └── fetch-data.yml          # Cron job (every 15 min)
├── src/
│   ├── app/
│   │   ├── page.tsx                # Dashboard (main view)
│   │   ├── learn/
│   │   │   └── page.tsx            # TradingView tutorial page
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   └── fetch-data/
│   │   │   │       └── route.ts    # Cron endpoint (secured)
│   │   │   ├── prices/
│   │   │   │   └── route.ts        # GET price data
│   │   │   └── volumes/
│   │   │       └── route.ts        # GET volume data
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── charts/
│   │   │   ├── PriceChart.tsx      # TradingView line chart
│   │   │   ├── VolumeTimeChart.tsx # Volume over time
│   │   │   ├── ExchangePieChart.tsx # Exchange distribution
│   │   │   └── ExchangeBarChart.tsx # Exchange comparison
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx      # Key metrics display
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── mongodb.ts              # Database connection
│   │   ├── coingecko.ts            # API client
│   │   ├── utils.ts                # Helpers
│   │   └── constants.ts            # App constants
│   └── types/
│       └── index.ts                # TypeScript types
├── public/
│   └── ...
├── IMPLEMENTATION.md               # This document
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 14.x | React framework with App Router |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | latest | Pre-built accessible components |
| **Charts** | TradingView Lightweight Charts | 4.x | Financial charting library |
| **Database** | MongoDB Atlas | M0 (Free) | Data persistence |
| **Hosting** | Vercel | Hobby | Deployment & hosting |
| **Cron** | GitHub Actions | - | Scheduled data fetching |
| **API** | CoinGecko | Demo (Free) | Cryptocurrency data |

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "lightweight-charts": "^4.0.0",
    "mongodb": "^6.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "latest"
  }
}
```

---

## Implementation Stages

### Stage 1: Foundation ✅
**Goal**: Project setup and deployment pipeline

**Tasks**:
- [x] Initialize Next.js 14 project with App Router
- [x] Configure TailwindCSS
- [x] Set up MongoDB Atlas connection (code ready, cluster setup needed)
- [x] Configure environment variables template
- [ ] Deploy to Vercel (ready when MongoDB is configured)
- [x] Set up project structure

**Deliverable**: ✅ Shell app with complete foundation

**Files Created**:
- `package.json` ✅
- `src/app/globals.css` (TailwindCSS 4 theme) ✅
- `next.config.ts` ✅
- `src/app/layout.tsx` ✅
- `src/app/page.tsx` (dashboard placeholder) ✅
- `src/lib/mongodb.ts` ✅
- `src/lib/coingecko.ts` ✅
- `src/lib/constants.ts` ✅
- `src/lib/utils.ts` ✅
- `src/types/index.ts` ✅
- `src/app/api/cron/fetch-data/route.ts` ✅
- `src/app/api/prices/route.ts` ✅
- `src/app/api/volumes/route.ts` ✅
- `.env.example` ✅
- `.env.local` (template) ✅
- `.github/workflows/fetch-data.yml` ✅

---

### Stage 2: Data Layer ⬜
**Goal**: Data fetching and storage pipeline

**Tasks**:
- [ ] Create CoinGecko API client
- [ ] Define MongoDB schemas
- [ ] Implement `/api/cron/fetch-data` endpoint
- [ ] Create GitHub Actions workflow
- [ ] Test data pipeline end-to-end
- [ ] Implement `/api/prices` and `/api/volumes` routes

**Deliverable**: Data flowing into MongoDB every 15 minutes

**Files to Create**:
- `src/lib/coingecko.ts`
- `src/types/index.ts`
- `src/app/api/cron/fetch-data/route.ts`
- `src/app/api/prices/route.ts`
- `src/app/api/volumes/route.ts`
- `.github/workflows/fetch-data.yml`

**API Endpoints**:
```typescript
// CoinGecko endpoints used:
GET /simple/price?ids=near&vs_currencies=usd,btc,eth
GET /coins/near/tickers
```

---

### Stage 3: First Chart - Price Line ✅
**Goal**: Working TradingView price chart

**Tasks**:
- [x] Install TradingView Lightweight Charts
- [x] Create chart wrapper component (client-side only)
- [x] Implement line series for NEAR/USD
- [x] Add time axis formatting
- [x] Connect to API data
- [x] Add loading and error states
- [x] Add time range selector (1H, 24H, 7D, 30D)

**Deliverable**: ✅ Working price chart on homepage with real data!

**Files Created**:
- `src/components/charts/PriceChart.tsx` - TradingView line chart component

**TradingView Concepts Learned**:
- `'use client'` directive - Required because TradingView needs DOM access
- `useRef` pattern - For chart container reference and cleanup
- `createChart()` - Main entry point with configuration options
- `chart.addSeries(LineSeries, options)` - Adding data series
- `series.setData(data)` - Feeding data in `{time, value}` format
- `chart.timeScale().fitContent()` - Auto-fit view to show all data
- `chart.remove()` - Critical cleanup to prevent memory leaks
- Responsive resize handling with window event listeners

---

### Stage 4: Volume Visualizations ✅
**Goal**: Complete volume section

**Tasks**:
- [x] Create exchange pie/donut chart (custom SVG)
- [x] Create exchange bar chart comparison (CSS-based)
- [x] Create volume histogram chart (TradingView)
- [x] Add data aggregation logic
- [x] Implement chart interactions (hover states, tooltips, legends)

**Deliverable**: ✅ Volume section complete with 3 chart types!

**Files Created**:
- `src/components/charts/ExchangePieChart.tsx` - Custom SVG donut chart
- `src/components/charts/ExchangeBarChart.tsx` - CSS horizontal bar chart
- `src/components/charts/VolumeTimeChart.tsx` - TradingView histogram series

**Concepts Learned**:

**TradingView Histogram Series:**
- `chart.addSeries(HistogramSeries)` - Vertical bars for volume data
- Per-bar coloring - Each data point can have custom color
- `priceFormat: 'volume'` - Optimized tooltip formatting
- `localization.priceFormatter` - Custom axis labels (M, B suffixes)

**Custom SVG Charts (when TradingView isn't the right tool):**
- SVG arc calculation for pie slices
- `viewBox` for responsive SVG
- `useMemo` for expensive calculations
- Hover state management with useState

**CSS Bar Charts:**
- Flexbox for alignment
- Percentage widths for proportional bars
- CSS transitions for animations
- Trust score color coding

---

### Stage 5: Dashboard & Polish ✅
**Goal**: Production-ready UI

**Tasks**:
- [x] Design responsive grid layout
- [x] Create stats cards component with icons
- [x] Implement dark/light mode toggle
- [x] Add polished header with branding
- [x] Add footer with portfolio links
- [x] Implement loading skeletons
- [x] Sticky header with backdrop blur

**Deliverable**: ✅ Polished, portfolio-ready dashboard!

**Files Created**:
- `src/components/dashboard/StatsCard.tsx` - Reusable stats cards with loading states
- `src/components/dashboard/Header.tsx` - Header with theme toggle
- `src/components/dashboard/Footer.tsx` - Footer with tech badges

**Concepts Learned**:

**Component Architecture:**
- Reusable component patterns with TypeScript props
- Skeleton loading states for better UX
- Compound components (StatsCard + StatsCardGrid)

**Theme System:**
- CSS variables for theming
- Class-based theme toggle (`.light` class)
- localStorage for theme persistence
- Hydration-safe theme initialization

**Polish Details:**
- Hover effects and transitions
- Icons for visual hierarchy
- Gradient logo with shadow
- Backdrop blur on sticky header
- Tech stack badges in footer

---

### Stage 6: Final Polish & README ✅
**Goal**: Production-ready portfolio piece

**Tasks**:
- [x] Add meta tags for SEO and social sharing
- [x] Add Twitter/X card meta tags
- [x] Add viewport configuration
- [x] Create polished README.md
- [x] Final build verification (no warnings)

**Deliverable**: ✅ Production-ready portfolio piece!

**Files Updated**:
- `README.md` - Complete documentation with architecture diagram
- `src/app/layout.tsx` - Enhanced meta tags and viewport config

**SEO & Social Features**:
- Open Graph meta tags for Facebook/LinkedIn
- Twitter Card meta tags
- Theme color for browser UI
- Comprehensive keywords

---

## API & Data Strategy

### CoinGecko Endpoints

| Endpoint | Purpose | Frequency | Est. Calls/Day |
|----------|---------|-----------|----------------|
| `/simple/price` | Current prices | Every 15 min | 96 |
| `/coins/near/tickers` | Exchange volumes | Every 15 min | 96 |
| **Total** | | | **192** |

**Monthly Usage**: 192 × 30 = **5,760 calls** (within 10,000 limit)

### Data Models

```typescript
// Price document
interface PriceDocument {
  _id: ObjectId;
  timestamp: Date;
  near_usd: number;
  btc_usd: number;
  eth_usd: number;
  near_btc: number;  // calculated
  near_eth: number;  // calculated
  market_cap?: number;
  volume_24h?: number;
}

// Volume document
interface VolumeDocument {
  _id: ObjectId;
  timestamp: Date;
  total_volume_usd: number;
  exchanges: ExchangeVolume[];
}

interface ExchangeVolume {
  name: string;
  volume_usd: number;
  volume_near: number;
  trading_pairs: string[];
  trust_score: string;
}
```

### Data Retention
- **Last 30 days**: Full granularity (15-min intervals)
- **30-90 days**: Hourly aggregates
- **90+ days**: Daily aggregates
- **Storage estimate**: ~50MB for 1 year (well within 512MB limit)

---

## Hands-On TradingView Learning

### Learning Philosophy
Instead of a separate tutorial, **we learn TradingView by building together**:
- I explain each concept as we implement it
- You can ask questions at any point to test understanding
- Progressive complexity from basic to advanced

### Concepts We'll Cover (During Implementation)

| Stage | Concept | What You'll Learn |
|-------|---------|-------------------|
| 3 | Chart initialization | How to create a chart, configure options, handle Next.js SSR |
| 3 | Line series | Adding data series, styling lines, setting colors |
| 3 | Time formatting | Working with timestamps, formatting axes |
| 3 | Responsive sizing | Making charts resize with container |
| 4 | Histogram series | Bar charts for volume data |
| 4 | Area series | Filled area charts, gradients |
| 4 | Multiple series | Overlaying multiple data sets |
| 5 | Custom tooltips | Formatting hover information |
| 5 | Crosshair sync | Syncing cursors across charts |
| 5 | Price lines | Adding reference lines, markers |

### Key Things to Know (Preview)
- **Client-side only**: TradingView won't work with SSR
- **useEffect pattern**: Charts must be created in useEffect
- **Cleanup required**: Always call `chart.remove()` on unmount
- **Container dimensions**: Chart needs explicit width/height

### Reference Resources
- [Official Docs](https://tradingview.github.io/lightweight-charts/docs)
- [React Tutorial](https://tradingview.github.io/lightweight-charts/tutorials/react/simple)
- [GitHub](https://github.com/tradingview/lightweight-charts)

---

## Free Tier Constraints

### Vercel (Hobby Plan)
| Resource | Limit | Our Usage |
|----------|-------|-----------|
| Bandwidth | 100 GB/month | ~1-5 GB |
| Serverless Execution | 100 GB-Hrs | ~5-10 GB-Hrs |
| Builds | 6000 min/month | ~100 min |
| **Cron Jobs** | **1/day minimum** | ❌ Need alternative |

**Solution**: Use GitHub Actions for cron instead

### GitHub Actions (Free Tier)
| Resource | Limit | Our Usage |
|----------|-------|-----------|
| Minutes | 2000/month | ~480 min |
| Storage | 500 MB | <1 MB |
| Concurrent jobs | 20 | 1 |

**Calculation**: 15 min interval × 10 sec/run × 4/hr × 24 hr × 30 days = 480 min ✓

### MongoDB Atlas (M0 Free)
| Resource | Limit | Our Usage |
|----------|-------|-----------|
| Storage | 512 MB | ~50 MB/year |
| Connections | 500 | ~10 |
| Ops/sec | 100 | ~1 |

### CoinGecko (Demo Plan)
| Resource | Limit | Our Usage |
|----------|-------|-----------|
| Calls/month | 10,000 | ~5,760 |
| Rate limit | 30/min | ~4/min |

---

## Progress Tracker

### Overall Status

```
Stage 1: Foundation      ✅✅✅✅✅ 100%
Stage 2: Data Layer      ✅✅✅✅✅ 100%
Stage 3: Price Chart     ✅✅✅✅✅ 100%
Stage 4: Volume Charts   ✅✅✅✅✅ 100%
Stage 5: Polish          ✅✅✅✅✅ 100%
Stage 6: Final Polish    ✅✅✅✅✅ 100%
─────────────────────────────────
TOTAL                    ✅✅✅✅✅ 100% 🎉
```

### Changelog

| Date | Stage | Change |
|------|-------|--------|
| 2026-01-04 | 6 | ✅ Stage 6 Complete: README, meta tags, final polish |
| 2026-01-04 | 5 | ✅ Stage 5 Complete: Polished UI with theme toggle |
| 2026-01-04 | 4 | ✅ Stage 4 Complete: Volume charts (pie, bar, histogram) |
| 2026-01-04 | 3 | ✅ Stage 3 Complete: TradingView price chart with real data |
| 2026-01-03 | 2 | ✅ Stage 2 Complete: Data pipeline working (CoinGecko → MongoDB) |
| 2026-01-03 | 1 | ✅ Stage 1 Complete: Foundation implemented |
| 2026-01-03 | - | Initial planning and architecture design complete |

### Next Steps
1. ✅ ~~Initialize Next.js project~~ (Done)
2. ✅ ~~Set up MongoDB Atlas cluster~~ (Done)
3. ✅ ~~Test data pipeline~~ (Done)
4. ✅ ~~Stage 3: Implement TradingView price chart~~ (Done)
5. ✅ ~~Stage 4: Volume visualization charts~~ (Done)
6. ✅ ~~Stage 5: Dashboard polish & responsive design~~ (Done)
7. ✅ ~~Stage 6: Final polish, README & meta tags~~ (Done)
8. **Deploy to Vercel** (optional)
9. **Configure GitHub Actions secrets** (for production)

---

## Quick Reference

### Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# CoinGecko (optional for authenticated requests)
COINGECKO_API_KEY=

# Cron Security
CRON_SECRET=your-secret-key

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Useful Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test API locally
curl http://localhost:3000/api/prices

# Trigger cron manually (for testing)
curl -X POST http://localhost:3000/api/cron/fetch-data \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Sources & References

- [CoinGecko API Rate Limits](https://support.coingecko.com/hc/en-us/articles/4538771776153-What-is-the-rate-limit-for-CoinGecko-API-public-plan)
- [CoinGecko API Documentation](https://docs.coingecko.com/docs/common-errors-rate-limit)
- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- [TradingView GitHub](https://github.com/tradingview/lightweight-charts)
- [TradingView React Tutorial](https://tradingview.github.io/lightweight-charts/tutorials/react/simple)
- [Next.js + TradingView Integration Guide](https://medium.com/@ggahnuary/creating-tradingview-charting-library-with-next-js-49dd7123ae5c)
