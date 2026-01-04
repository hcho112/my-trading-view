// ============================================
// ExchangeBarChart.tsx - Horizontal Bar Chart
// ============================================
// TradingView's Histogram series is designed for time-series volume data,
// not categorical comparisons like "exchange vs exchange".
//
// For this use case, a simple CSS-based bar chart is:
// 1. More appropriate (categorical data)
// 2. Lighter weight (no extra library)
// 3. Fully customizable (colors, animations, interactions)
// 4. Educational (teaches CSS fundamentals)

'use client';

import { useMemo, useState } from 'react';

interface BarDataPoint {
  name: string;
  value: number;
  color?: string;
  trustScore?: 'green' | 'yellow' | 'red';
}

interface ExchangeBarChartProps {
  data: BarDataPoint[];
  height?: number;
  loading?: boolean;
  maxBars?: number;
}

// ☝️ CONCEPT 1: Trust score colors
// CoinGecko provides trust scores for exchanges
const TRUST_COLORS = {
  green: '#3fb950',
  yellow: '#f0883e',
  red: '#f85149',
};

export function ExchangeBarChart({
  data,
  height = 250,
  loading = false,
  maxBars = 10,
}: ExchangeBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ☝️ CONCEPT 2: Process and sort data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { bars: [], maxValue: 0 };

    // Sort by value descending and take top N
    const sorted = [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxBars);

    // Find max value for scaling bars
    const maxValue = Math.max(...sorted.map((d) => d.value));

    return {
      bars: sorted.map((item) => ({
        ...item,
        // ☝️ CONCEPT 3: Calculate bar width as percentage
        widthPercent: (item.value / maxValue) * 100,
        color: item.trustScore
          ? TRUST_COLORS[item.trustScore]
          : '#58a6ff',
      })),
      maxValue,
    };
  }, [data, maxBars]);

  // ☝️ CONCEPT 4: Format volume numbers
  const formatVolume = (value: number): string => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading chart...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    );
  }

  // Calculate bar height based on available space
  const barHeight = Math.min(24, (height - 20) / chartData.bars.length - 8);

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      {/* ☝️ CONCEPT 5: Flexbox layout for bars */}
      <div className="flex flex-col gap-2 h-full overflow-y-auto pr-2">
        {chartData.bars.map((bar, index) => (
          <div
            key={bar.name}
            className={`flex items-center gap-3 transition-opacity ${
              hoveredIndex === null || hoveredIndex === index
                ? 'opacity-100'
                : 'opacity-50'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Exchange name - fixed width for alignment */}
            <div className="w-24 flex-shrink-0 text-right">
              <span className="text-sm text-foreground truncate block">
                {bar.name}
              </span>
            </div>

            {/* ☝️ CONCEPT 6: Bar container with relative positioning */}
            <div className="flex-1 relative">
              {/* Background track */}
              <div className="absolute inset-0 bg-muted/30 rounded" />

              {/* ☝️ CONCEPT 7: Animated bar with CSS transition */}
              <div
                className="relative rounded transition-all duration-500 ease-out"
                style={{
                  width: `${bar.widthPercent}%`,
                  height: `${barHeight}px`,
                  backgroundColor: bar.color,
                  // ☝️ CONCEPT 8: Scale effect on hover
                  transform: hoveredIndex === index ? 'scaleY(1.1)' : 'scaleY(1)',
                }}
              />
            </div>

            {/* Volume value */}
            <div className="w-20 flex-shrink-0 text-right">
              <span className="text-sm text-muted-foreground">
                {formatVolume(bar.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ☝️ CONCEPT 9: Legend for trust scores */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>Trust Score:</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-positive" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f0883e' }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-negative" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUMMARY - CSS Bar Chart Concepts:
// ============================================
// 1. Use CSS for categorical data, TradingView for time-series
// 2. Flexbox provides easy alignment for horizontal bars
// 3. Percentage width creates proportional bars
// 4. CSS transitions add smooth animations
// 5. transform: scale() creates hover effects
// 6. Trust scores add meaningful color coding
// 7. Fixed-width labels ensure consistent alignment
// ============================================
