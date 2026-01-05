import { NextRequest, NextResponse } from 'next/server';
import { getVolumesCollection } from '@/lib/mongodb';
import { getTimeRangeStart, isValidTimeRange } from '@/lib/utils';
import type { ApiResponse, ChartDataPoint } from '@/types';

/**
 * Volume History API Response
 */
interface VolumeHistoryResponse {
  historical: ChartDataPoint[];
  lastUpdated: string;
}

/**
 * GET /api/volumes/history
 *
 * Returns historical volume data for time-series charts
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

    const volumesCollection = await getVolumesCollection();

    // Get the most recent volume for lastUpdated
    const latestVolume = await volumesCollection.findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestVolume) {
      return NextResponse.json(
        {
          success: false,
          error: 'No volume data available',
          timestamp: new Date().toISOString(),
        } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get historical data for the chart
    const startDate = getTimeRangeStart(range);
    const historicalVolumes = await volumesCollection
      .find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: 1 })
      .toArray();

    // Transform to chart data format
    // Use Unix timestamps for intraday (1h, 24h) to show each data point
    // Use YYYY-MM-DD for longer ranges (7d, 30d) for cleaner display
    const useUnixTimestamp = range === '1h' || range === '24h';

    const historical: ChartDataPoint[] = historicalVolumes.map((doc) => ({
      time: useUnixTimestamp
        ? Math.floor(doc.timestamp.getTime() / 1000) // Unix timestamp in seconds
        : doc.timestamp.toISOString().split('T')[0],  // YYYY-MM-DD
      value: doc.total_volume_usd,
    }));

    const response: ApiResponse<VolumeHistoryResponse> = {
      success: true,
      data: {
        historical,
        lastUpdated: latestVolume.timestamp.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching volume history:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch volume history',
        timestamp: new Date().toISOString(),
      } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
