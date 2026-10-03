import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Split, 
  DollarSign, 
  Warehouse, 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle,
  Package,
  Layers
} from 'lucide-react';
import { Commodity, MarketPriceRecord, LanguageCode } from '../types';
import { evaluateFarmerDecision } from '../services/aiEngine';
import { translations } from '../i18n/translations';
import { SellOrStoreRecommendationCard } from './SellOrStoreRecommendationCard';

interface FarmerDecisionHeroViewProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  language: LanguageCode;
  onCreateLotWithStrategy?: (commodity: string, qty: number, strategy: string) => void;
}

export const FarmerDecisionHeroView: React.FC<FarmerDecisionHeroViewProps> = ({
  prices,
  commodities,
  language,
  onCreateLotWithStrategy
}) => {
  const t = translations[language];

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'sell_or_store' | 'lot_calculator'>('sell_or_store');

  // Inputs
  const [commodity, setCommodity] = useState<string>('Tomato');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(85);
  const [locationDistrict, setLocationDistrict] = useState<string>('Nashik, Maharashtra');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>('2026-08-30');
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);
  const [storageCostPerDay, setStorageCostPerDay] = useState<number>(4.0);

  // Active modal price lookup
  const currentRecord = prices.find(p => p.commodity.toLowerCase().includes(commodity.toLowerCase().slice(0, 4))) || prices[0];

  // Run AI Decision Engine
  const decision = evaluateFarmerDecision({
    commodity,
    quantityQuintals,
    locationDistrict,
    expectedHarvestDate,
    storageAvailable,
    storageCostPerDayPerQ: storageCostPerDay,
    currentModalPrice: currentRecord.modalPrice,
    bestBuyerOfferPrice: currentRecord.modalPrice + 80 // Example active buyer premium
  });

  return (
    <div className="space-y-6">
      {/* Sub-Nav View Switcher: AI Sell or Store vs Harvest Lot Calculator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveSubTab('sell_or_store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSubTab === 'sell_or_store'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SELL OR STORE RECOMMENDATION</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-950 text-emerald-400 border border-emerald-400/40">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('lot_calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSubTab === 'lot_calculator'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>NET CASH & HARVEST LOT CALCULATOR</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 px-3 hidden sm:inline">
          Prototype Market Intelligence
        </span>
      </div>

      {/* Main Tab 1: AI Sell or Store Recommendation Feature */}
      {activeSubTab === 'sell_or_store' && (
        <SellOrStoreRecommendationCard
          commodities={commodities}
          language={language}
          onNavigateToLots={(crop, strategy) => {
            if (onCreateLotWithStrategy) {
              onCreateLotWithStrategy(crop, 50, strategy);
            }
          }}
        />
      )}

      {/* Main Tab 2: Custom Harvest Lot Net Realisation Breakdown */}
      {activeSubTab === 'lot_calculator' && (
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-radial-glow relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI PHYSICAL CROP DECISION ENGINE (HERO)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {t.decisionTitle}
              </h1>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {t.decisionSubtitle}. Optimize physical harvest timing, cold storage holding vs immediate sell-off, and true net cash in hand.
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Farmer Crop Lot Inputs */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>1. Enter Your Crop & Harvest Details</span>
            <span className="text-[10px] text-slate-400">Step 1 of 2</span>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">{t.selectCrop}</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {commodities.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name} ({c.hindiName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">{t.enterQuantity}</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">Quintals (100kg)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">{t.selectLocation}</label>
            <input
              type="text"
              value={locationDistrict}
              onChange={(e) => setLocationDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 font-semibold">{t.expectedHarvest}</label>
            <input
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Storage Toggle */}
          <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-200 font-medium flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <span>{t.storageAccess}</span>
              </span>
              <input
                type="checkbox"
                checked={storageAvailable}
                onChange={(e) => setStorageAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {storageAvailable && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  {t.storageCostDay}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={storageCostPerDay}
                  onChange={(e) => setStorageCostPerDay(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between font-mono">
            <span>Reference Spot Rate:</span>
            <strong className="text-emerald-400">₹{currentRecord.modalPrice}/q ({currentRecord.market})</strong>
          </div>
        </div>

        {/* Right Column: AI Recommendation & Net Realisation Output */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Hero Recommendation Card */}
          <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
            decision.action === 'SELL_NOW' 
              ? 'border-emerald-500/60 bg-emerald-950/20' 
              : decision.action === 'WAIT'
              ? 'border-amber-500/60 bg-amber-950/20'
              : 'border-teal-500/60 bg-teal-950/20'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  AI RECOMMENDATION FOR {quantityQuintals}Q OF {commodity.toUpperCase()}
                </span>

                <div className="flex items-center gap-3">
                  <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    decision.action === 'SELL_NOW' ? 'text-emerald-400' :
                    decision.action === 'WAIT' ? 'text-amber-400' : 'text-teal-400'
                  }`}>
                    {decision.action === 'SELL_NOW' ? t.actionSellNow :
                     decision.action === 'WAIT' ? t.actionWait : t.actionPartial}
                  </div>
                </div>
              </div>

              {/* Split Strategy Badges */}
              <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <div className="text-center px-2 border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">SELL NOW</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{decision.sellPercentage}%</div>
                </div>
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-400 font-mono">HOLD</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{decision.holdPercentage}%</div>
                </div>
              </div>
            </div>

            {/* Why Title & Points */}
            <div className="mt-4">
              <div className="text-xs font-mono text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.whyTitle}</span>
              </div>
              <div className="space-y-2">
                {decision.reasons.map((r, i) => (
                  <div key={i} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Warnings */}
            {decision.risks.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="text-amber-400 font-mono font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Key Risk Factors to Monitor:</span>
                </div>
                {decision.risks.map((rk, i) => (
                  <p key={i} className="text-slate-400 pl-5 text-[11px]">{rk}</p>
                ))}
              </div>
            )}
          </div>

          {/* True Net Realisation Breakdown */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{t.netRealisationTitle}</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Total Lot: {quantityQuintals} Quintals</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">{t.grossSale}</div>
                <div className="text-base font-mono font-bold text-slate-100 mt-1">
                  ₹{decision.breakdown.grossSaleValue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">₹{decision.currentModalPricePerQ}/q</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-rose-400">{t.transportCost}</div>
                <div className="text-base font-mono font-bold text-rose-400 mt-1">
                  -₹{decision.breakdown.estimatedTransportCost.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">₹35/q (Farmgate-Mandi)</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-rose-400">{t.storageCost}</div>
                <div className="text-base font-mono font-bold text-rose-400 mt-1">
                  -₹{decision.breakdown.estimatedStorageCost.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">{decision.holdPercentage}% held in cold hub</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-rose-400">{t.handlingCost}</div>
                <div className="text-base font-mono font-bold text-rose-400 mt-1">
                  -₹{decision.breakdown.estimatedHandlingCost.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Loading + Weighing</div>
              </div>
            </div>

            {/* Total Net In Pocket Cash */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {t.estimatedNetCash} (In Farmer's Bank Account)
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 mt-0.5">
                  ₹{decision.breakdown.netRealisationTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Effective Realisation / Quintal</span>
                <span className="text-lg font-mono font-bold text-white">
                  ₹{decision.expectedNetRealisationPerQ.toLocaleString('en-IN')}/q
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA: Create Digital Lot with this Strategy */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-300">
              Ready to list this produce lot with verified provenance passport?
            </div>

            <button
              onClick={() => onCreateLotWithStrategy && onCreateLotWithStrategy(commodity, quantityQuintals, decision.action)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-md shadow-emerald-500/20 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Create Digital Crop Lot #AGRI-XXXX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 italic text-center font-mono">
            * {t.disclaimerDecision}
          </p>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

