import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Building, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CropLot, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface FpoAggregationViewProps {
  cropLots: CropLot[];
  language: LanguageCode;
  onAddAggregatedLot?: (lot: CropLot) => void;
}

export const FpoAggregationView: React.FC<FpoAggregationViewProps> = ({
  cropLots,
  language,
  onAddAggregatedLot
}) => {
  const t = translations[language];

  const [selectedFarmers, setSelectedFarmers] = useState<Array<{ name: string; qty: number; crop: string }>>([
    { name: 'Ramesh Patil (Pimpalgaon)', qty: 70, crop: 'Onion' },
    { name: 'Anjali Deshmukh (Dindori)', qty: 90, crop: 'Onion' },
    { name: 'Vikas Jadhav (Chandwad)', qty: 80, crop: 'Onion' }
  ]);

  const [newFarmerName, setNewFarmerName] = useState<string>('');
  const [newFarmerQty, setNewFarmerQty] = useState<number>(50);
  const [selectedCrop, setSelectedCrop] = useState<string>('Onion');
  const [aggregatedSuccess, setAggregatedSuccess] = useState<boolean>(false);

  const totalQuantityQuintals = selectedFarmers.reduce((sum, f) => sum + f.qty, 0);
  const totalTonnes = (totalQuantityQuintals / 10).toFixed(1);

  // Bulk Buyer Demand matching
  const matchingBulkBuyers = [
    {
      company: 'Reliance Fresh Central Distribution Hub',
      buyerType: 'Retail Chain Aggregator',
      minQtyRequiredTonnes: 20,
      offeredBulkPricePerQ: 2820,
      premiumOverLocalPerQ: 120,
      paymentTerms: 'T+1 Escrow Auto-Release',
      trustScore: 98.4
    },
    {
      company: 'ITC Agri Business Division',
      buyerType: 'Institutional Processor',
      minQtyRequiredTonnes: 15,
      offeredBulkPricePerQ: 2790,
      premiumOverLocalPerQ: 90,
      paymentTerms: 'Direct RTGS to FPO Bank Account',
      trustScore: 97.0
    }
  ];

  const handleAddFarmer = () => {
    if (!newFarmerName || newFarmerQty <= 0) return;
    setSelectedFarmers([...selectedFarmers, { name: newFarmerName, qty: newFarmerQty, crop: selectedCrop }]);
    setNewFarmerName('');
    setNewFarmerQty(50);
  };

  const handleCreateBulkLot = () => {
    setAggregatedSuccess(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>FPO BULK CROP LOT AGGREGATION ENGINE</span>
            </h2>
            <p className="text-xs text-slate-400">
              Combine smallholder farmer lots into standardized 20+ Tonne consignments to unlock institutional bulk buyer premiums.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/40">
            FPO Portal: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pool Smallholder Lots */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono text-emerald-400 font-bold uppercase">
              1. Member Farmers Aggregation Pool
            </h3>
            <span className="text-xs font-mono text-slate-400">{selectedFarmers.length} Farmers</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {selectedFarmers.map((farmer, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-white font-semibold">{farmer.name}</div>
                    <div className="text-[10px] text-slate-400">{farmer.crop}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{farmer.qty} Quintals</div>
                  <div className="text-[10px] text-slate-500">{(farmer.qty / 10).toFixed(1)} MT</div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Farmer Row */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">Add Member Farmer Lot</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Farmer Name & Village"
                value={newFarmerName}
                onChange={(e) => setNewFarmerName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
              />
              <input
                type="number"
                placeholder="Quintals"
                value={newFarmerQty}
                onChange={(e) => setNewFarmerQty(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
              />
            </div>
            <button
              onClick={handleAddFarmer}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-xs"
            >
              + Add to Bulk Pool
            </button>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Total Aggregated Volume</span>
              <div className="text-2xl font-black text-emerald-400">{totalQuantityQuintals} Quintals</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase">Metric Tonnes</span>
              <div className="text-xl font-bold text-white">{totalTonnes} MT</div>
            </div>
          </div>
        </div>

        {/* Right Column: Bulk Buyer Matches & Execution */}
        <div className="lg:col-span-7 space-y-4">
          {/* Match Alert Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>BULK MATCH FOUND: 20+ TONNE INSTITUTIONAL BUYERS</span>
            </div>

            <h3 className="text-xl font-bold text-white font-mono">
              Aggregated Pool of {totalTonnes} Tonnes Qualifies for Bulk Premium Pricing
            </h3>
            <p className="text-xs text-slate-300">
              Institutional buyers pay an estimated <strong className="text-emerald-300">+₹90–₹120/q extra</strong> for aggregated, quality-graded single-invoice lots.
            </p>
          </div>

          {/* Institutional Bulk Buyer Cards */}
          <div className="space-y-3">
            {matchingBulkBuyers.map((buyer, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white font-mono">{buyer.company}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      Trust: {buyer.trustScore}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Requirement: <strong className="text-slate-200">{buyer.minQtyRequiredTonnes}+ Tonnes</strong> • {buyer.buyerType}
                  </p>

                  <div className="text-xs text-emerald-400 font-mono font-medium">
                    Bulk Offer: <strong>₹{buyer.offeredBulkPricePerQ}/q</strong> (+₹{buyer.premiumOverLocalPerQ}/q Premium)
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-400">Total Lot Value</div>
                  <div className="text-lg font-mono font-black text-emerald-400">
                    ₹{(buyer.offeredBulkPricePerQ * totalQuantityQuintals).toLocaleString('en-IN')}
                  </div>

                  <button
                    onClick={handleCreateBulkLot}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow transition-colors"
                  >
                    Accept & Lock Bulk Deal
                  </button>
                </div>
              </div>
            ))}
          </div>

          {aggregatedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Bulk lot #AGRI-2026-FPO-BULK-001 created & locked with buyer! Multi-farmer settlement split activated.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
