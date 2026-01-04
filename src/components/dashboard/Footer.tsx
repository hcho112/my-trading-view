// ============================================
// Footer.tsx - Dashboard Footer
// ============================================
// A clean footer with tech stack info and portfolio links.

'use client';

interface FooterProps {
  lastUpdated?: string;
}

export function Footer({ lastUpdated }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tech Stack */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <div className="flex items-center gap-2">
              <TechBadge name="Next.js" />
              <TechBadge name="TailwindCSS" />
              <TechBadge name="TradingView" />
              <TechBadge name="MongoDB" />
            </div>
          </div>

          {/* Data Source & Last Updated */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
            {lastUpdated && (
              <span className="text-xs">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <span className="hidden sm:inline">|</span>
            <span>Data from CoinGecko API</span>
          </div>
        </div>

        {/* Copyright & Links */}
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>&copy; {currentYear} NEAR Trading Dashboard</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://yourportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ☝️ CONCEPT: Small tech badge component
function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-muted/50 text-xs font-medium text-foreground/80">
      {name}
    </span>
  );
}
