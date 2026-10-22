import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import { AgriMarketIndex } from '../types';

interface AgriIndexCardProps {
  indices: AgriMarketIndex[];
}

export const AgriIndexCard: React.FC<AgriIndexCardProps> = ({ indices }) => {
  const [selectedIndex, setSelectedIndex] = useState<AgriMarketIndex>(indices[0]);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  const isUp1D = selectedIndex.change1D >= 0;
  const isUp7D = selectedIndex.change7D >= 0;
  const isUp30D = selectedIndex.change30D >= 0;

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-6 border border-slate-800 relative overflow-hidden bg-radial-glow">
      {/* Index Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {indices.map((idx) => (
            <button
              key={idx.code}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                selectedIndex.code === idx.code
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx.code}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Methodology & Notice</span>
        </button>
      </div>

      {/* Main Metric Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Value Display */}
        <div className="lg:col-span-1">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            {selectedIndex.name}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white">
              {selectedIndex.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-mono">pts</span>

            <span
              className={`inline-flex items-center text-sm sm:text-base font-mono font-bold px-2 py-0.5 rounded ${
                isUp1D ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-rose-400 bg-rose-950/60 border border-rose-500/30'
              }`}
            >
              {isUp1D ? <TrendingUp className="w-4 h-4 mr-1 inline" /> : <TrendingDown className="w-4 h-4 mr-1 inline" />}
              {isUp1D ? '+' : ''}{selectedIndex.changePct1D}% (1D)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            {selectedIndex.subtitle} • Base: 2021 = 1000 pts
          </p>
        </div>

        {/* Change Periods Matrix */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-1">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">1-DAY CHANGE</div>
            <div className={`text-sm font-mono font-bold mt-0.5 ${isUp1D ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp1D ? '+' : ''}{selectedIndex.change1D.toFixed(1)} pts
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isUp1D ? '+' : ''}{selectedIndex.changePct1D}%
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">7-DAY CHANGE</div>
            <div className={`text-sm font-mono font-bold mt-0.5 ${isUp7D ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp7D ? '+' : ''}{selectedIndex.change7D.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Weekly Shift</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">30-DAY CHANGE</div>
            <div className={`text-sm font-mono font-bold mt-0.5 ${isUp30D ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp30D ? '+' : ''}{selectedIndex.change30D.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Monthly Trend</div>
          </div>
        </div>

        {/* Constituents Mini-Bar */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 lg:col-span-1">
          <div className="text-[11px] font-mono text-slate-300 font-semibold mb-2 flex items-center justify-between">
            <span>Key Benchmark Constituents</span>
            <span className="text-[10px] text-slate-400">Modal Rates</span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {selectedIndex.constituents.map((c) => (
              <div key={c.commodity} className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {c.commodity} ({c.weightPct}%)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-100 font-bold">₹{c.modalPrice}/q</span>
                  <span className={c.changePct >= 0 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                    {c.changePct >= 0 ? '+' : ''}{c.changePct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology & Legal Notice Collapse */}
      {showMethodology && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3.5 rounded-lg">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Info className="w-4 h-4" />
            <span>Informational Index Methodology & Non-Tradable Commodity Notice:</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {selectedIndex.methodology}
          </p>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> This index is designed strictly for agricultural price transparency, harvest planning, and physical produce seller intelligence. It is NOT a financial derivative, security, share index, or tradable instrument.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
