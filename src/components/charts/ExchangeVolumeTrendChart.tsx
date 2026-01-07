// ============================================
// ExchangeVolumeTrendChart.tsx - Multi-line volume trend chart
// ============================================
// Shows how each exchange's volume changes over time
// Uses TradingView with multiple line series

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';

interface ExchangeTimeSeries {
  name: string;
  color: string;
  data: Array<{
    time: number;
    value: number;
  }>;
}

interface ExchangeVolumeTrendChartProps {
  exchanges: ExchangeTimeSeries[];
  height?: number;
  loading?: boolean;
}

export function ExchangeVolumeTrendChart({
  exchanges,
  height = 300,
  loading = false,
}: ExchangeVolumeTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const [hoveredExchange, setHoveredExchange] = useState<string | null>(null);

  const chartColors = {
    backgroundColor: 'transparent',
    textColor: '#8b949e',
    gridColor: '#21262d',
    crosshairColor: '#484f58',
  };

  // Format volume for display
  const formatVolume = (value: number): string => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const handleResize = useCallback(() => {
    if (chartRef.current && containerRef.current) {
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    }
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

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
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });
        },
        priceFormatter: (price: number) => formatVolume(price),
      },
    });

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      seriesRefs.current.clear();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, handleResize]);

  // Update series when data changes
  useEffect(() => {
    if (!chartRef.current || !exchanges || exchanges.length === 0) return;

    const chart = chartRef.current;
    const existingSeries = seriesRefs.current;

    // Remove series that no longer exist
    for (const [name, series] of existingSeries) {
      if (!exchanges.find(e => e.name === name)) {
        chart.removeSeries(series);
        existingSeries.delete(name);
      }
    }

    // Add or update series for each exchange
    for (const exchange of exchanges) {
      let series = existingSeries.get(exchange.name);

      if (!series) {
        // Create new series
        series = chart.addSeries(LineSeries, {
          color: exchange.color,
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          title: exchange.name,
        });
        existingSeries.set(exchange.name, series);
      }

      // Update data
      if (exchange.data && exchange.data.length > 0) {
        // Transform to TradingView format
        const chartData = exchange.data.map(d => ({
          time: d.time as Time,
          value: d.value,
        }));
        series.setData(chartData);
      }
    }

    // Fit content
    chart.timeScale().fitContent();
  }, [exchanges]);

  // Handle legend hover - highlight selected series
  const handleLegendHover = (name: string | null) => {
    setHoveredExchange(name);

    for (const [seriesName, series] of seriesRefs.current) {
      const exchange = exchanges.find(e => e.name === seriesName);
      if (!exchange) continue;

      if (name === null) {
        // Reset all to full opacity
        series.applyOptions({
          color: exchange.color,
          lineWidth: 2,
        });
      } else if (seriesName === name) {
        // Highlight hovered
        series.applyOptions({
          lineWidth: 3,
        });
      } else {
        // Dim others
        series.applyOptions({
          color: exchange.color + '40', // Add transparency
          lineWidth: 1,
        });
      }
    }
  };

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

      {/* Legend */}
      {exchanges && exchanges.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {exchanges.map((exchange) => (
            <div
              key={exchange.name}
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${
                hoveredExchange === null || hoveredExchange === exchange.name
                  ? 'opacity-100'
                  : 'opacity-40'
              }`}
              onMouseEnter={() => handleLegendHover(exchange.name)}
              onMouseLeave={() => handleLegendHover(null)}
            >
              <div
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: exchange.color }}
              />
              <span className="text-muted-foreground">{exchange.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && (!exchanges || exchanges.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
