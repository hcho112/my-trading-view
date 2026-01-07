import { NextRequest, NextResponse } from 'next/server';
import { getVolumesCollection } from '@/lib/mongodb';
import { getTimeRangeStart, isValidTimeRange } from '@/lib/utils';
import type { ApiResponse } from '@/types';

/**
 * Exchange Volume History - time series data for top exchanges
 */
interface ExchangeTimeSeries {
  name: string;
  color: string;
  data: Array<{
    time: number; // Unix timestamp
    value: number; // Volume USD
  }>;
}

interface ExchangeVolumeHistoryResponse {
  exchanges: ExchangeTimeSeries[];
  timestamps: number[];
  lastUpdated: string;
}

// Colors for top exchanges (matching pie chart)
const EXCHANGE_COLORS = [
  '#58a6ff', // Blue
  '#3fb950', // Green
  '#f0883e', // Orange
  '#a371f7', // Purple
  '#f85149', // Red
  '#8b949e', // Gray
  '#79c0ff', // Light blue
  '#7ee787', // Light green
];

/**
 * GET /api/volumes/history/exchanges
 *
 * Returns historical volume data per exchange for trend analysis
 *
 * Query params:
 * - range: '1h' | '24h' | '7d' | '30d' (default: '24h')
 * - limit: number of top exchanges to include (default: 5, max: 8)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 8);

    // Validate range
    if (!isValidTimeRange(range)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid time range. Use: 1h, 24h, 7d, or 30d',
          timestamp: new Date().toISOString(),
        } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    const volumesCollection = await getVolumesCollection();

    // Get historical data for the specified range
    const startDate = getTimeRangeStart(range);
    const historicalVolumes = await volumesCollection
      .find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: 1 })
      .toArray();

    if (!historicalVolumes || historicalVolumes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No volume history available',
          timestamp: new Date().toISOString(),
        } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    // Identify top exchanges by total volume across all time points
    const exchangeTotals = new Map<string, number>();
    for (const doc of historicalVolumes) {
      for (const exchange of doc.exchanges || []) {
        const current = exchangeTotals.get(exchange.name) || 0;
        exchangeTotals.set(exchange.name, current + exchange.volume_usd);
      }
    }

    // Sort and get top N exchanges
    const topExchanges = Array.from(exchangeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name]) => name);

    // Build time series for each top exchange
    const timestamps: number[] = [];
    const exchangeData = new Map<string, Array<{ time: number; value: number }>>();

    // Initialize data arrays for each exchange
    for (const name of topExchanges) {
      exchangeData.set(name, []);
    }

    // Process each historical document
    for (const doc of historicalVolumes) {
      const time = Math.floor(doc.timestamp.getTime() / 1000);
      timestamps.push(time);

      // Create a map of exchange volumes for this time point
      const volumeMap = new Map<string, number>();
      for (const exchange of doc.exchanges || []) {
        volumeMap.set(exchange.name, exchange.volume_usd);
      }

      // Add data point for each top exchange
      for (const name of topExchanges) {
        const data = exchangeData.get(name)!;
        data.push({
          time,
          value: volumeMap.get(name) || 0,
        });
      }
    }

    // Build response
    const exchanges: ExchangeTimeSeries[] = topExchanges.map((name, index) => ({
      name,
      color: EXCHANGE_COLORS[index],
      data: exchangeData.get(name)!,
    }));

    const response: ApiResponse<ExchangeVolumeHistoryResponse> = {
      success: true,
      data: {
        exchanges,
        timestamps: [...new Set(timestamps)], // Unique timestamps
        lastUpdated: historicalVolumes[historicalVolumes.length - 1].timestamp.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching exchange volume history:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exchange volume history',
        timestamp: new Date().toISOString(),
      } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
