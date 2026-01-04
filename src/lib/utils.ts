// ============================================
// Utility Functions
// ============================================

import { UI_CONFIG } from './constants';

// ============================================
// Number Formatting
// ============================================

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, decimals?: number): string {
  const dec = decimals ?? UI_CONFIG.CURRENCY_DECIMALS;

  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return `$${value.toFixed(dec)}`;
}

/**
 * Format a crypto price with appropriate decimals
 */
export function formatCryptoPrice(value: number): string {
  if (value >= 1) {
    return `$${value.toFixed(UI_CONFIG.CURRENCY_DECIMALS)}`;
  }

  if (value >= 0.01) {
    return `$${value.toFixed(4)}`;
  }

  return `$${value.toFixed(UI_CONFIG.CRYPTO_DECIMALS)}`;
}

/**
 * Format a percentage change
 */
export function formatPercentage(value: number): string {
  const formatted = value.toFixed(UI_CONFIG.PERCENTAGE_DECIMALS);
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatted}%`;
}

/**
 * Format a large number with abbreviation
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }

  return value.toFixed(2);
}

/**
 * Format a ratio (e.g., NEAR/BTC)
 */
export function formatRatio(value: number): string {
  if (value >= 1) {
    return value.toFixed(4);
  }

  // For small ratios, use scientific notation or more decimals
  if (value >= 0.0001) {
    return value.toFixed(6);
  }

  return value.toExponential(2);
}

// ============================================
// Date/Time Formatting
// ============================================

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date for TradingView charts
 */
export function formatDateForChart(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Format a timestamp to relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

/**
 * Get time range start date based on range string
 */
export function getTimeRangeStart(range: string): Date {
  const now = new Date();

  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

// ============================================
// CSS/Styling Helpers
// ============================================

/**
 * Get CSS class for price change (positive/negative)
 */
export function getPriceChangeClass(change: number): string {
  if (change > 0) return 'text-positive';
  if (change < 0) return 'text-negative';
  return 'text-neutral';
}

/**
 * Combine class names (simple cn utility)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================
// Data Helpers
// ============================================

/**
 * Calculate percentage of total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Get top N items from an array
 */
export function getTopN<T>(
  items: T[],
  n: number,
  getValue: (item: T) => number
): T[] {
  return [...items].sort((a, b) => getValue(b) - getValue(a)).slice(0, n);
}

/**
 * Group items and sum values
 */
export function groupAndSum<T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number
): Map<string, number> {
  const result = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);
    const value = getValue(item);
    result.set(key, (result.get(key) || 0) + value);
  }

  return result;
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate cron secret from request headers
 */
export function validateCronSecret(authHeader: string | null): boolean {
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return token === expectedSecret;
}

/**
 * Check if a value is a valid time range
 */
export function isValidTimeRange(value: string): value is '1h' | '24h' | '7d' | '30d' {
  return ['1h', '24h', '7d', '30d'].includes(value);
}
