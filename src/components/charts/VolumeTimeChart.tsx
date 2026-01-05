// ============================================
// VolumeTimeChart.tsx - TradingView Histogram Series
// ============================================
// NOW we're using TradingView properly!
// Histogram series is perfect for time-series volume data.
//
// This chart shows trading volume over time - exactly what
// TradingView Lightweight Charts was designed for.

'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramSeries,
  Time,
  HistogramData,
} from 'lightweight-charts';

// ☝️ CONCEPT 1: Histogram data point structure
// Same as line chart but with optional color per bar
interface VolumeDataPoint {
  time: Time;
  value: number;
  color?: string;
}

interface VolumeTimeChartProps {
  data: VolumeDataPoint[];
  height?: number;
  loading?: boolean;
}

export function VolumeTimeChart({
  data,
  height = 200,
  loading = false,
}: VolumeTimeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // ☝️ CONCEPT 2: Chart colors matching our theme
  const chartColors = {
    backgroundColor: 'transparent',
    volumeUp: '#3fb950',      // Green for high volume
    volumeDown: '#58a6ff',    // Blue for normal volume
    textColor: '#8b949e',
    gridColor: '#21262d',
    crosshairColor: '#484f58',
  };

  const handleResize = useCallback(() => {
    if (chartRef.current && containerRef.current) {
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // ========== CREATE THE CHART ==========
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      crosshair: {
        vertLine: {
          color: chartColors.crosshairColor,
          labelBackgroundColor: chartColors.crosshairColor,
        },
        horzLine: {
          color: chartColors.crosshairColor,
          labelBackgroundColor: chartColors.crosshairColor,
        },
      },
      // ☝️ CONCEPT 3: Right price scale configuration
      // For volume, we want abbreviated format (M, B)
      rightPriceScale: {
        borderColor: chartColors.gridColor,
        // Custom price formatter for volume
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      // ☝️ CONCEPT 4: Localization for volume and time formatting
      localization: {
        priceFormatter: (price: number) => {
          if (price >= 1_000_000_000) return `$${(price / 1_000_000_000).toFixed(1)}B`;
          if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
          if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
          return `$${price.toFixed(0)}`;
        },
        // Convert Unix timestamp to local timezone
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
    });

    chartRef.current = chart;

    // ========== ADD HISTOGRAM SERIES ==========
    // ☝️ CONCEPT 5: HistogramSeries for volume bars
    // Unlike LineSeries, Histogram creates vertical bars
    const histogramSeries = chart.addSeries(HistogramSeries, {
      // Base color (can be overridden per-bar)
      color: chartColors.volumeDown,
      // ☝️ CONCEPT 6: Price format for tooltip
      priceFormat: {
        type: 'volume',
      },
      // Price line shows current volume level
      priceLineVisible: false,
      lastValueVisible: true,
    });

    seriesRef.current = histogramSeries;

    // ========== SET THE DATA ==========
    if (data && data.length > 0) {
      // ☝️ CONCEPT 7: Color-code bars based on volume changes
      // Higher volume than previous = green, else blue
      const coloredData: HistogramData<Time>[] = data.map((point, index) => {
        const prevValue = index > 0 ? data[index - 1].value : point.value;
        return {
          time: point.time,
          value: point.value,
          // Green if volume increased, blue otherwise
          color: point.value > prevValue
            ? chartColors.volumeUp
            : chartColors.volumeDown,
        };
      });

      histogramSeries.setData(coloredData);
      chart.timeScale().fitContent();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, handleResize]);

  // ☝️ CONCEPT 8: Update data when props change
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      const coloredData: HistogramData<Time>[] = data.map((point, index) => {
        const prevValue = index > 0 ? data[index - 1].value : point.value;
        return {
          time: point.time,
          value: point.value,
          color: point.value > prevValue
            ? chartColors.volumeUp
            : chartColors.volumeDown,
        };
      });

      seriesRef.current.setData(coloredData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />

      {!loading && (!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No volume data available
        </div>
      )}

      {/* ☝️ CONCEPT 9: Legend explaining the colors */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.volumeUp }} />
          <span>Volume increased</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.volumeDown }} />
          <span>Volume decreased</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUMMARY - TradingView Histogram Concepts:
// ============================================
// 1. HistogramSeries - Creates vertical bars (perfect for volume)
// 2. Per-bar coloring - Each data point can have its own color
// 3. priceFormat: 'volume' - Optimized tooltip formatting
// 4. localization.priceFormatter - Custom axis labels
// 5. Color coding - Green for volume up, blue for down
// 6. Same lifecycle as LineSeries (create, setData, remove)
// 7. Works with the same Time type (YYYY-MM-DD strings)
// ============================================
