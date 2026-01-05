import { NextResponse } from 'next/server';
import { getVolumesCollection } from '@/lib/mongodb';
import { calculatePercentage } from '@/lib/utils';
import { EXCHANGE_CONFIG } from '@/lib/constants';
import type { ApiResponse, VolumesApiResponse, ExchangePieData } from '@/types';

/**
 * GET /api/volumes
 *
 * Returns volume data including exchange distribution
 */
export async function GET(): Promise<NextResponse> {
  try {
    const volumesCollection = await getVolumesCollection();

    // Get the most recent volume data
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

    // Get oldest volume from 24h ago to calculate change
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldestVolume = await volumesCollection.findOne(
      { timestamp: { $gte: twentyFourHoursAgo } },
      { sort: { timestamp: 1 } }
    );

    let volumeChange24h = 0;
    if (oldestVolume && oldestVolume.total_volume_usd) {
      const oldVolume = oldestVolume.total_volume_usd;
      const newVolume = latestVolume.total_volume_usd;
      volumeChange24h = ((newVolume - oldVolume) / oldVolume) * 100;
    }

    // Calculate distribution percentages for pie chart
    const distribution: ExchangePieData[] = latestVolume.exchanges
      .slice(0, EXCHANGE_CONFIG.MAX_DISPLAY_EXCHANGES)
      .map((exchange, index) => ({
        name: exchange.name,
        value: exchange.volume_usd,
        percentage: calculatePercentage(
          exchange.volume_usd,
          latestVolume.total_volume_usd
        ),
        color: EXCHANGE_CONFIG.EXCHANGE_COLORS[index],
      }));

    // Add "Others" category if there are more exchanges
    if (latestVolume.exchanges.length > EXCHANGE_CONFIG.MAX_DISPLAY_EXCHANGES) {
      const othersVolume = latestVolume.exchanges
        .slice(EXCHANGE_CONFIG.MAX_DISPLAY_EXCHANGES)
        .reduce((sum, e) => sum + e.volume_usd, 0);

      distribution.push({
        name: 'Others',
        value: othersVolume,
        percentage: calculatePercentage(othersVolume, latestVolume.total_volume_usd),
        color: '#484f58',
      });
    }

    const response: ApiResponse<VolumesApiResponse> = {
      success: true,
      data: {
        total_volume_usd: latestVolume.total_volume_usd,
        total_volume_near: latestVolume.total_volume_near,
        volume_change_24h: volumeChange24h,
        exchange_count: latestVolume.exchange_count,
        exchanges: latestVolume.exchanges,
        distribution,
        lastUpdated: latestVolume.timestamp.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching volumes:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch volumes',
        timestamp: new Date().toISOString(),
      } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
