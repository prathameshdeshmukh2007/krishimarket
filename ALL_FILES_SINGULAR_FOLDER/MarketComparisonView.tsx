import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  MapPin, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { Commodity, MarketPriceRecord, LanguageCode } from '../types';
import { compareNearbyMarkets } from '../services/marketAnalytics';
import { translations } from '../i18n/translations';

interface MarketComparisonViewProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  language: LanguageCode;
}

export const MarketComparisonView: React.FC<MarketComparisonViewProps> = ({
  prices,
  commodities,
  language
}) => {
  const t = translations[language];

  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [lotQuantity, setLotQuantity] = useState<number>(50); // 50 Quintals
  const [farmerDistrict, setFarmerDistrict] = useState<string>('Nashik');

  const basePriceRecord = useMemo(() => {
    return prices.find(p => p.commodity.toLowerCase().includes(selectedCommodity.toLowerCase().slice(0, 4))) || prices[0];
  }, [prices, selectedCommodity]);

  const comparisons = useMemo(() => {
    return compareNearbyMarkets(
      selectedCommodity,
      farmerDistrict,
      basePriceRecord.modalPrice,
      prices
    );
  }, [selectedCommodity, farmerDistrict, basePriceRecord.modalPrice, prices]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>INTER-MANDI ARBITRAGE & TRUE NET REALISATION</span>
            </h2>
            <p className="text-xs text-slate-400">
              Compare APMC mandis by gross rates, transport freight, handling deductions, and net pocket cash.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Official APMC Rate Matrix</span>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Select Produce</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {commodities.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Your Farm District (Origin)</label>
            <select
              value={farmerDistrict}
              onChange={(e) => setFarmerDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Nashik">Nashik (Maharashtra)</option>
              <option value="Pune">Pune (Maharashtra)</option>
              <option value="Sangli">Sangli (Maharashtra)</option>
              <option value="Kolar">Kolar (Karnataka)</option>
              <option value="Surat">Surat (Gujarat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Lot Consignment Size (Quintals)</label>
            <input
              type="number"
              min="1"
              value={lotQuantity}
              onChange={(e) => setLotQuantity(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Highlights: Best Gross vs Best Net */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisons.find(c => c.isBestGross) && (
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                HIGHEST GROSS MANDI PRICE
              </div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {comparisons.find(c => c.isBestGross)?.marketName}
              </div>
              <div className="text-xs text-slate-400">
                Gross Rate: <strong className="text-cyan-300">₹{comparisons.find(c => c.isBestGross)?.modalPrice}/q</strong> • Distance: {comparisons.find(c => c.isBestGross)?.distanceKm} km
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">Total Gross Lot</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                ₹{((comparisons.find(c => c.isBestGross)?.modalPrice ?? 0) * lotQuantity).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {comparisons.find(c => c.isBestNet) && (
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/20 flex items-center justify-between shadow-lg shadow-emerald-500/10">
            <div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RECOMMENDED: BEST NET REALISATION</span>
              </div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {comparisons.find(c => c.isBestNet)?.marketName}
              </div>
              <div className="text-xs text-slate-300">
                Net Pocket Cash: <strong className="text-emerald-300">₹{comparisons.find(c => c.isBestNet)?.netRealisationPerQ}/q</strong> (After Freight)
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">Total Net in Hand</span>
              <span className="text-xl font-mono font-black text-emerald-400">
                ₹{((comparisons.find(c => c.isBestNet)?.netRealisationPerQ ?? 0) * lotQuantity).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Data Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300 font-bold">
            MANDI-BY-MANDI COMPARATIVE ARBITRAGE MATRIX ({selectedCommodity})
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            All prices in ₹/Quintal • Standard 10-Tonner Truck Logistics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">APMC Market</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Modal Rate</th>
                <th className="py-3 px-3 text-rose-400">Est. Freight /q</th>
                <th className="py-3 px-3 text-rose-400">Handling /q</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">True Net /q</th>
                <th className="py-3 px-4 text-white font-bold">Net Total ({lotQuantity}q)</th>
                <th className="py-3 px-3 text-right">Status / Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {comparisons.map((row) => (
                <tr 
                  key={row.marketName}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.isBestNet ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {row.marketName}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{row.state}</td>
                  <td className="py-3 px-3 text-slate-300 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-400 inline" />
                    {row.distanceKm} km
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-100">
                    ₹{row.modalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-rose-400">
                    -₹{row.transportCostPerQ}
                  </td>
                  <td className="py-3 px-3 text-rose-400">
                    -₹{row.handlingCostPerQ}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                    ₹{row.netRealisationPerQ.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-black text-white text-sm">
                    ₹{(row.netRealisationPerQ * lotQuantity).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {row.isBestNet ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 shadow">
                        ★ BEST NET GAIN
                      </span>
                    ) : row.isBestGross ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        TOP GROSS
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Standard
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Key Insight for Farmers:</strong> A distant mandi with a ₹200 higher price may result in ₹80 lower net realization due to fuel, driver toll, and shrinkage during transit. Always prioritize <strong>True Net Realisation</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
