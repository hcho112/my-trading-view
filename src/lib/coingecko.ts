// ============================================
// CoinGecko API Client
// ============================================
// Handles all interactions with CoinGecko API
// Free Demo tier: 30 calls/min, 10,000 calls/month

import type {
  CoinGeckoPriceResponse,
  CoinGeckoTickersResponse,
  CoinGeckoCoinResponse,
  PriceDocument,
  VolumeDocument,
  ExchangeVolume,
} from '@/types';

// ============================================
// Configuration
// ============================================

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Rate limiting: Track calls to stay within limits
let callCount = 0;
let lastResetTime = Date.now();

const RATE_LIMIT = {
  CALLS_PER_MINUTE: 25, // Leave buffer from 30 limit
  RESET_INTERVAL: 60 * 1000, // 1 minute in ms
};

// ============================================
// Rate Limiting
// ============================================

/**
 * Check and update rate limit counter
 */
function checkRateLimit(): boolean {
  const now = Date.now();

  // Reset counter if minute has passed
  if (now - lastResetTime > RATE_LIMIT.RESET_INTERVAL) {
    callCount = 0;
    lastResetTime = now;
  }

  if (callCount >= RATE_LIMIT.CALLS_PER_MINUTE) {
    return false;
  }

  callCount++;
  return true;
}

/**
 * Wait for rate limit to reset
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeUntilReset = RATE_LIMIT.RESET_INTERVAL - (now - lastResetTime);

  if (timeUntilReset > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeUntilReset + 100));
    callCount = 0;
    lastResetTime = Date.now();
  }
}

// ============================================
// API Helpers
// ============================================

/**
 * Make a rate-limited API request to CoinGecko
 */
async function fetchFromCoinGecko<T>(endpoint: string): Promise<T> {
  if (!checkRateLimit()) {
    await waitForRateLimit();
  }

  const url = `${COINGECKO_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 0 }, // Don't cache API responses
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited - wait and retry
      await waitForRateLimit();
      return fetchFromCoinGecko<T>(endpoint);
    }

    throw new Error(
      `CoinGecko API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// ============================================
// Price Data
// ============================================

/**
 * Fetch current prices for NEAR, BTC, ETH
 */
export async function fetchPrices(): Promise<CoinGeckoPriceResponse> {
  const data = await fetchFromCoinGecko<CoinGeckoPriceResponse>(
    '/simple/price?ids=near,bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
  );

  return data;
}

/**
 * Fetch rich market data for NEAR from /coins/near endpoint
 * Includes: ATH, 7d/30d change, market cap rank, 24h high/low, supply
 */
export async function fetchCoinData(): Promise<CoinGeckoCoinResponse> {
  const data = await fetchFromCoinGecko<CoinGeckoCoinResponse>(
    '/coins/near?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false'
  );

  return data;
}

/**
 * Transform CoinGecko price response to our PriceDocument format
 * Now accepts optional coin data for rich market metrics
 */
export function transformPriceData(
  data: CoinGeckoPriceResponse,
  coinData?: CoinGeckoCoinResponse
): Omit<PriceDocument, '_id'> {
  const nearUsd = data.near.usd;
  const btcUsd = data.bitcoin.usd;
  const ethUsd = data.ethereum.usd;

  const baseData = {
    timestamp: new Date(),
    near_usd: nearUsd,
    btc_usd: btcUsd,
    eth_usd: ethUsd,
    near_btc: nearUsd / btcUsd,
    near_eth: nearUsd / ethUsd,
    market_cap: data.near.usd_market_cap,
    volume_24h: data.near.usd_24h_vol,
    price_change_24h: data.near.usd_24h_change,
  };

  // Add rich market data if available
  if (coinData?.market_data) {
    const md = coinData.market_data;
    return {
      ...baseData,
      market_cap_rank: coinData.market_cap_rank,
      ath: md.ath?.usd,
      ath_change_percentage: md.ath_change_percentage?.usd,
      ath_date: md.ath_date?.usd,
      atl: md.atl?.usd,
      atl_change_percentage: md.atl_change_percentage?.usd,
      price_change_7d: md.price_change_percentage_7d,
      price_change_30d: md.price_change_percentage_30d,
      high_24h: md.high_24h?.usd,
      low_24h: md.low_24h?.usd,
      circulating_supply: md.circulating_supply,
      total_supply: md.total_supply,
      fully_diluted_valuation: md.fully_diluted_valuation?.usd,
    };
  }

  return baseData;
}

// ============================================
// Volume Data
// ============================================

/**
 * Fetch NEAR tickers from all exchanges
 */
export async function fetchTickers(): Promise<CoinGeckoTickersResponse> {
  // Fetch tickers - CoinGecko returns paginated results
  // For free tier, we'll just get the first page (100 results)
  const data = await fetchFromCoinGecko<CoinGeckoTickersResponse>(
    '/coins/near/tickers?include_exchange_logo=false&depth=false'
  );

  return data;
}

/**
 * Transform CoinGecko tickers to our VolumeDocument format
 */
export function transformVolumeData(
  data: CoinGeckoTickersResponse
): Omit<VolumeDocument, '_id'> {
  // Aggregate volume by exchange
  const exchangeMap = new Map<string, ExchangeVolume>();

  for (const ticker of data.tickers) {
    // Skip anomalous or stale data
    if (ticker.is_anomaly || ticker.is_stale) {
      continue;
    }

    const exchangeName = ticker.market.name;
    const existing = exchangeMap.get(exchangeName);

    if (existing) {
      // Add to existing exchange data
      existing.volume_usd += ticker.converted_volume.usd;
      existing.volume_near += ticker.volume;
      if (!existing.trading_pairs.includes(`${ticker.base}/${ticker.target}`)) {
        existing.trading_pairs.push(`${ticker.base}/${ticker.target}`);
      }
    } else {
      // Create new exchange entry
      exchangeMap.set(exchangeName, {
        name: exchangeName,
        volume_usd: ticker.converted_volume.usd,
        volume_near: ticker.volume,
        trading_pairs: [`${ticker.base}/${ticker.target}`],
        trust_score: ticker.trust_score,
        trade_url: ticker.trade_url || undefined,
      });
    }
  }

  // Convert to array and sort by volume
  const exchanges = Array.from(exchangeMap.values()).sort(
    (a, b) => b.volume_usd - a.volume_usd
  );

  // Calculate totals
  const totalVolumeUsd = exchanges.reduce((sum, e) => sum + e.volume_usd, 0);
  const totalVolumeNear = exchanges.reduce((sum, e) => sum + e.volume_near, 0);

  return {
    timestamp: new Date(),
    total_volume_usd: totalVolumeUsd,
    total_volume_near: totalVolumeNear,
    exchange_count: exchanges.length,
    exchanges: exchanges.slice(0, 20), // Keep top 20 exchanges
  };
}

// ============================================
// Combined Fetch
// ============================================

/**
 * Fetch all data needed for the dashboard
 * Makes 3 API calls total:
 * - /simple/price for basic prices
 * - /coins/near for rich market data (ATH, 7d change, rank, etc.)
 * - /coins/near/tickers for exchange volumes
 */
export async function fetchAllData(): Promise<{
  prices: Omit<PriceDocument, '_id'>;
  volumes: Omit<VolumeDocument, '_id'>;
}> {
  const [priceData, coinData, tickerData] = await Promise.all([
    fetchPrices(),
    fetchCoinData(),
    fetchTickers(),
  ]);

  return {
    prices: transformPriceData(priceData, coinData),
    volumes: transformVolumeData(tickerData),
  };
}

// ============================================
// API Usage Tracking
// ============================================

/**
 * Get current API call count for this session
 */
export function getApiCallCount(): number {
  return callCount;
}

/**
 * Reset API call counter (for testing)
 */
export function resetApiCallCount(): void {
  callCount = 0;
  lastResetTime = Date.now();
}
