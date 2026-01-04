// ============================================
// StatsCard.tsx - Reusable Stats Display Card
// ============================================
// A polished, reusable card component for displaying
// key metrics with loading states and change indicators.

'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
  subtitle?: string;
}

// ☝️ CONCEPT 1: Skeleton loading component
// Shows a pulsing placeholder while data loads
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded ${className}`}
    />
  );
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  subtitle,
}: StatsCardProps) {
  // ☝️ CONCEPT 2: Determine change color
  const getChangeColor = (val: number) => {
    if (val > 0) return 'text-positive';
    if (val < 0) return 'text-negative';
    return 'text-muted-foreground';
  };

  // ☝️ CONCEPT 3: Format change with sign
  const formatChange = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  return (
    <div className="p-4 rounded-lg bg-card border border-card-border hover:border-accent/50 transition-colors group">
      {/* Header with label and optional icon */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-sm">{label}</p>
        {icon && (
          <div className="text-muted-foreground group-hover:text-accent transition-colors">
            {icon}
          </div>
        )}
      </div>

      {/* Main value */}
      {loading ? (
        <Skeleton className="h-8 w-24 mb-1" />
      ) : (
        <p className="text-2xl font-semibold text-foreground">
          {value}
        </p>
      )}

      {/* Change indicator or subtitle */}
      <div className="mt-1 min-h-[20px]">
        {loading ? (
          <Skeleton className="h-4 w-16" />
        ) : change !== undefined ? (
          <p className={`text-sm ${getChangeColor(change)}`}>
            {formatChange(change)}
            {changeLabel && (
              <span className="text-muted-foreground ml-1">
                {changeLabel}
              </span>
            )}
          </p>
        ) : subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

// ============================================
// StatsCardGrid - Container for multiple cards
// ============================================
interface StatsCardGridProps {
  children: ReactNode;
}

export function StatsCardGrid({ children }: StatsCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
