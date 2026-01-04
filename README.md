# NEAR Trading Dashboard

A real-time cryptocurrency dashboard tracking NEAR Protocol trading activity across 70+ exchanges. Built as a portfolio piece demonstrating modern web development with Next.js, TradingView Lightweight Charts, and MongoDB.

## Features

- **Real-Time Price Tracking** - NEAR/USD price with 24h change indicators
- **Volume Analytics** - Trading volume distribution across 70+ exchanges
- **Interactive Charts** - TradingView Lightweight Charts with time range selection
- **Exchange Comparison** - Visual comparison of top exchanges by volume
- **Dark/Light Mode** - Theme toggle with system preference support
- **Responsive Design** - Optimized for desktop and mobile devices

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Charts | TradingView Lightweight Charts |
| Database | MongoDB Atlas (M0 Free Tier) |
| Data Source | CoinGecko API (Free Tier) |
| Deployment | Vercel |
| Cron Jobs | GitHub Actions |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions                           │
│                   (Every 15 minutes)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /api/cron/fetch-data
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ /api/cron   │  │ /api/prices │  │ /api/volumes│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐  ┌─────────────────────────────┐
│  CoinGecko API  │  │      MongoDB Atlas          │
│  (Data Source)  │  │  (prices & volumes)         │
└─────────────────┘  └─────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- CoinGecko API access (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/my-trading-view.git
cd my-trading-view
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=my-trading-view
CRON_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Seed initial data:
```bash
curl -X POST http://localhost:3000/api/cron/fetch-data \
  -H "Authorization: Bearer your-secret-key"
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/fetch-data/   # Data fetching endpoint
│   │   ├── prices/            # Price data API
│   │   └── volumes/           # Volume data API
│   ├── globals.css            # Theme variables
│   ├── layout.tsx             # Root layout with meta tags
│   └── page.tsx               # Main dashboard
├── components/
│   ├── charts/
│   │   ├── PriceChart.tsx     # TradingView line chart
│   │   ├── ExchangePieChart.tsx   # SVG donut chart
│   │   ├── ExchangeBarChart.tsx   # CSS bar chart
│   │   └── VolumeTimeChart.tsx    # TradingView histogram
│   └── dashboard/
│       ├── Header.tsx         # Header with theme toggle
│       ├── Footer.tsx         # Footer with tech badges
│       └── StatsCard.tsx      # Reusable stat cards
├── lib/
│   ├── mongodb.ts             # Database connection
│   ├── coingecko.ts           # API client
│   └── utils.ts               # Helper functions
└── types/
    └── index.ts               # TypeScript types
```

## Charts Overview

### TradingView Charts
- **PriceChart** - Line series for NEAR/USD price history
- **VolumeTimeChart** - Histogram series for volume over time

### Custom Charts
- **ExchangePieChart** - SVG donut chart for volume distribution
- **ExchangeBarChart** - CSS horizontal bars for exchange comparison

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prices` | GET | Current and historical prices |
| `/api/volumes` | GET | Volume distribution by exchange |
| `/api/cron/fetch-data` | POST | Fetch fresh data (requires auth) |

### Query Parameters

**GET /api/prices**
- `range`: `1h` | `24h` | `7d` | `30d` (default: `24h`)

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### GitHub Actions (Cron)

The `.github/workflows/fetch-data.yml` runs every 15 minutes to fetch fresh data.

Required secrets:
- `APP_URL`: Your Vercel deployment URL
- `CRON_SECRET`: Secret key for authentication

## Free Tier Limits

| Service | Limit | Usage |
|---------|-------|-------|
| CoinGecko API | 10,000 calls/month | ~192 calls/day |
| MongoDB Atlas M0 | 512 MB storage | Minimal |
| Vercel Hobby | 100 GB bandwidth | Minimal |
| GitHub Actions | 2,000 min/month | ~60 min/month |

## What I Learned

This project demonstrates:
- TradingView Lightweight Charts integration with React/Next.js
- Next.js 16 App Router patterns and API routes
- MongoDB Atlas with TypeScript
- CSS-in-JS theming with CSS variables
- Custom SVG chart creation
- GitHub Actions for scheduled tasks
- Responsive design with TailwindCSS v4

## License

MIT

---

**Data provided by [CoinGecko](https://www.coingecko.com/)**
