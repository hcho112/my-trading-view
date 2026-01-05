import { NextRequest, NextResponse } from 'next/server';
import { getPricesCollection } from '@/lib/mongodb';
import { getTimeRangeStart, isValidTimeRange } from '@/lib/utils';
import type { ApiResponse, PricesApiResponse, ChartDataPoint } from '@/types';

/**
 * GET /api/prices
 *
 * Returns price data for the dashboard
 *
 * Query params:
 * - range: '1h' | '24h' | '7d' | '30d' (default: '24h')
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

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

    const pricesCollection = await getPricesCollection();

    // Get the most recent price
    const latestPrice = await pricesCollection.findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestPrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'No price data available',
          timestamp: new Date().toISOString(),
        } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get historical data for the chart
    const startDate = getTimeRangeStart(range);
    const historicalPrices = await pricesCollection
      .find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: 1 })
      .toArray();

    // Transform to chart data format
    // Use Unix timestamps for intraday (1h, 24h) to show each data point
    // Use YYYY-MM-DD for longer ranges (7d, 30d) for cleaner display
    const useUnixTimestamp = range === '1h' || range === '24h';

    const historical: ChartDataPoint[] = historicalPrices.map((doc) => ({
      time: useUnixTimestamp
        ? Math.floor(doc.timestamp.getTime() / 1000) // Unix timestamp in seconds
        : doc.timestamp.toISOString().split('T')[0],  // YYYY-MM-DD
      value: doc.near_usd,
    }));

    const response: ApiResponse<PricesApiResponse> = {
      success: true,
      data: {
        current: {
          near_usd: latestPrice.near_usd,
          btc_usd: latestPrice.btc_usd,
          eth_usd: latestPrice.eth_usd,
          near_btc: latestPrice.near_btc,
          near_eth: latestPrice.near_eth,
          price_change_24h: latestPrice.price_change_24h || 0,
          market_cap: latestPrice.market_cap || 0,
          volume_24h: latestPrice.volume_24h || 0,
        },
        historical,
        lastUpdated: latestPrice.timestamp.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching prices:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices',
        timestamp: new Date().toISOString(),
      } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
