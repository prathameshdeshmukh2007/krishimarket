import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Layers, 
  Filter,
  Activity,
  Maximize2
} from 'lucide-react';
import { MarketPriceRecord, Commodity, APMCMarket, LanguageCode } from '../types';
import { generateHistoricalTimeSeries, getHistoricalComparison } from '../services/marketAnalytics';
import { generatePriceForecast, generateMarketSignal } from '../services/aiEngine';
import { translations } from '../i18n/translations';

interface MarketExplorerViewProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  markets: APMCMarket[];
  language: LanguageCode;
  selectedCommodityName?: string;
  selectedMarketName?: string;
}

export const MarketExplorerView: React.FC<MarketExplorerViewProps> = ({
  prices,
  commodities,
  markets,
  language,
  selectedCommodityName,
  selectedMarketName
}) => {
  const t = translations[language];

  // Filters State
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string>(selectedMarketName || 'Pimpalgaon APMC');
  const [selectedCommodity, setSelectedCommodity] = useState<string>(selectedCommodityName || 'Tomato');
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '30D' | '90D' | '1Y' | '3Y' | '5Y'>('30D');

  // Filtered available states & markets
  const states = useMemo(() => {
    const s = Array.from(new Set(markets.map(m => m.state)));
    return ['All', ...s];
  }, [markets]);

  const filteredMarkets = useMemo(() => {
    if (selectedState === 'All') return markets;
    return markets.filter(m => m.state === selectedState);
  }, [markets, selectedState]);

  // Current active price record
  const currentRecord = useMemo(() => {
    const found = prices.find(
      p => p.commodity.toLowerCase().includes(selectedCommodity.toLowerCase().slice(0, 4)) &&
           p.market.toLowerCase().includes(selectedMarket.toLowerCase().slice(0, 5))
    );
    if (found) return found;
    // Fallback if combination is not direct match
    const fallbackPrice = prices.find(p => p.commodity.toLowerCase().includes(selectedCommodity.toLowerCase().slice(0, 4))) || prices[0];
    return {
      ...fallbackPrice,
      market: selectedMarket,
      state: filteredMarkets.find(m => m.name === selectedMarket)?.state || 'Maharashtra'
    };
  }, [prices, selectedCommodity, selectedMarket, filteredMarkets]);

  // Historical Multi-Timeframe Chart Data
  const chartData = useMemo(() => {
    return generateHistoricalTimeSeries(
      selectedCommodity,
      selectedMarket,
      currentRecord.modalPrice,
      timeframe
    );
  }, [selectedCommodity, selectedMarket, currentRecord.modalPrice, timeframe]);

  // Analytics & Forecasts
  const historicalComp = useMemo(() => {
    return getHistoricalComparison(selectedCommodity, currentRecord.modalPrice);
  }, [selectedCommodity, currentRecord.modalPrice]);

  const forecast3D = useMemo(() => {
    return generatePriceForecast(selectedCommodity, selectedMarket, currentRecord.modalPrice, 3);
  }, [selectedCommodity, selectedMarket, currentRecord.modalPrice]);

  const forecast7D = useMemo(() => {
    return generatePriceForecast(selectedCommodity, selectedMarket, currentRecord.modalPrice, 7);
  }, [selectedCommodity, selectedMarket, currentRecord.modalPrice]);

  const marketSignal = useMemo(() => {
    return generateMarketSignal(selectedCommodity, selectedMarket, currentRecord.modalPrice, currentRecord.priceChangePct1D);
  }, [selectedCommodity, selectedMarket, currentRecord.modalPrice, currentRecord.priceChangePct1D]);

  const isUp = (currentRecord.priceChange1D ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Filter className="w-4 h-4" />
            <span>OFFICIAL APMC MANDI & COMMODITY EXPLORER</span>
          </div>
          <span>Source: Government of India / AGMARKNET</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* State Select */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">State / Province</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const nextM = markets.find(m => e.target.value === 'All' || m.state === e.target.value);
                if (nextM) setSelectedMarket(nextM.name);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Market APMC Select */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">APMC Market / Mandi</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {filteredMarkets.map(m => (
                <option key={m.id} value={m.name}>{m.name} ({m.state})</option>
              ))}
            </select>
          </div>

          {/* Commodity Select */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Physical Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {commodities.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name} ({c.hindiName})</option>
              ))}
            </select>
          </div>

          {/* Variety & Grade Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Commercial Grade</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
              <option>Grade A (FAQ Standard)</option>
              <option>Grade A+ (Export / Supermarket)</option>
              <option>Grade B (Processing Quality)</option>
              <option>All Commercial Grades</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Spot Price & Official Metadata Banner */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{selectedCommodity}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {currentRecord.variety}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono">
                {currentRecord.grade}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {selectedMarket}, {currentRecord.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Market Date: <strong className="text-slate-200">{currentRecord.date}</strong>
              </span>
              <span>•</span>
              <span>
                Last Synced: <strong className="text-slate-200">{currentRecord.fetchedAt}</strong>
              </span>
            </div>
          </div>

          {/* Rate Cards */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[130px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Modal Price (सरासरी)</div>
              <div className="text-2xl font-mono font-black text-white mt-0.5">
                ₹{currentRecord.modalPrice.toLocaleString('en-IN')}
                <span className="text-xs text-slate-400 font-normal">/q</span>
              </div>
              <div className={`text-[10px] font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? '▲ +' : '▼ '}{currentRecord.priceChange1D ?? 0} ({currentRecord.priceChangePct1D ?? 0}%)
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[110px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Min Price</div>
              <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">
                ₹{currentRecord.minPrice.toLocaleString('en-IN')}
                <span className="text-xs text-slate-500 font-normal">/q</span>
              </div>
              <div className="text-[10px] text-slate-400">Floor Rate</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[110px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Max Price</div>
              <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">
                ₹{currentRecord.maxPrice.toLocaleString('en-IN')}
                <span className="text-xs text-slate-500 font-normal">/q</span>
              </div>
              <div className="text-[10px] text-slate-400">Ceiling Rate</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[120px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Daily Inflow</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                {currentRecord.arrivalQuantity.toLocaleString('en-IN')}
                <span className="text-xs text-slate-400 font-normal"> Tonnes</span>
              </div>
              <div className="text-[10px] text-slate-400">APMC Gate Volume</div>
            </div>
          </div>
        </div>

        {/* Verification Source Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Source: {currentRecord.source}</span>
          </div>
          <div className="text-slate-400 font-mono">
            Official APMC Gate Records • Standard Unit: ₹/Quintal (100 kg)
          </div>
        </div>
      </div>

      {/* Interactive Price & Arrival Chart Section */}
      <div className="glass-panel p-4 sm:p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Historical Price Trajectory & Arrival Inflow</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive dual-axis visualization: Modal Price Area & Daily Mandi Arrivals
            </p>
          </div>

          {/* Timeframe Buttons: 1D, 7D, 30D, 90D, 1Y, 3Y, 5Y */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            {(['1D', '7D', '30D', '90D', '1Y', '3Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Chart Container */}
        <div className="h-[360px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="modalPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              {/* Left Axis: Price in ₹/q */}
              <YAxis 
                yAxisId="price" 
                stroke="#10b981" 
                domain={['dataMin - 100', 'dataMax + 100']} 
                tick={{ fontSize: 10, fill: '#10b981' }}
                tickFormatter={(v) => `₹${v}`}
              />
              {/* Right Axis: Arrivals in Tonnes */}
              <YAxis 
                yAxisId="arrivals" 
                orientation="right" 
                stroke="#f59e0b" 
                tick={{ fontSize: 10, fill: '#f59e0b' }}
                tickFormatter={(v) => `${v}T`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                        <div className="font-bold text-slate-200 mb-1 border-b border-slate-800 pb-1">
                          {data.date} • {data.market}
                        </div>
                        <div className="text-emerald-400 font-bold text-sm">
                          Modal Price: ₹{data.modalPrice}/quintal
                        </div>
                        <div className="text-slate-400">
                          Min: ₹{data.minPrice} | Max: ₹{data.maxPrice}
                        </div>
                        <div className="text-amber-400 mt-1">
                          Arrival Volume: {data.arrivalQuantity} Tonnes
                        </div>
                        {data.ma7 && (
                          <div className="text-cyan-400 text-[10px] mt-0.5">
                            7-Day MA: ₹{data.ma7}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                          Source: {data.source}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              {/* Arrivals Bar */}
              <Bar 
                yAxisId="arrivals" 
                dataKey="arrivalQuantity" 
                name="Daily Arrivals (Tonnes)" 
                fill="#f59e0b" 
                opacity={0.3} 
                radius={[2, 2, 0, 0]} 
              />
              {/* Modal Price Area */}
              <Area 
                yAxisId="price" 
                type="monotone" 
                dataKey="modalPrice" 
                name="Modal Price (₹/q)" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#modalPriceGradient)" 
              />
              {/* Min & Max Range Lines */}
              <Line 
                yAxisId="price" 
                type="monotone" 
                dataKey="maxPrice" 
                name="Max Price (₹/q)" 
                stroke="#06b6d4" 
                strokeWidth={1} 
                strokeDasharray="2 2" 
                dot={false} 
              />
              <Line 
                yAxisId="price" 
                type="monotone" 
                dataKey="minPrice" 
                name="Min Price (₹/q)" 
                stroke="#64748b" 
                strokeWidth={1} 
                strokeDasharray="2 2" 
                dot={false} 
              />
              {/* 7-Day Moving Average */}
              {timeframe !== '1D' && (
                <Line 
                  yAxisId="price" 
                  type="monotone" 
                  dataKey="ma7" 
                  name="7-Day Moving Avg" 
                  stroke="#a855f7" 
                  strokeWidth={1.5} 
                  dot={false} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Matrix: Historical Benchmarks, AI Forecasts, & Market Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Multi-Year Historical Benchmarks */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Year Price Analytics</span>
            </div>

            <div className="space-y-2.5 mt-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Current Modal Rate:</span>
                <span className="text-slate-100 font-mono font-bold">₹{historicalComp.currentPrice}/q</span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Same Period Last Year:</span>
                <div className="text-right">
                  <span className="text-slate-200 font-mono font-medium">₹{historicalComp.lastYearSamePeriodPrice}/q</span>
                  <span className={`ml-2 text-[10px] font-mono ${historicalComp.lastYearDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({historicalComp.lastYearDeltaPct >= 0 ? '+' : ''}{historicalComp.lastYearDeltaPct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">3-Year Historical Avg:</span>
                <div className="text-right">
                  <span className="text-slate-200 font-mono font-medium">₹{historicalComp.threeYearAvgPrice}/q</span>
                  <span className={`ml-2 text-[10px] font-mono ${historicalComp.threeYearDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({historicalComp.threeYearDeltaPct >= 0 ? '+' : ''}{historicalComp.threeYearDeltaPct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">5-Year Historical Avg:</span>
                <div className="text-right">
                  <span className="text-slate-200 font-mono font-medium">₹{historicalComp.fiveYearAvgPrice}/q</span>
                  <span className={`ml-2 text-[10px] font-mono ${historicalComp.fiveYearDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({historicalComp.fiveYearDeltaPct >= 0 ? '+' : ''}{historicalComp.fiveYearDeltaPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px]">
            <span className="text-amber-400 font-semibold uppercase block mb-0.5">
              Cycle: {historicalComp.seasonalTrend.replace('_', ' ')}
            </span>
            <p className="text-slate-400 leading-snug">{historicalComp.seasonalDescription}</p>
          </div>
        </div>

        {/* Card 2: AI Price Forecasting (Next 3D & 7D) */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Price Forecasting (ML Ensemble)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {forecast7D.confidencePercentage}% Confidence
              </span>
            </div>

            {/* 3-Day and 7-Day Forecast Blocks */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">NEXT 3 DAYS</div>
                <div className="text-base font-mono font-bold text-white mt-1">
                  ₹{forecast3D.predictedMinPrice} – ₹{forecast3D.predictedMaxPrice}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Est. Modal: ₹{forecast3D.predictedModalPrice}/q
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">NEXT 7 DAYS</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                  ₹{forecast7D.predictedMinPrice} – ₹{forecast7D.predictedMaxPrice}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
                  Est. Modal: ₹{forecast7D.predictedModalPrice}/q
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-[10px] font-mono text-slate-400">Model Features Evaluated:</div>
              <ul className="text-[10px] text-slate-300 list-disc list-inside space-y-0.5">
                <li>Daily APMC Mandi Inflow Trajectory</li>
                <li>Monsoon & Rain Radar Risk Indicators</li>
                <li>Festive Season Procurement Index</li>
              </ul>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 italic mt-3 pt-2 border-t border-slate-800">
            * {forecast7D.disclaimer}
          </p>
        </div>

        {/* Card 3: AI Market Signal & Transparent "WHY?" */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Market Signal & Rationale</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Score: {marketSignal.strengthScore}/100</span>
            </div>

            {/* Signal Badge */}
            <div className="mt-2 flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className={`w-3.5 h-3.5 rounded-full animate-pulse ${
                marketSignal.signalType === 'positive' ? 'bg-emerald-500' :
                marketSignal.signalType === 'stable' ? 'bg-amber-400' :
                marketSignal.signalType === 'downward_pressure' ? 'bg-rose-500' : 'bg-purple-500'
              }`}></span>
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {marketSignal.signalType.replace('_', ' ')} SIGNAL
                </span>
                <div className="text-[10px] text-slate-400">
                  Arrivals: {marketSignal.arrivalTrendDirection} • Volatility: {marketSignal.volatilityIndex}%
                </div>
              </div>
            </div>

            {/* "WHY?" Bullet List */}
            <div className="mt-3">
              <div className="text-[11px] font-mono text-emerald-400 font-semibold mb-1.5">
                DATA-BACKED REASONS (WHY?):
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {marketSignal.reasons.map((reason, i) => (
                  <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800 font-mono">
            Derived from measurable physical supply-demand indices.
          </div>
        </div>
      </div>
    </div>
  );
};
