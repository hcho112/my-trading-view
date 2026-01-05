// ============================================
// NEAR Trading Dashboard - Type Definitions
// ============================================

import { ObjectId } from 'mongodb';

// ============================================
// Database Document Types
// ============================================

/**
 * Price data stored in MongoDB
 */
export interface PriceDocument {
  _id?: ObjectId;
  timestamp: Date;
  near_usd: number;
  btc_usd: number;
  eth_usd: number;
  near_btc: number;
  near_eth: number;
  market_cap?: number;
  volume_24h?: number;
  price_change_24h?: number;
  // New fields from /coins/near endpoint
  market_cap_rank?: number;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  atl?: number;
  atl_change_percentage?: number;
  price_change_7d?: number;
  price_change_30d?: number;
  high_24h?: number;
  low_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  fully_diluted_valuation?: number;
}

/**
 * Volume data for a single exchange
 */
export interface ExchangeVolume {
  name: string;
  volume_usd: number;
  volume_near: number;
  trading_pairs: string[];
  trust_score: string | null;
  trade_url?: string;
}

/**
 * Volume document stored in MongoDB
 */
export interface VolumeDocument {
  _id?: ObjectId;
  timestamp: Date;
  total_volume_usd: number;
  total_volume_near: number;
  exchange_count: number;
  exchanges: ExchangeVolume[];
}

/**
 * Metadata document for tracking API usage and sync status
 */
export interface MetadataDocument {
  _id?: ObjectId;
  key: string;
  last_updated: Date;
  api_calls_today: number;
  api_calls_month: number;
  last_reset_date: Date;
}

// ============================================
// API Response Types
// ============================================

/**
 * CoinGecko /simple/price response
 */
export interface CoinGeckoPriceResponse {
  near: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
  };
  bitcoin: {
    usd: number;
  };
  ethereum: {
    usd: number;
  };
}

/**
 * CoinGecko /coins/{id}/tickers response - single ticker
 */
export interface CoinGeckoTicker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_last: {
    btc: number;
    eth: number;
    usd: number;
  };
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string | null;
  bid_ask_spread_percentage: number | null;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string | null;
  coin_id: string;
  target_coin_id?: string;
}

/**
 * CoinGecko /coins/{id}/tickers full response
 */
export interface CoinGeckoTickersResponse {
  name: string;
  tickers: CoinGeckoTicker[];
}

/**
 * CoinGecko /coins/{id} response - rich market data
 */
export interface CoinGeckoCoinResponse {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_change_percentage: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    fully_diluted_valuation: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number;
    total_supply: number;
  };
}

// ============================================
// Frontend/Chart Types
// ============================================

/**
 * Data point for TradingView line chart
 * TradingView accepts:
 * - string: 'YYYY-MM-DD' format for daily data
 * - number: Unix timestamp (seconds) for intraday data
 */
export interface ChartDataPoint {
  time: string | number;
  value: number;
}

/**
 * Data point for volume bar chart
 */
export interface VolumeBarData {
  exchange: string;
  volume_usd: number;
  volume_near: number;
  percentage: number;
}

/**
 * Data for pie chart showing exchange distribution
 */
export interface ExchangePieData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

/**
 * Dashboard stats card data
 */
export interface DashboardStats {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent: number;
  totalVolume24h: number;
  marketCap: number;
  nearBtcRatio: number;
  nearEthRatio: number;
  topExchange: string;
  exchangeCount: number;
  lastUpdated: Date;
}

// ============================================
// API Route Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PricesApiResponse {
  current: {
    near_usd: number;
    btc_usd: number;
    eth_usd: number;
    near_btc: number;
    near_eth: number;
    price_change_24h: number;
    near_btc_change_24h: number;
    market_cap: number;
    volume_24h: number;
    // New trader-focused metrics
    market_cap_rank: number;
    ath: number;
    ath_change_percentage: number;
    price_change_7d: number;
    price_change_30d: number;
    high_24h: number;
    low_24h: number;
    circulating_supply: number;
  };
  historical: ChartDataPoint[];
  lastUpdated: string;
}

export interface VolumesApiResponse {
  total_volume_usd: number;
  total_volume_near: number;
  volume_change_24h: number;
  exchange_count: number;
  exchanges: ExchangeVolume[];
  distribution: ExchangePieData[];
  lastUpdated: string;
}

// ============================================
// Utility Types
// ============================================

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface FetchDataResult {
  success: boolean;
  pricesStored: number;
  volumesStored: number;
  error?: string;
}
