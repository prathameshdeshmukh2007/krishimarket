import React from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { MarketPriceRecord } from '../types';

interface MarketTickerProps {
  prices: MarketPriceRecord[];
  onSelectCommodity?: (commodity: string, market: string) => void;
  lastSynced: string;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  prices,
  onSelectCommodity,
  lastSynced
}) => {
  // Duplicate for seamless infinite horizontal scroll loop
  const tickerItems = [...prices, ...prices];

  return (
    <div className="border-y border-slate-800/90 bg-[#0d131f] overflow-hidden relative shadow-inner">
      <div className="flex items-center">
        {/* Fixed Ticker Label */}
        <div className="z-10 flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border-r border-slate-800 text-xs font-mono font-bold text-emerald-400 shrink-0 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LATEST APMC TICKER</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex animate-ticker whitespace-nowrap py-2 hover:[animation-play-state:paused] cursor-pointer">
          {tickerItems.map((item, idx) => {
            const isUp = (item.priceChange1D ?? 0) >= 0;
            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onSelectCommodity && onSelectCommodity(item.commodity, item.market)}
                className="inline-flex items-center gap-3 px-4 border-r border-slate-800/70 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                    {item.commodity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({item.market.replace(' APMC', '')})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-slate-100">
                    ₹{item.modalPrice.toLocaleString('en-IN')}/q
                  </span>

                  <span
                    className={`inline-flex items-center text-xs font-mono font-semibold ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                    )}
                    {isUp ? '+' : ''}
                    {item.priceChangePct1D ?? 0}%
                  </span>
                </div>

                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50 hidden lg:inline">
                  Govt Source
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
