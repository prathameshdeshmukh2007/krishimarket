import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Activity,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  MarketPriceRecord, 
  Commodity, 
  AgriMarketIndex, 
  LanguageCode 
} from '../types';
import { AgriIndexCard } from './AgriIndexCard';
import { detectMarketAnomalies } from '../services/marketAnalytics';
import { translations } from '../i18n/translations';

interface MarketTerminalViewProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  indices: AgriMarketIndex[];
  language: LanguageCode;
  onNavigateToTab: (tab: string, commodity?: string, market?: string) => void;
}

export const MarketTerminalView: React.FC<MarketTerminalViewProps> = ({
  prices,
  commodities,
  indices,
  language,
  onNavigateToTab
}) => {
  const t = translations[language];

  const anomalies = useMemo(() => detectMarketAnomalies(prices), [prices]);

  // Top Gainers / Movers
  const topGainers = useMemo(() => {
    return [...prices]
      .sort((a, b) => (b.priceChangePct1D ?? 0) - (a.priceChangePct1D ?? 0))
      .slice(0, 4);
  }, [prices]);

  // Top Volume Inflows
  const topArrivals = useMemo(() => {
    return [...prices]
      .sort((a, b) => b.arrivalQuantity - a.arrivalQuantity)
      .slice(0, 4);
  }, [prices]);

  return (
    <div className="space-y-6">
      {/* Top Section: Composite Agri Indices Card */}
      <AgriIndexCard indices={indices} />

      {/* Hero Decision Engine Promo Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI SELL OR STORE RECOMMENDATION</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
              🧪 Sample Market Data
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
            {t.sellOrStoreTitle}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Help farmers decide: Should you <strong className="text-emerald-400">SELL NOW</strong>, <strong className="text-amber-400">STORE</strong>, or <strong className="text-sky-400">MONITOR</strong> based on price trends, mandi arrivals, buyer demand, and storage feasibility.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('decision')}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
        >
          <span>RUN SELL OR STORE AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Top Movers & Major Mandi Inflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Price Gainers */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{t.topGainers} (1-Day Price Velocity)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Official AGMARKNET</span>
          </div>

          <div className="space-y-2">
            {topGainers.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateToTab('explorer', item.commodity, item.market)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{item.commodity}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.market.replace(' APMC', '')})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Floor: ₹{item.minPrice} • Ceiling: ₹{item.maxPrice}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-slate-100">
                    ₹{item.modalPrice.toLocaleString('en-IN')}/q
                  </div>
                  <div className="text-[10px] font-mono font-bold text-emerald-400">
                    ▲ +{item.priceChangePct1D ?? 0}% (+₹{item.priceChange1D}/q)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Arrival Volume Mandis */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>{t.topArrivals} (Daily Mandi Inflow)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Gate Weighment</span>
          </div>

          <div className="space-y-2">
            {topArrivals.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateToTab('explorer', item.commodity, item.market)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{item.commodity}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.market.replace(' APMC', '')})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Modal: ₹{item.modalPrice}/q ({item.state})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-amber-400">
                    {item.arrivalQuantity.toLocaleString('en-IN')} Tonnes
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {Math.round(item.arrivalQuantity * 10)} Quintals
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Anomaly Alerts & Weather Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Anomaly Detection Alerts (2 Cols) */}
        <div className="md:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>MARKET ANOMALY DETECTION ENGINE</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Real-Time Pattern Analysis</span>
          </div>

          <div className="space-y-2.5">
            {anomalies.map((anom) => (
              <div 
                key={anom.id}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    {anom.headline}
                  </span>
                  <span className="text-[10px] text-slate-400">{anom.detectedAt}</span>
                </div>

                <div className="text-slate-300 text-[11px]">
                  Observed: <strong className="text-white">{anom.observedValue}</strong> • ({anom.expectedRange})
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Possible Hypotheses:</div>
                  {anom.possibleHypotheses.map((h, i) => (
                    <div key={i} className="text-slate-300 flex items-start gap-1">
                      <span>•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Intelligence Widget (1 Col) */}
        <div className="md:col-span-1 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" />
                <span>WEATHER INTELLIGENCE</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Nashik Belt</span>
            </div>

            <div className="mt-3 flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>
                <div className="text-2xl font-mono font-bold text-white">28°C</div>
                <div className="text-[11px] text-slate-400">Scattered Monsoon Showers</div>
              </div>
              <CloudRain className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-2 mt-3 text-xs font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-400">Precipitation Probability:</span>
                <span className="text-cyan-300 font-bold">65%</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-400">Relative Humidity:</span>
                <span className="text-slate-200">82%</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold block mb-0.5">Produce Logistics Advisory:</span>
            <span>Cover open trucks with tarpaulins during transit to Vashi/Azadpur to prevent skin waterlogging on tomatoes & grapes.</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Physical Commodities Spot Matrix */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-200 font-bold">
            COMPREHENSIVE SPOT RATES ACROSS MAJOR APMC MANDIS
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            All prices strictly in ₹/Quintal (100 kg)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-3">APMC Mandi</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Variety / Grade</th>
                <th className="py-3 px-3">Min</th>
                <th className="py-3 px-3">Max</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Modal Rate</th>
                <th className="py-3 px-3">1D Shift</th>
                <th className="py-3 px-3">Daily Inflow</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {prices.map((row) => {
                const isUp = (row.priceChange1D ?? 0) >= 0;
                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {row.commodity}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{row.market}</td>
                    <td className="py-3 px-3 text-slate-400">{row.state}</td>
                    <td className="py-3 px-3 text-slate-400">{row.variety}</td>
                    <td className="py-3 px-3 text-slate-300">₹{row.minPrice}</td>
                    <td className="py-3 px-3 text-slate-300">₹{row.maxPrice}</td>
                    <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                      ₹{row.modalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 px-3 font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '▲ +' : '▼ '}{row.priceChangePct1D ?? 0}%
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {row.arrivalQuantity} T
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigateToTab('explorer', row.commodity, row.market)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-mono text-[11px] font-bold transition-colors"
                      >
                        Explore
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
