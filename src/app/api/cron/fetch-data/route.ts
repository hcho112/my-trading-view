import { NextRequest, NextResponse } from 'next/server';
import { validateCronSecret } from '@/lib/utils';
import { fetchAllData } from '@/lib/coingecko';
import { getPricesCollection, getVolumesCollection, getMetadataCollection } from '@/lib/mongodb';
import type { FetchDataResult } from '@/types';

/**
 * POST /api/cron/fetch-data
 *
 * Cron endpoint called by GitHub Actions every 15 minutes.
 * Fetches data from CoinGecko and stores in MongoDB.
 *
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate cron secret
    const authHeader = request.headers.get('authorization');
    if (!validateCronSecret(authHeader)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting data fetch...');

    // Fetch data from CoinGecko
    const { prices, volumes } = await fetchAllData();

    console.log('[Cron] Data fetched successfully');
    console.log(`[Cron] NEAR Price: $${prices.near_usd}`);
    console.log(`[Cron] Exchanges: ${volumes.exchange_count}`);

    // Store in MongoDB
    const pricesCollection = await getPricesCollection();
    const volumesCollection = await getVolumesCollection();
    const metadataCollection = await getMetadataCollection();

    // Insert price document
    const priceResult = await pricesCollection.insertOne({
      ...prices,
      timestamp: new Date(),
    });

    // Insert volume document
    const volumeResult = await volumesCollection.insertOne({
      ...volumes,
      timestamp: new Date(),
    });

    // Update metadata (3 API calls: /simple/price, /coins/near, /coins/near/tickers)
    const today = new Date().toISOString().split('T')[0];
    await metadataCollection.updateOne(
      { key: 'api_usage' },
      {
        $set: { last_updated: new Date() },
        $inc: { api_calls_today: 3, api_calls_month: 3 },
        $setOnInsert: { key: 'api_usage', last_reset_date: new Date(today) },
      },
      { upsert: true }
    );

    // Check if we need to reset daily counter
    const metadata = await metadataCollection.findOne({ key: 'api_usage' });
    if (metadata && metadata.last_reset_date) {
      const lastResetDay = metadata.last_reset_date.toISOString().split('T')[0];
      if (lastResetDay !== today) {
        await metadataCollection.updateOne(
          { key: 'api_usage' },
          {
            $set: {
              api_calls_today: 3,
              last_reset_date: new Date(today),
            },
          }
        );
      }
    }

    const result: FetchDataResult = {
      success: true,
      pricesStored: priceResult.acknowledged ? 1 : 0,
      volumesStored: volumeResult.acknowledged ? 1 : 0,
    };

    console.log('[Cron] Data stored successfully');

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Cron] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        pricesStored: 0,
        volumesStored: 0,
      } satisfies FetchDataResult,
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/fetch-data
 *
 * Health check endpoint - returns cron configuration info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/cron/fetch-data',
    method: 'POST',
    description: 'Fetches NEAR data from CoinGecko and stores in MongoDB',
    schedule: 'Every 15 minutes via GitHub Actions',
    authentication: 'Bearer token required (CRON_SECRET)',
  });
}
