import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Layers, 
  Calendar, 
  MapPin, 
  Scale, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Sparkles,
  BarChart2,
  PieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  MarketPriceRecord, 
  Commodity, 
  APMCMarket, 
  LanguageCode 
} from '../types';
import { translations } from '../i18n/translations';

interface MarketPriceViewProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  markets: APMCMarket[];
  language: LanguageCode;
  initialCommodityName?: string;
  initialMarketName?: string;
  onNavigateToSellStore?: (crop: string) => void;
}

export const MarketPriceView: React.FC<MarketPriceViewProps> = ({
  prices,
  commodities,
  markets,
  language,
  initialCommodityName = 'Tomato',
  initialMarketName,
  onNavigateToSellStore
}) => {
  const t = translations[language];

  // Selections
  const [selectedCommodityName, setSelectedCommodityName] = useState<string>(initialCommodityName);
  const [selectedMarketName, setSelectedMarketName] = useState<string>(initialMarketName || prices[0]?.market || 'Pimpalgaon APMC');
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton'>('kg');
  const [timeFilter, setTimeFilter] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y' | '10Y'>('1M');
  const [activeGraphTab, setActiveGraphTab] = useState<
    'recent' | 'ten_year' | 'earnings' | 'expenses' | 'profit' | 'demand' | 'arrivals'
  >('recent');

  // Find matching price record
  const currentRecord = useMemo(() => {
    return prices.find(p => 
      p.commodity.toLowerCase().includes(selectedCommodityName.toLowerCase().slice(0, 4)) &&
      (!selectedMarketName || p.market.toLowerCase().includes(selectedMarketName.toLowerCase().slice(0, 5)))
    ) || prices.find(p => p.commodity.toLowerCase().includes(selectedCommodityName.toLowerCase().slice(0, 4))) || prices[0];
  }, [prices, selectedCommodityName, selectedMarketName]);

  // Unit multiplier:
  // Base record is in ₹/Quintal (100 kg)
  // 1 kg = price / 100
  // 1 quintal = price
  // 1 ton = price * 10
  const unitMultiplier = unit === 'kg' ? 0.01 : unit === 'quintal' ? 1 : 10;
  const unitLabel = unit === 'kg' ? '₹/kg' : unit === 'quintal' ? '₹/quintal' : '₹/ton';

  const modalConverted = Math.round(currentRecord.modalPrice * unitMultiplier);
  const minConverted = Math.round(currentRecord.minPrice * unitMultiplier);
  const maxConverted = Math.round(currentRecord.maxPrice * unitMultiplier);

  // Price Trend Direction
  const isRising = (currentRecord.priceChange1D ?? 0) >= 0;

  // Generate Interactive Time Series for the 7 Graphs
  const graphData = useMemo(() => {
    const baseModal = currentRecord.modalPrice * unitMultiplier;
    
    // 1. Recent Price Trajectory (1M, 3M, 6M, 1Y)
    if (activeGraphTab === 'recent') {
      const pointsCount = timeFilter === '1M' ? 12 : timeFilter === '3M' ? 14 : 16;
      const result = [];
      for (let i = pointsCount; i >= 0; i--) {
        const factor = isRising ? 1 - (i * 0.018) + (Math.sin(i) * 0.02) : 1 + (i * 0.015) - (Math.sin(i) * 0.02);
        const p = Math.round(baseModal * factor);
        result.push({
          label: i === 0 ? 'Today' : `D-${i * (timeFilter === '1M' ? 2 : timeFilter === '3M' ? 6 : 15)}`,
          price: p,
          minPrice: Math.round(p * 0.93),
          maxPrice: Math.round(p * 1.07),
          arrivals: Math.round(currentRecord.arrivalQuantity * (1.2 - factor * 0.2))
        });
      }
      return result;
    }

    // 2. 10-Year Price History
    if (activeGraphTab === 'ten_year') {
      const years = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026 (YTD)'];
      return years.map((year, idx) => {
        const historicalIndex = 0.55 + (idx * 0.045) + (idx % 3 === 0 ? 0.08 : -0.04);
        return {
          label: year,
          price: Math.round(baseModal * historicalIndex),
          minPrice: Math.round(baseModal * historicalIndex * 0.88),
          maxPrice: Math.round(baseModal * historicalIndex * 1.12),
        };
      });
    }

    // 3. Earnings Graph
    if (activeGraphTab === 'earnings') {
      return [
        { label: 'Mar 2026', earnings: 42000, target: 40000 },
        { label: 'Apr 2026', earnings: 56000, target: 50000 },
        { label: 'May 2026', earnings: 71000, target: 60000 },
        { label: 'Jun 2026', earnings: 64000, target: 65000 },
        { label: 'Jul 2026', earnings: 78000, target: 70000 },
        { label: 'Aug 2026', earnings: 88250, target: 80000 }
      ];
    }

    // 4. Expenses Graph
    if (activeGraphTab === 'expenses') {
      return [
        { label: 'Seeds', amount: 8500 },
        { label: 'Fertilizer', amount: 9200 },
        { label: 'Labour', amount: 4500 },
        { label: 'Pesticides', amount: 3400 },
        { label: 'Transport', amount: 1400 },
        { label: 'Other', amount: 800 }
      ];
    }

    // 5. Profit / Loss Trajectory
    if (activeGraphTab === 'profit') {
      return [
        { label: 'Kharif 2024', earnings: 140000, expenses: 82000, profit: 58000 },
        { label: 'Rabi 2024', earnings: 165000, expenses: 91000, profit: 74000 },
        { label: 'Zaid 2025', earnings: 92000, expenses: 54000, profit: 38000 },
        { label: 'Kharif 2025', earnings: 155000, expenses: 88000, profit: 67000 },
        { label: 'Rabi 2025', earnings: 180000, expenses: 95000, profit: 85000 },
        { label: 'Kharif 2026 (Current)', earnings: 88250, expenses: 27000, profit: 61250 }
      ];
    }

    // 6. Market Demand Index
    if (activeGraphTab === 'demand') {
      return [
        { label: 'Mon', demandScore: 78, priceIndex: 100 },
        { label: 'Tue', demandScore: 82, priceIndex: 102 },
        { label: 'Wed', demandScore: 86, priceIndex: 105 },
        { label: 'Thu', demandScore: 91, priceIndex: 108 },
        { label: 'Fri', demandScore: 94, priceIndex: 112 },
        { label: 'Sat', demandScore: 89, priceIndex: 109 },
        { label: 'Sun', demandScore: 84, priceIndex: 104 }
      ];
    }

    // 7. Mandi Arrivals Inflow
    if (activeGraphTab === 'arrivals') {
      return [
        { label: '22 Aug', arrivalsTonnes: 540, modalRate: baseModal * 0.94 },
        { label: '23 Aug', arrivalsTonnes: 490, modalRate: baseModal * 0.96 },
        { label: '24 Aug', arrivalsTonnes: 430, modalRate: baseModal * 0.98 },
        { label: '25 Aug', arrivalsTonnes: 460, modalRate: baseModal * 0.97 },
        { label: '26 Aug', arrivalsTonnes: 410, modalRate: baseModal * 1.01 },
        { label: '27 Aug', arrivalsTonnes: 380, modalRate: baseModal * 1.03 },
        { label: '28 Aug (Today)', arrivalsTonnes: 350, modalRate: baseModal }
      ];
    }

    return [];
  }, [activeGraphTab, timeFilter, currentRecord, unitMultiplier, isRising]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 via-emerald-600 to-teal-700 text-white shadow-xl shadow-sky-600/10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
            <span>📈</span>
            <span>{t.officialDataSource}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            {t.marketPriceScreenTitle}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            {t.marketPriceSubtitle}
          </p>
        </div>
      </div>

      {/* SELECTORS & UNIT CONVERTER BAR */}
      <div className="farmer-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Crop / Produce
            </label>
            <select
              value={selectedCommodityName}
              onChange={(e) => setSelectedCommodityName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {commodities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Mandi Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.selectMandi}
            </label>
            <select
              value={selectedMarketName}
              onChange={(e) => setSelectedMarketName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {markets.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Conversion Selector (KG / QUINTAL / TON) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.selectUnit} (Exact Conversion)
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  unit === 'kg' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => setUnit('quintal')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  unit === 'quintal' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                QUINTAL
              </button>
              <button
                type="button"
                onClick={() => setUnit('ton')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  unit === 'ton' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                TON
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>📐 Formula: <strong>{t.priceConversionFormula}</strong></span>
          <span>📅 Official Mandi Date: <strong className="text-slate-700 dark:text-slate-200">{currentRecord.date}</strong></span>
        </div>
      </div>

      {/* CONVERTED PRICE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Modal Rate Card */}
        <div className="farmer-card p-5 border-2 border-emerald-500/40 space-y-2 bg-gradient-to-b from-emerald-50/40 dark:from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-heading">
              {t.modalRate}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              Average Rate
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            ₹{modalConverted.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isRising ? t.trendIncreasing : t.trendDecreasing} ({currentRecord.priceChangePct1D ?? 0}%)</span>
          </div>
        </div>

        {/* Min Rate Card */}
        <div className="farmer-card p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
            {t.minRate}
          </span>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200 font-heading">
            ₹{minConverted.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            For Grade B / Small lot size
          </div>
        </div>

        {/* Max Rate Card */}
        <div className="farmer-card p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
            {t.maxRate}
          </span>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200 font-heading">
            ₹{maxConverted.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Premium Grade A+ Auction Rate
          </div>
        </div>

        {/* Daily Mandi Arrivals */}
        <div className="farmer-card p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
            {t.dailyArrivals}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
            {currentRecord.arrivalQuantity.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Tonnes</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Moderate inflow • Healthy demand
          </div>
        </div>

      </div>

      {/* 7 INTERACTIVE GRAPHS SECTION */}
      <div className="farmer-card p-6 space-y-5">
        
        {/* Graph Tabs Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'recent', label: t.graphRecentPriceTitle },
              { id: 'ten_year', label: t.graph10YearTitle },
              { id: 'earnings', label: t.graphEarningsTitle },
              { id: 'expenses', label: t.graphExpensesTitle },
              { id: 'profit', label: t.graphProfitLossTitle },
              { id: 'demand', label: t.graphDemandTitle },
              { id: 'arrivals', label: t.graphArrivalsTitle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGraphTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-heading ${
                  activeGraphTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter for Recent Graph */}
          {activeGraphTab === 'recent' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {(['1M', '3M', '6M', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    timeFilter === tf
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf === '1M' ? t.graphFilter1M : tf === '3M' ? t.graphFilter3M : tf === '6M' ? t.graphFilter6M : t.graphFilter1Y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Answer Callout ("Is the price going up or down?") */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="text-base">{isRising ? '📈' : '📉'}</span>
            <span>
              {isRising ? t.graphAnswerUp : t.graphAnswerDown}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
            Tap on any point to see exact values
          </span>
        </div>

        {/* Chart Rendering */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeGraphTab === 'recent' ? (
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹${value} ${unitLabel}`, 'Modal Rate']}
                />
                <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fill="url(#priceGradient)" />
                <Line type="monotone" dataKey="maxPrice" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            ) : activeGraphTab === 'ten_year' ? (
              <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹${value} ${unitLabel}`, '10-Yr Rate']}
                />
                <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : activeGraphTab === 'expenses' ? (
              <BarChart data={graphData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : activeGraphTab === 'profit' ? (
              <BarChart data={graphData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="earnings" fill="#10b981" name="Earnings (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="#38bdf8" name="Profit (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey={activeGraphTab === 'arrivals' ? 'arrivalsTonnes' : 'demandScore'} stroke="#6366f1" fill="#818cf8" fillOpacity={0.3} strokeWidth={2.5} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};
