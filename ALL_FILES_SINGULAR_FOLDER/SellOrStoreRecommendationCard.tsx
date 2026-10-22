import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Warehouse, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  Scale, 
  ShieldCheck, 
  Info,
  DollarSign,
  Activity,
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  Commodity, 
  LanguageCode, 
  SellStoreAnalysisInput, 
  PriceTrendDirection, 
  ArrivalsLevel, 
  DemandLevel,
  SellStoreRecommendationAction
} from '../types';
import { evaluateSellOrStoreRecommendation, CROP_ANALYSIS_PRESETS } from '../services/aiEngine';
import { translations } from '../i18n/translations';

interface SellOrStoreRecommendationCardProps {
  commodities?: Commodity[];
  language: LanguageCode;
  onNavigateToLots?: (commodity: string, action: string) => void;
  standaloneView?: boolean;
}

export const SellOrStoreRecommendationCard: React.FC<SellOrStoreRecommendationCardProps> = ({
  commodities,
  language,
  onNavigateToLots,
  standaloneView = false
}) => {
  const t = translations[language];

  // Active Crop Preset Selection
  const [selectedCropKey, setSelectedCropKey] = useState<string>('Tomato');
  const [unitMode, setUnitMode] = useState<'kg' | 'quintal'>('kg');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Editable Input State (initialized from preset)
  const initialPreset = CROP_ANALYSIS_PRESETS['Tomato'];
  const [customCropName, setCustomCropName] = useState<string>(initialPreset.cropName);
  const [currentPricePerQ, setCurrentPricePerQ] = useState<number>(initialPreset.currentPricePerQ);
  const [priceTrend, setPriceTrend] = useState<PriceTrendDirection>(initialPreset.priceTrend);
  const [marketArrivals, setMarketArrivals] = useState<ArrivalsLevel>(initialPreset.marketArrivals);
  const [buyerDemand, setBuyerDemand] = useState<DemandLevel>(initialPreset.buyerDemand);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(initialPreset.storageAvailable);
  const [storageType, setStorageType] = useState<string>(initialPreset.storageType || 'Cold Storage');
  const [storageCostPerDayPerQ, setStorageCostPerDayPerQ] = useState<number>(initialPreset.storageCostPerDayPerQ);
  const [sellingPeriodDays, setSellingPeriodDays] = useState<number>(initialPreset.expectedSellingPeriodDays);
  const [perishable, setPerishable] = useState<boolean>(initialPreset.perishable);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(initialPreset.shelfLifeDays);

  // Handle Preset Switching
  const handleSelectPreset = (cropKey: string) => {
    setSelectedCropKey(cropKey);
    const preset = CROP_ANALYSIS_PRESETS[cropKey];
    if (preset) {
      setCustomCropName(preset.cropName);
      setCurrentPricePerQ(preset.currentPricePerQ);
      setPriceTrend(preset.priceTrend);
      setMarketArrivals(preset.marketArrivals);
      setBuyerDemand(preset.buyerDemand);
      setStorageAvailable(preset.storageAvailable);
      setStorageType(preset.storageType || 'Cold Storage');
      setStorageCostPerDayPerQ(preset.storageCostPerDayPerQ);
      setSellingPeriodDays(preset.expectedSellingPeriodDays);
      setPerishable(preset.perishable);
      setShelfLifeDays(preset.shelfLifeDays);
    }
  };

  // Compile active input parameters for AI analysis
  const currentInput: SellStoreAnalysisInput = useMemo(() => {
    const preset = CROP_ANALYSIS_PRESETS[selectedCropKey] || CROP_ANALYSIS_PRESETS['Tomato'];
    return {
      cropName: customCropName,
      variety: preset.variety,
      currentPricePerQ,
      historicalPricesPerQ: preset.historicalPricesPerQ,
      priceTrend,
      marketArrivals,
      buyerDemand,
      storageAvailable,
      storageType: storageType as any,
      storageCostPerDayPerQ,
      expectedSellingPeriodDays: sellingPeriodDays,
      perishable,
      shelfLifeDays
    };
  }, [
    selectedCropKey,
    customCropName,
    currentPricePerQ,
    priceTrend,
    marketArrivals,
    buyerDemand,
    storageAvailable,
    storageType,
    storageCostPerDayPerQ,
    sellingPeriodDays,
    perishable,
    shelfLifeDays
  ]);

  // Run AI Decision Engine
  const analysisResult = useMemo(() => {
    return evaluateSellOrStoreRecommendation(currentInput);
  }, [currentInput]);

  // Format helper for dual units
  const formatPrice = (pricePerKg: number, pricePerQ: number) => {
    if (unitMode === 'kg') {
      return `₹${pricePerKg.toFixed(1)}/kg`;
    }
    return `₹${pricePerQ.toLocaleString('en-IN')}/q`;
  };

  // Visual status theme based on recommendation
  const theme = useMemo(() => {
    switch (analysisResult.recommendation) {
      case 'SELL_NOW':
        return {
          badgeBg: 'bg-emerald-500/15',
          badgeBorder: 'border-emerald-500/50',
          badgeText: 'text-emerald-400',
          gradientBg: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
          glowRing: 'ring-emerald-500/30',
          accentColor: '#10b981',
          label: t.recSellNow,
          icon: TrendingUp,
          actionColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
        };
      case 'STORE':
        return {
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/50',
          badgeText: 'text-amber-400',
          gradientBg: 'from-amber-950/40 via-slate-900/90 to-slate-950',
          glowRing: 'ring-amber-500/30',
          accentColor: '#f59e0b',
          label: t.recStore,
          icon: Warehouse,
          actionColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
        };
      case 'MONITOR':
      default:
        return {
          badgeBg: 'bg-sky-500/15',
          badgeBorder: 'border-sky-500/50',
          badgeText: 'text-sky-400',
          gradientBg: 'from-sky-950/40 via-slate-900/90 to-slate-950',
          glowRing: 'ring-sky-500/30',
          accentColor: '#0ea5e9',
          label: t.recMonitor,
          icon: Clock,
          actionColor: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
        };
    }
  }, [analysisResult.recommendation, t]);

  const CurrentIcon = theme.icon;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${theme.badgeBorder} bg-gradient-to-br ${theme.gradientBg} shadow-2xl relative overflow-hidden transition-all duration-300`}>
        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.sellOrStoreTitle.toUpperCase()}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                🧪 {t.prototypeDataLabel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {t.sellOrStoreTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {t.sellOrStoreSubtitle}
            </p>
          </div>

          {/* Unit Toggle (₹/kg vs ₹/q) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono text-slate-400">Unit:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setUnitMode('kg')}
                className={`px-3 py-1 rounded transition-colors ${
                  unitMode === 'kg' 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ₹ / kg
              </button>
              <button
                onClick={() => setUnitMode('quintal')}
                className={`px-3 py-1 rounded transition-colors ${
                  unitMode === 'quintal' 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ₹ / Quintal
              </button>
            </div>
          </div>
        </div>

        {/* Crop Quick-Select Carousel / Chips */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-semibold text-slate-300">Select Crop Scenario (Prototype Datasets):</span>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors"
            >
              {isCustomizing ? 'Hide Custom Inputs ▲' : 'Customize Market Inputs ▼'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {Object.keys(CROP_ANALYSIS_PRESETS).map((cropKey) => {
              const preset = CROP_ANALYSIS_PRESETS[cropKey];
              const isSelected = selectedCropKey === cropKey;
              return (
                <button
                  key={cropKey}
                  onClick={() => handleSelectPreset(cropKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40 font-bold'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">
                    {cropKey === 'Tomato' ? '🍅' : 
                     cropKey === 'Onion' ? '🧅' : 
                     cropKey === 'Potato' ? '🥔' : 
                     cropKey === 'Cabbage' ? '🥬' : 
                     cropKey === 'Grapes' ? '🍇' : 
                     cropKey === 'Green Peas' ? '🫛' : '🍎'}
                  </span>
                  <span>{preset.cropName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (₹{unitMode === 'kg' ? (preset.currentPricePerQ / 100).toFixed(0) + '/kg' : preset.currentPricePerQ + '/q'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Custom Input Parameters Panel */}
        {isCustomizing && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono animate-fadeIn">
            {/* Price input */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Current Price (₹/Quintal)</label>
              <input
                type="number"
                value={currentPricePerQ}
                onChange={(e) => setCurrentPricePerQ(Number(e.target.value) || 100)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-emerald-400 mt-0.5 block">
                = ₹{(currentPricePerQ / 100).toFixed(1)}/kg
              </span>
            </div>

            {/* Price Trend */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Price Trend Direction</label>
              <select
                value={priceTrend}
                onChange={(e) => setPriceTrend(e.target.value as PriceTrendDirection)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="RISING">↗ Increasing / Bullish</option>
                <option value="STABLE">→ Stable / Flat</option>
                <option value="FALLING">↘ Decreasing / Bearish</option>
              </select>
            </div>

            {/* Market Arrivals */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Mandi Arrivals (Supply)</label>
              <select
                value={marketArrivals}
                onChange={(e) => setMarketArrivals(e.target.value as ArrivalsLevel)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW_SUPPLY">Low Supply (Tighter Mandi Inflow)</option>
                <option value="NORMAL">Normal / Balanced Volume</option>
                <option value="HIGH_INFLOW">High Inflow (Heavy Arrivals Surge)</option>
              </select>
            </div>

            {/* Buyer Demand */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Buyer Demand Level</label>
              <select
                value={buyerDemand}
                onChange={(e) => setBuyerDemand(e.target.value as DemandLevel)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="HIGH">High (Active Bidding)</option>
                <option value="MODERATE">Moderate / Steady</option>
                <option value="LOW">Low (Weak Inquiries)</option>
              </select>
            </div>

            {/* Storage Available Toggle */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Storage Access</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="storage-toggle"
                  checked={storageAvailable}
                  onChange={(e) => setStorageAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <label htmlFor="storage-toggle" className="text-slate-200 cursor-pointer text-xs">
                  {storageAvailable ? 'Storage Available' : 'No Storage (Direct Mandi)'}
                </label>
              </div>
            </div>

            {/* Storage Cost */}
            {storageAvailable && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Storage Cost (₹/Quintal/Day)</label>
                <input
                  type="number"
                  step="0.5"
                  value={storageCostPerDayPerQ}
                  onChange={(e) => setStorageCostPerDayPerQ(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Expected Selling Period */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Expected Selling Period</label>
              <input
                type="number"
                min="1"
                max="60"
                value={sellingPeriodDays}
                onChange={(e) => setSellingPeriodDays(Number(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Target holding window in days</span>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => handleSelectPreset(selectedCropKey)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Preset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Decision Output & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Result Card with Simple Farmer-Friendly Format */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Recommendation Banner */}
          <div className={`p-6 rounded-2xl border ${theme.badgeBorder} bg-slate-900/90 shadow-xl space-y-5 relative overflow-hidden`}>
            {/* Top Tag & Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                {t.cropLabel}: <strong className="text-white">{analysisResult.cropName}</strong>
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} flex items-center gap-1.5`}>
                <CurrentIcon className="w-3.5 h-3.5" />
                <span>{theme.label}</span>
              </span>
            </div>

            {/* Clean Farmer-Friendly Summary Format (Requirement 5 & 9) */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400">{t.currentPriceLabel}:</span>
                <span className="text-base font-bold text-white">
                  {formatPrice(analysisResult.currentPricePerKg, analysisResult.currentPricePerQ)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400">{t.expectedPriceRangeLabel}:</span>
                <span className="text-base font-bold text-emerald-400">
                  {unitMode === 'kg' 
                    ? `₹${analysisResult.expectedMinPricePerKg}–₹${analysisResult.expectedMaxPricePerKg}/kg`
                    : `₹${analysisResult.expectedMinPricePerQ.toLocaleString('en-IN')}–₹${analysisResult.expectedMaxPricePerQ.toLocaleString('en-IN')}/q`}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${theme.badgeBg} ${theme.badgeBorder}`}>
                <span className="text-xs font-bold text-slate-300">{t.recommendationLabel}:</span>
                <span className={`text-lg font-black tracking-wide ${theme.badgeText} flex items-center gap-1.5`}>
                  <CurrentIcon className="w-5 h-5" />
                  <span>{theme.label}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400">{t.suggestedSellingWindowLabel}:</span>
                <span className="text-sm font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{analysisResult.suggestedSellingWindow}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400">{t.confidenceLabel}:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${
                    analysisResult.confidence === 'High' ? 'text-emerald-400' :
                    analysisResult.confidence === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {analysisResult.confidence}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({analysisResult.confidenceScore}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Arbitrage Economics Box */}
            {analysisResult.recommendation === 'STORE' && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs font-mono">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4" />
                  <span>Estimated Storage Economics ({analysisResult.storageEconomics.holdingDays} Days):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block">Total Storage Cost:</span>
                    <span className="text-rose-400 font-bold">
                      {unitMode === 'kg' 
                        ? `-₹${analysisResult.storageEconomics.totalStorageCostPerKg}/kg` 
                        : `-₹${analysisResult.storageEconomics.totalStorageCostPerQ}/q`}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block">Est. Net Advantage:</span>
                    <span className="text-emerald-400 font-bold">
                      {unitMode === 'kg' 
                        ? `+₹${analysisResult.storageEconomics.expectedNetBenefitPerKg}/kg` 
                        : `+₹${analysisResult.storageEconomics.expectedNetBenefitPerQ}/q`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mandatory Non-Guarantee Disclaimer (Requirement 6) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed font-mono">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {t.prototypeDisclaimerNote}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Price Trend Graph & "Why this recommendation?" Section */}
        <div className="lg:col-span-7 space-y-5">
          {/* Price Trend Graph (Requirement 7) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>{t.priceTrendChartTitle}</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Past 7 Days → Current Spot Rate → Expected Future Selling Window
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>Historical</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Current / Target</span>
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400"></span>
                  <span>Expected Range</span>
                </span>
              </div>
            </div>

            {/* Recharts Clean Line Chart */}
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analysisResult.trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expectedRangeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.accentColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={theme.accentColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="dayLabel" 
                    stroke="#64748b" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    stroke="#10b981" 
                    domain={['dataMin - (dataMin * 0.08)', 'dataMax + (dataMax * 0.08)']} 
                    tick={{ fontSize: 10, fill: '#10b981' }}
                    tickFormatter={(v) => unitMode === 'kg' ? `₹${(v / 100).toFixed(0)}` : `₹${v}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs font-mono space-y-1">
                            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                              <span>{point.dayLabel} ({point.date})</span>
                              {point.isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-bold">
                                  CURRENT SPOT
                                </span>
                              )}
                              {point.isProjected && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">
                                  EXPECTED
                                </span>
                              )}
                            </div>
                            <div className="text-emerald-400 font-bold text-sm">
                              Price: {unitMode === 'kg' ? `₹${point.pricePerKg}/kg` : `₹${point.price}/q`}
                            </div>
                            {point.isProjected && (
                              <div className="text-cyan-300 text-[11px]">
                                Expected Range: {unitMode === 'kg' 
                                  ? `₹${point.expectedMinPricePerKg} – ₹${point.expectedMaxPricePerKg}/kg` 
                                  : `₹${point.expectedMinPrice} – ₹${point.expectedMaxPrice}/q`}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Shaded Expected Area for projected section */}
                  <Area
                    type="monotone"
                    dataKey={unitMode === 'kg' ? "pricePerKg" : "price"}
                    name="Price Trajectory"
                    stroke={theme.accentColor}
                    strokeWidth={2.5}
                    fill="url(#expectedRangeGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.isCurrent) {
                        return (
                          <circle key="current-dot" cx={cx} cy={cy} r={6} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
                        );
                      }
                      return (
                        <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3.5} fill={payload.isProjected ? theme.accentColor : '#64748b'} />
                      );
                    }}
                  />
                  {/* Expected Max bound dashed */}
                  <Line
                    type="monotone"
                    dataKey={unitMode === 'kg' ? "expectedMaxPricePerKg" : "expectedMaxPrice"}
                    name="Max Expected Bound"
                    stroke="#06b6d4"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  {/* Expected Min bound dashed */}
                  <Line
                    type="monotone"
                    dataKey={unitMode === 'kg' ? "expectedMinPricePerKg" : "expectedMinPrice"}
                    name="Min Expected Bound"
                    stroke="#64748b"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* "Why this recommendation?" Section (Requirement 8) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{t.whyRecommendationTitle}</span>
            </div>

            {/* Plain-Language Farmer Rationale */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              <p className="font-medium text-slate-100">
                "{analysisResult.whyRecommendation}"
              </p>
            </div>

            {/* Structured Factor Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {analysisResult.keyDrivers.map((driver, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                      driver.impact === 'POSITIVE_FOR_HOLDING' ? 'text-amber-400' :
                      driver.impact === 'FAVORS_SELLING_NOW' ? 'text-emerald-400' : 'text-sky-400'
                    }`} />
                    <span>{driver.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal pl-5">
                    {driver.description}
                  </p>
                </div>
              ))}

              {/* Demand & Arrivals Driver Summary */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Market Forces Indicator</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-normal pl-5 space-y-0.5">
                  <div>Buyer Demand: <strong className="text-slate-200">{buyerDemand}</strong></div>
                  <div>Mandi Inflow: <strong className="text-slate-200">{marketArrivals.replace('_', ' ')}</strong></div>
                </div>
              </div>

              {/* Storage Feasibility Driver */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Storage Feasibility</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-normal pl-5 space-y-0.5">
                  <div>Status: <strong className="text-slate-200">{storageAvailable ? `${storageType} (Available)` : 'No Storage'}</strong></div>
                  <div>Shelf-Life: <strong className="text-slate-200">{shelfLifeDays} days ({perishable ? 'Perishable' : 'Dry Warehouse'})</strong></div>
                </div>
              </div>
            </div>

            {/* Quick Action Button to List Produce or Create Passport Lot */}
            {onNavigateToLots && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigateToLots(analysisResult.cropName, analysisResult.recommendation)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${theme.actionColor}`}
                >
                  <span>List {analysisResult.cropName} on Marketplace with {theme.label} Strategy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
