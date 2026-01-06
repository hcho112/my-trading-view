'use client';

// ============================================
// Dashboard.tsx - NEAR Trading Dashboard
// ============================================
// This is the main page that brings everything together.
// Let's learn how to:
// 1. Fetch data from our API using useEffect
// 2. Manage loading/error states
// 3. Connect the TradingView chart to real data
// 4. Handle time range selection

import { useEffect, useState, useCallback } from 'react';
import { PriceChart } from '@/components/charts/PriceChart';
import { ExchangePieChart } from '@/components/charts/ExchangePieChart';
import { ExchangeBarChart } from '@/components/charts/ExchangeBarChart';
import { VolumeTimeChart } from '@/components/charts/VolumeTimeChart';
import { Header } from '@/components/dashboard/Header';
import { Footer } from '@/components/dashboard/Footer';
import { StatsCard, StatsCardGrid } from '@/components/dashboard/StatsCard';
import { Time } from 'lightweight-charts';

// ☝️ CONCEPT 1: TypeScript interfaces for API responses
// Define the shape of data we expect from our API
interface PriceData {
  current: {
    usd: number;
    usd_24h_change: number;
    btc: number;
    btc_24h_change: number;
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
  historical: Array<{
    time: Time;
    value: number;
  }>;
}

// ☝️ CONCEPT 2: Exchange data for volume charts
interface ExchangeData {
  name: string;
  volume_usd: number;
  trust_score: 'green' | 'yellow' | 'red';
}

interface VolumeData {
  total_volume_24h: number;
  volume_change_24h: number;
  exchange_count: number;
  exchanges: ExchangeData[];
  top_exchange: {
    name: string;
    volume: number;
  };
}

// Volume history for time-series chart
interface VolumeHistoryData {
  historical: Array<{
    time: Time;
    value: number;
  }>;
}

// Time range options for the chart
type TimeRange = '1H' | '24H' | '7D' | '30D';

export default function Dashboard() {
  // ☝️ CONCEPT 2: State management for async data
  // We need to track: data, loading state, and errors
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null);
  const [volumeHistory, setVolumeHistory] = useState<VolumeHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24H');

  // ☝️ CONCEPT 3: Data fetching with useCallback
  // useCallback memoizes the function so it doesn't change on every render
  // This is important when the function is used as a dependency in useEffect
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prices, volumes, and volume history in parallel
      // Promise.all runs multiple promises concurrently - more efficient!
      // Note: API expects lowercase range (1h, 24h, 7d, 30d)
      const [pricesRes, volumesRes, volumeHistoryRes] = await Promise.all([
        fetch(`/api/prices?range=${selectedRange.toLowerCase()}`),
        fetch('/api/volumes'),
        fetch(`/api/volumes/history?range=${selectedRange.toLowerCase()}`),
      ]);

      // Check for HTTP errors
      if (!pricesRes.ok || !volumesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      // Parse JSON responses
      // ☝️ Our API returns: { success: boolean, data: {...}, timestamp: string }
      const pricesResponse = await pricesRes.json();
      const volumesResponse = await volumesRes.json();
      const volumeHistoryResponse = volumeHistoryRes.ok ? await volumeHistoryRes.json() : null;

      // Extract data from the standardized API response format
      const prices = pricesResponse.data;
      const volumes = volumesResponse.data;
      const volHistory = volumeHistoryResponse?.data;

      // The API already returns historical data in chart format:
      // { time: 'YYYY-MM-DD', value: number }
      // So we can use it directly!
      setPriceData({
        current: {
          usd: prices?.current?.near_usd || 0,
          usd_24h_change: prices?.current?.price_change_24h || 0,
          btc: prices?.current?.near_btc || 0,
          btc_24h_change: prices?.current?.near_btc_change_24h || 0,
          // New trader-focused metrics
          market_cap_rank: prices?.current?.market_cap_rank || 0,
          ath: prices?.current?.ath || 0,
          ath_change_percentage: prices?.current?.ath_change_percentage || 0,
          price_change_7d: prices?.current?.price_change_7d || 0,
          price_change_30d: prices?.current?.price_change_30d || 0,
          high_24h: prices?.current?.high_24h || 0,
          low_24h: prices?.current?.low_24h || 0,
          circulating_supply: prices?.current?.circulating_supply || 0,
        },
        historical: prices?.historical || [],
      });

      // ☝️ Process exchange data for volume charts
      const exchanges = volumes?.exchanges?.map((ex: { name?: string; exchange?: string; volume_usd: number; trust_score?: string }) => ({
        name: ex.name || ex.exchange || 'Unknown',
        volume_usd: ex.volume_usd || 0,
        trust_score: (ex.trust_score as 'green' | 'yellow' | 'red') || 'yellow',
      })) || [];

      setVolumeData({
        total_volume_24h: volumes?.total_volume_usd || 0,  // Fixed: API returns total_volume_usd
        volume_change_24h: volumes?.volume_change_24h || 0,
        exchange_count: exchanges.length,
        exchanges,
        top_exchange: exchanges[0]
          ? { name: exchanges[0].name, volume: exchanges[0].volume_usd }
          : { name: 'Unknown', volume: 0 },
      });

      // Set volume history for time-series chart
      setVolumeHistory({
        historical: volHistory?.historical || [],
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]); // Re-create when selectedRange changes

  // ☝️ CONCEPT 4: useEffect for data fetching
  // Runs on mount and whenever fetchData changes (i.e., when selectedRange changes)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ☝️ CONCEPT 5: Formatting helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(2)}M`;
    }
    return `$${(volume / 1_000).toFixed(2)}K`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // ☝️ CONCEPT 6: Handle time range selection
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    // Data will automatically refetch due to useEffect dependency
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ☝️ Using our new polished Header component */}
      <Header onRefresh={fetchData} loading={loading} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-negative/10 border border-negative/20">
            <div className="flex items-center gap-3">
              <span className="text-negative">Error: {error}</span>
              <button
                onClick={fetchData}
                className="text-sm underline text-negative hover:text-negative/80"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ☝️ Using our new StatsCard components with loading states */}
        <div className="mb-8">
          <StatsCardGrid>
            <StatsCard
              label="NEAR Price"
              value={formatPrice(priceData?.current.usd || 0)}
              change={priceData?.current.usd_24h_change}
              changeLabel="(24h)"
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="24h Volume"
              value={formatVolume(volumeData?.total_volume_24h || 0)}
              change={volumeData?.volume_change_24h}
              changeLabel="(24h)"
              loading={loading}
              subtitle={`${volumeData?.exchange_count || '--'} exchanges`}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatsCard
              label="NEAR/BTC"
              value={priceData?.current.btc?.toFixed(8) || '--'}
              change={priceData?.current.btc_24h_change}
              changeLabel="(24h)"
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
            />
            <StatsCard
              label="From ATH"
              value={priceData?.current.ath_change_percentage ? `${priceData.current.ath_change_percentage.toFixed(1)}%` : '--'}
              loading={loading}
              subtitle={priceData?.current.ath ? `ATH: ${formatPrice(priceData.current.ath)}` : undefined}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </StatsCardGrid>
        </div>

        {/* Second Row: Additional Trader Metrics */}
        <div className="mb-8">
          <StatsCardGrid>
            <StatsCard
              label="7D Change"
              value={priceData?.current.price_change_7d ? `${priceData.current.price_change_7d >= 0 ? '+' : ''}${priceData.current.price_change_7d.toFixed(2)}%` : '--'}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
            />
            <StatsCard
              label="30D Change"
              value={priceData?.current.price_change_30d ? `${priceData.current.price_change_30d >= 0 ? '+' : ''}${priceData.current.price_change_30d.toFixed(2)}%` : '--'}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatsCard
              label="24H Range"
              value={priceData?.current.high_24h && priceData?.current.low_24h
                ? `${formatPrice(priceData.current.low_24h)} - ${formatPrice(priceData.current.high_24h)}`
                : '--'}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              }
            />
            <StatsCard
              label="Market Rank"
              value={priceData?.current.market_cap_rank ? `#${priceData.current.market_cap_rank}` : '--'}
              loading={loading}
              subtitle="via CoinGecko"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
          </StatsCardGrid>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Price Chart - Now using real TradingView! */}
          <div className="p-4 rounded-lg bg-card border border-card-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                NEAR/USD Price
              </h2>
              {/* ☝️ CONCEPT 7: Time range selector buttons */}
              <div className="flex gap-2">
                {(['1H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedRange === range
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-border'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            {/* ☝️ CONCEPT 8: Passing data to the chart component */}
            <PriceChart
              data={priceData?.historical || []}
              height={300}
              loading={loading}
            />
          </div>

          {/* Volume Over Time Chart - TradingView Histogram */}
          <div className="p-4 rounded-lg bg-card border border-card-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                Trading Volume Over Time
              </h2>
              <div className="text-xs text-muted-foreground">
                {selectedRange} view
              </div>
            </div>
            <VolumeTimeChart
              data={volumeHistory?.historical || []}
              height={300}
              loading={loading}
            />
          </div>
        </div>

        {/* Exchange Distribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ☝️ CONCEPT 9: Exchange Volume Distribution - Custom SVG Pie Chart */}
          <div className="p-4 rounded-lg bg-card border border-card-border">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Exchange Volume Distribution
            </h2>
            <ExchangePieChart
              data={volumeData?.exchanges?.map((ex) => ({
                name: ex.name,
                value: ex.volume_usd,
              })) || []}
              height={300}
              loading={loading}
            />
          </div>

          {/* ☝️ CONCEPT 10: Exchange Bar Chart - CSS-based horizontal bars */}
          <div className="p-4 rounded-lg bg-card border border-card-border">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Top Exchanges by Volume
            </h2>
            <ExchangeBarChart
              data={volumeData?.exchanges?.map((ex) => ({
                name: ex.name,
                value: ex.volume_usd,
                trustScore: ex.trust_score,
              })) || []}
              height={280}
              loading={loading}
              maxBars={10}
            />
          </div>
        </div>

      </main>

      {/* ☝️ Using our new polished Footer component */}
      <Footer />
    </div>
  );
}
