import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplets, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Scale
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { EXOTIC_CROPS_CATALOG } from '../services/cropRecommendationService';

interface ExoticCropsViewProps {
  language: LanguageCode;
  onNavigateToPlantAi?: () => void;
}

export const ExoticCropsView: React.FC<ExoticCropsViewProps> = ({ language }) => {
  const t = translations[language];
  const [selectedCropId, setSelectedCropId] = useState<string>(EXOTIC_CROPS_CATALOG[0].id);

  const activeCrop = EXOTIC_CROPS_CATALOG.find(c => c.id === selectedCropId) || EXOTIC_CROPS_CATALOG[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-emerald-700 text-white shadow-xl shadow-purple-700/10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>HIGH VALUE EXOTIC CROPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            {t.exoticCropsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium">
            {t.exoticCropsSubtitle}
          </p>
        </div>
      </div>

      {/* Horizontal Crop Cards Carousel / Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {EXOTIC_CROPS_CATALOG.map((crop) => (
          <button
            key={crop.id}
            type="button"
            onClick={() => setSelectedCropId(crop.id)}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
              selectedCropId === crop.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-500/30 shadow-md scale-[1.02]'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-purple-300'
            }`}
          >
            <span className="text-3xl mb-1">{crop.icon}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-heading leading-tight">
              {crop.name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {crop.samplePriceRange}
            </span>
          </button>
        ))}
      </div>

      {/* Detailed Crop Cultivation Guide Panel */}
      <div className="farmer-card p-6 border-2 border-purple-500/30 space-y-6">
        
        {/* Crop Hero Card */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={activeCrop.image}
            alt={activeCrop.name}
            className="w-full md:w-64 h-48 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <span>{activeCrop.icon}</span>
                  <span>{activeCrop.name}</span>
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeCrop.hindiName} • {activeCrop.marathiName}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase">Estimated Realization:</span>
                <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-heading">
                  {activeCrop.samplePriceRange}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeCrop.summary}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold">
                🗓️ {activeCrop.season}
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                💧 {activeCrop.waterRequirements}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Box Technical Cultivation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Box 1: How to Plant & Soil */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
              <span>🌱</span>
              <span>{t.howToPlantHeading}</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeCrop.howToPlant}
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <strong>Soil Requirement:</strong> {activeCrop.soil}
            </div>
          </div>

          {/* Box 2: Seed / Planting Material */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
              <span>🌾</span>
              <span>Seed & Planting Material</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeCrop.seedOrPlantingMaterial}
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <strong>Harvest Cycle:</strong> {activeCrop.harvestTimeline}
            </div>
          </div>

          {/* Box 3: Key Cultivation Steps */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 md:col-span-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
              <span>📋</span>
              <span>Step-by-Step Cultivation Practices</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {activeCrop.basicCultivation.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 4: Market Opportunities & Buyers */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 md:col-span-2">
            <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <span>🏢</span>
              <span>{t.marketOppHeading}</span>
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {activeCrop.marketOpportunity}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Target Buyers:</span>
              {activeCrop.potentialBuyers.map((b, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 text-[11px] font-bold">
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
          ⚠️ {t.disclaimerProfit}
        </div>

      </div>
    </div>
  );
};
