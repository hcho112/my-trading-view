// ============================================
// PriceChart.tsx - Your First TradingView Chart
// ============================================
// Let's learn TradingView step by step!

'use client';
// ☝️ CONCEPT 1: 'use client' directive
// TradingView Lightweight Charts only works in the browser (client-side).
// It needs access to the DOM (document, window) which doesn't exist on the server.
// This directive tells Next.js: "Don't try to render this on the server!"

import { useEffect, useRef, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
// ☝️ CONCEPT 2: Imports from lightweight-charts
// - createChart: The main function to create a chart instance
// - IChartApi: TypeScript type for the chart object
// - ISeriesApi: TypeScript type for data series (line, bar, etc.)
// - LineSeries: Type for line series configuration
// - Time: Type for time values (can be string 'YYYY-MM-DD' or Unix timestamp)

// Define the shape of our data points
interface ChartDataPoint {
  time: Time;      // TradingView accepts 'YYYY-MM-DD' string or Unix timestamp
  value: number;   // The price value
}

// Props our component accepts
interface PriceChartProps {
  data: ChartDataPoint[];           // Array of price points
  height?: number;                   // Optional height (default 400)
  loading?: boolean;                 // Show loading state
}

export function PriceChart({ data, height = 400, loading = false }: PriceChartProps) {
  // ☝️ CONCEPT 3: useRef for DOM reference
  // We need a reference to the container div where TradingView will render.
  // useRef gives us a stable reference that persists across re-renders.
  const containerRef = useRef<HTMLDivElement>(null);

  // We also store references to the chart and series so we can update/cleanup them
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // ☝️ CONCEPT 4: Chart color configuration
  // We're using CSS variables from our globals.css for consistent theming
  const chartColors = {
    backgroundColor: 'transparent',      // Let container background show through
    lineColor: '#58a6ff',                // Blue line for prices
    textColor: '#8b949e',                // Muted text for axes
    gridColor: '#21262d',                // Subtle grid lines
    crosshairColor: '#484f58',           // Crosshair when hovering
  };

  // ☝️ CONCEPT 5: Resize handler with useCallback
  // Charts need to be resized when the window/container changes size.
  // useCallback memoizes the function so it doesn't change on every render.
  const handleResize = useCallback(() => {
    if (chartRef.current && containerRef.current) {
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    }
  }, []);

  // ☝️ CONCEPT 6: useEffect for chart initialization
  // This is the CORE pattern for TradingView in React/Next.js:
  // 1. Wait for component to mount (DOM exists)
  // 2. Create the chart
  // 3. Add series and data
  // 4. Clean up when component unmounts
  useEffect(() => {
    // Guard: Don't do anything if container doesn't exist yet
    if (!containerRef.current) return;

    // ========== CREATE THE CHART ==========
    // createChart() is the main entry point to TradingView
    const chart = createChart(containerRef.current, {
      // Dimensions
      width: containerRef.current.clientWidth,
      height: height,

      // Layout configuration
      layout: {
        background: { color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },

      // Grid lines (the horizontal/vertical lines behind the chart)
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },

      // Crosshair (the lines that follow your cursor)
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

      // Right price scale (Y-axis showing prices)
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },

      // Time scale (X-axis showing dates/times)
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,        // Show time in tooltip
        secondsVisible: false,    // Don't show seconds
      },
    });

    // Store chart reference for later use
    chartRef.current = chart;

    // ========== ADD A LINE SERIES ==========
    // A "series" is a set of data points displayed on the chart.
    // addLineSeries() creates a line chart series.
    const lineSeries = chart.addSeries(LineSeries, {
      color: chartColors.lineColor,
      lineWidth: 2,
      // Optional: Add price line (horizontal line at current price)
      lastValueVisible: true,
      priceLineVisible: true,
    });

    // Store series reference
    seriesRef.current = lineSeries;

    // ========== SET THE DATA ==========
    // setData() feeds your price data to the series
    if (data && data.length > 0) {
      lineSeries.setData(data);
      // fitContent() adjusts the view to show all data
      chart.timeScale().fitContent();
    }

    // ========== HANDLE WINDOW RESIZE ==========
    window.addEventListener('resize', handleResize);

    // ========== CLEANUP FUNCTION ==========
    // This runs when the component unmounts or before re-running the effect.
    // CRITICAL: Always call chart.remove() to prevent memory leaks!
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, handleResize]); // Re-run if height changes

  // ☝️ CONCEPT 7: Updating data without recreating the chart
  // When data changes, we just update the series data, not the whole chart.
  // This is more efficient and provides smooth updates.
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  // ☝️ CONCEPT 8: The container element
  // TradingView needs a DOM element to render into.
  // We provide a div and give it our ref.
  return (
    <div className="relative w-full">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />

      {/* Empty state */}
      {!loading && (!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}

// ============================================
// SUMMARY - Key TradingView Concepts:
// ============================================
// 1. 'use client' - Required for client-side only libraries
// 2. useRef - Store DOM reference and chart instances
// 3. useEffect - Initialize chart after mount, cleanup on unmount
// 4. createChart() - Main function to create a chart
// 5. chart.addSeries(LineSeries, options) - Add a line series
// 6. series.setData(data) - Feed data to the series
// 7. chart.remove() - ALWAYS cleanup to prevent memory leaks
// 8. chart.timeScale().fitContent() - Auto-fit view to show all data
// ============================================
