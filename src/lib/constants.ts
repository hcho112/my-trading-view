// ============================================
// Application Constants
// ============================================

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  // CoinGecko limits
  COINGECKO_CALLS_PER_MINUTE: 30,
  COINGECKO_CALLS_PER_MONTH: 10000,

  // Our fetch interval (in minutes)
  FETCH_INTERVAL_MINUTES: 15,

  // Calculated daily/monthly usage
  get DAILY_API_CALLS() {
    return (24 * 60) / this.FETCH_INTERVAL_MINUTES * 2; // 2 calls per fetch
  },
  get MONTHLY_API_CALLS() {
    return this.DAILY_API_CALLS * 30;
  },
} as const;

// ============================================
// Chart Configuration
// ============================================

export const CHART_CONFIG = {
  // Default time ranges
  TIME_RANGES: ['1h', '24h', '7d', '30d'] as const,
  DEFAULT_TIME_RANGE: '24h' as const,

  // Chart dimensions
  DEFAULT_HEIGHT: 400,
  MOBILE_HEIGHT: 300,

  // Colors (matching CSS variables)
  COLORS: {
    line: '#58a6ff',
    positive: '#3fb950',
    negative: '#f85149',
    neutral: '#8b949e',
    grid: '#21262d',
    crosshair: '#484f58',
  },

  // Update interval for real-time feel (ms)
  REFRESH_INTERVAL: 60000, // 1 minute
} as const;

// ============================================
// Exchange Configuration
// ============================================

export const EXCHANGE_CONFIG = {
  // Top exchanges we're most interested in
  PRIORITY_EXCHANGES: [
    'Binance',
    'Coinbase Exchange',
    'OKX',
    'Bybit',
    'Kraken',
    'KuCoin',
    'Gate.io',
    'HTX',
    'Bitfinex',
    'Crypto.com Exchange',
  ],

  // Colors for pie chart (top 10 exchanges)
  EXCHANGE_COLORS: [
    '#58a6ff', // Blue
    '#3fb950', // Green
    '#f85149', // Red
    '#a371f7', // Purple
    '#db61a2', // Pink
    '#f0883e', // Orange
    '#8b949e', // Gray
    '#7ee787', // Light Green
    '#79c0ff', // Light Blue
    '#d2a8ff', // Light Purple
  ],

  // Maximum exchanges to show in charts
  MAX_DISPLAY_EXCHANGES: 10,
} as const;

// ============================================
// Data Retention
// ============================================

export const DATA_RETENTION = {
  // How long to keep full granularity data (days)
  FULL_GRANULARITY_DAYS: 30,

  // How long to keep hourly aggregates (days)
  HOURLY_AGGREGATE_DAYS: 90,

  // MongoDB TTL (in seconds)
  TTL_SECONDS: 90 * 24 * 60 * 60, // 90 days
} as const;

// ============================================
// UI Configuration
// ============================================

export const UI_CONFIG = {
  // Number formatting
  CURRENCY_DECIMALS: 2,
  CRYPTO_DECIMALS: 6,
  PERCENTAGE_DECIMALS: 2,

  // Large number formatting threshold
  LARGE_NUMBER_THRESHOLD: 1000000,

  // Animation durations (ms)
  ANIMATION_DURATION: 300,
  CHART_ANIMATION_DURATION: 750,

  // Breakpoints (matching Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  DATABASE_CONNECTION: 'Failed to connect to database',
  API_FETCH_FAILED: 'Failed to fetch data from CoinGecko',
  RATE_LIMITED: 'API rate limit exceeded, please try again later',
  INVALID_TIME_RANGE: 'Invalid time range specified',
  NO_DATA_AVAILABLE: 'No data available for the requested period',
  CRON_UNAUTHORIZED: 'Unauthorized cron request',
} as const;

// ============================================
// Routes
// ============================================

export const ROUTES = {
  HOME: '/',
  LEARN: '/learn',
  API: {
    PRICES: '/api/prices',
    VOLUMES: '/api/volumes',
    CRON_FETCH: '/api/cron/fetch-data',
  },
} as const;
