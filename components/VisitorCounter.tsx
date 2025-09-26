'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, Users } from 'lucide-react';

// Get version from package.json at build time
const VERSION = '0.3.1'; // Auto-updated by version-processor.js

interface VisitorStats {
  total: number;
  today: number;
  growth: number;
}

export function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats>({
    total: 0,
    today: 0,
    growth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading visitor stats
    // In a real implementation, this would fetch from Vercel Analytics API
    // or a custom endpoint that aggregates analytics data
    const loadStats = async () => {
      try {
        // For now, we'll use localStorage to persist a simple counter
        // In production, this should come from your analytics service
        const stored = localStorage.getItem('visitor-stats');
        const lastVisit = localStorage.getItem('last-visit');
        const today = new Date().toDateString();

        let currentStats: VisitorStats;

        if (stored && lastVisit === today) {
          // Same day visit - increment today counter
          currentStats = JSON.parse(stored);
          currentStats.today += 1;
        } else {
          // New day or first visit
          const total = stored ? JSON.parse(stored).total + 1 : 1;
          currentStats = {
            total,
            today: 1,
            growth: lastVisit ? Math.round((Math.random() * 20) - 10) : 0 // Simulated growth
          };
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats(currentStats);

        // Persist to localStorage
        localStorage.setItem('visitor-stats', JSON.stringify(currentStats));
        localStorage.setItem('last-visit', today);

      } catch (error) {
        console.warn('Failed to load visitor stats:', error);
        // Fallback to basic stats
        setStats({
          total: 1337, // Easter egg default
          today: 42,
          growth: 15
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-white/30 rounded"></div>
          <div className="w-12 h-3 bg-white/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors duration-200">
      {/* Version Badge */}
      <Badge
        variant="outline"
        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 text-blue-100 font-mono text-xs px-2 py-0.5"
      >
        v{VERSION}
      </Badge>

      {/* Visitor Counter */}
      <div className="flex items-center gap-3 text-white/90">
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium tabular-nums">
            {stats.today.toLocaleString()}
          </span>
          <span className="text-xs text-white/60">today</span>
        </div>

        <div className="w-px h-4 bg-white/20"></div>

        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium tabular-nums">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-xs text-white/60">total</span>
        </div>

        {stats.growth !== 0 && (
          <>
            <div className="w-px h-4 bg-white/20"></div>
            <div className={`flex items-center gap-1 text-xs ${
              stats.growth > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${stats.growth < 0 ? 'rotate-180' : ''}`} />
              <span className="font-medium">
                {stats.growth > 0 ? '+' : ''}{stats.growth}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Hook for getting current version (can be used elsewhere)
export function useAppVersion() {
  return VERSION;
}

// Utility function to get formatted version
export function getFormattedVersion() {
  return `v${VERSION}`;
}