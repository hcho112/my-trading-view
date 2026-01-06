// ============================================
// ExchangePieChart.tsx - Custom SVG Donut Chart
// ============================================
// TradingView Lightweight Charts doesn't support pie charts!
// It's designed for time-series financial data (lines, candlesticks, bars).
// For categorical data like "volume by exchange", we need a different approach.
//
// This teaches an important lesson: choose the right tool for the job.
// Here we'll build a custom SVG donut chart from scratch!

'use client';

import { useMemo, useState } from 'react';

// ☝️ CONCEPT 1: Data structure for pie charts
// Each slice needs a label, value, and optionally a color
interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface ExchangePieChartProps {
  data: PieDataPoint[];
  height?: number;
  loading?: boolean;
}

// ☝️ CONCEPT 2: Color palette for exchanges
// Using a consistent color scheme that looks good on dark backgrounds
const COLORS = [
  '#58a6ff', // Blue - primary
  '#3fb950', // Green - positive
  '#f0883e', // Orange
  '#a371f7', // Purple
  '#f85149', // Red
  '#8b949e', // Gray
  '#79c0ff', // Light blue
  '#7ee787', // Light green
  '#ffa657', // Light orange
  '#d2a8ff', // Light purple
];

export function ExchangePieChart({
  data,
  height = 300,
  loading = false,
}: ExchangePieChartProps) {
  // Track which slice is hovered for interactivity
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Track mouse position for tooltip
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // ☝️ CONCEPT 3: Calculate pie chart geometry with useMemo
  // useMemo caches the calculation so it doesn't re-run on every render
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { slices: [], total: 0 };

    // Calculate total for percentage calculation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // ☝️ CONCEPT 4: SVG arc calculation
    // A pie chart is made of arcs. Each arc is defined by:
    // - Start angle
    // - End angle
    // - Inner radius (for donut hole)
    // - Outer radius

    let currentAngle = -90; // Start at top (12 o'clock position)

    const slices = data.map((item, index) => {
      // Calculate this slice's angle (in degrees)
      const percentage = item.value / total;
      const angle = percentage * 360;

      // Calculate start and end angles in radians
      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      currentAngle += angle;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        color: item.color || COLORS[index % COLORS.length],
      };
    });

    return { slices, total };
  }, [data]);

  // ☝️ CONCEPT 5: SVG path for an arc segment
  // This is the math behind drawing pie slices!
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
    centerX: number,
    centerY: number
  ): string => {
    // Calculate the four corner points of the arc
    const startOuter = {
      x: centerX + outerRadius * Math.cos(startAngle),
      y: centerY + outerRadius * Math.sin(startAngle),
    };
    const endOuter = {
      x: centerX + outerRadius * Math.cos(endAngle),
      y: centerY + outerRadius * Math.sin(endAngle),
    };
    const startInner = {
      x: centerX + innerRadius * Math.cos(endAngle),
      y: centerY + innerRadius * Math.sin(endAngle),
    };
    const endInner = {
      x: centerX + innerRadius * Math.cos(startAngle),
      y: centerY + innerRadius * Math.sin(startAngle),
    };

    // Determine if arc is greater than 180 degrees
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // Build SVG path:
    // M = move to start point
    // A = draw arc (rx, ry, rotation, large-arc, sweep, end-x, end-y)
    // L = draw line
    // Z = close path
    return `
      M ${startOuter.x} ${startOuter.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}
      L ${startInner.x} ${startInner.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}
      Z
    `;
  };

  // Chart dimensions
  const size = Math.min(height, 300);
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.6; // 60% creates a nice donut hole

  // ☝️ CONCEPT 6: Format large numbers for display
  const formatVolume = (value: number): string => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
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

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* ☝️ CONCEPT 7: SVG container with viewBox for responsiveness */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
        >
          {/* Render each slice */}
          {chartData.slices.map((slice, index) => (
            <path
              key={slice.name}
              d={createArcPath(
                slice.startAngle,
                slice.endAngle,
                innerRadius,
                // ☝️ CONCEPT 8: Hover effect - expand slice on hover
                hoveredIndex === index ? outerRadius + 5 : outerRadius,
                centerX,
                centerY
              )}
              fill={slice.color}
              stroke="#0d1117"
              strokeWidth="2"
              className="transition-all duration-200 cursor-pointer"
              style={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                setHoveredIndex(index);
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center label - shows hovered item or total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {hoveredIndex !== null ? (
              <>
                <div className="text-lg font-semibold text-foreground">
                  {formatVolume(chartData.slices[hoveredIndex].value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(chartData.slices[hoveredIndex].percentage * 100).toFixed(1)}%
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-foreground">
                  {formatVolume(chartData.total)}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </>
            )}
          </div>
        </div>

        {/* ☝️ CONCEPT 10: Floating tooltip on hover */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-card border border-card-border rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y - 40,
              transform: tooltipPos.x > size / 2 ? 'translateX(-100%)' : 'translateX(0)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: chartData.slices[hoveredIndex].color }}
              />
              <span className="font-medium text-foreground">
                {chartData.slices[hoveredIndex].name}
              </span>
            </div>
            <div className="text-muted-foreground">
              {formatVolume(chartData.slices[hoveredIndex].value)} ({(chartData.slices[hoveredIndex].percentage * 100).toFixed(1)}%)
            </div>
          </div>
        )}
      </div>

      {/* ☝️ CONCEPT 9: Legend */}
      <div className="flex flex-col gap-2 text-sm max-h-[250px] overflow-y-auto">
        {chartData.slices.slice(0, 8).map((slice, index) => (
          <div
            key={slice.name}
            className={`flex items-center gap-2 cursor-pointer transition-opacity ${
              hoveredIndex === null || hoveredIndex === index
                ? 'opacity-100'
                : 'opacity-50'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-foreground truncate max-w-[100px]">
              {slice.name}
            </span>
            <span className="text-muted-foreground ml-auto">
              {(slice.percentage * 100).toFixed(1)}%
            </span>
          </div>
        ))}
        {chartData.slices.length > 8 && (
          <div className="text-muted-foreground text-xs">
            +{chartData.slices.length - 8} more
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUMMARY - Custom Chart Concepts:
// ============================================
// 1. TradingView is for time-series, not categorical data
// 2. SVG is perfect for custom charts - vector, scalable, interactive
// 3. Pie slices are arcs defined by start/end angles
// 4. useMemo optimizes expensive calculations
// 5. viewBox makes SVG responsive
// 6. Hover states add interactivity
// 7. A legend helps users understand the data
// ============================================
