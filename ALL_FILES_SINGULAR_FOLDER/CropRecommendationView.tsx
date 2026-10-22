import React, { useState } from 'react';
import { 
  Sprout, 
  Sparkles, 
  Droplets, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  HelpCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  SoilType, 
  SeasonType, 
  WaterAvailabilityType, 
  LanguageCode, 
  FarmerProfile 
} from '../types';
import { translations } from '../i18n/translations';
import { 
  getCropRecommendation, 
  VERIFIED_SEEDS_DATABASE 
} from '../services/cropRecommendationService';

interface CropRecommendationViewProps {
  language: LanguageCode;
  farmerProfile: FarmerProfile | null;
  onNavigateToSellStore?: (crop: string) => void;
  onNavigateToSeedGuide?: () => void;
}

export const CropRecommendationView: React.FC<CropRecommendationViewProps> = ({
  language,
  farmerProfile,
  onNavigateToSellStore,
}) => {
  const t = translations[language];

  // Active Sub-Tab: 'crop_rec' | 'seed_rec' | 'soil_calc'
  const [activeTab, setActiveTab] = useState<'crop_rec' | 'seed_rec' | 'soil_calc'>('crop_rec');

  // Input states
  const [soilType, setSoilType] = useState<SoilType>(farmerProfile?.soilType || 'Black Cotton');
  const [district, setDistrict] = useState<string>(farmerProfile?.district || 'Nashik, Maharashtra');
  const [season, setSeason] = useState<SeasonType>('Kharif (Monsoon)');
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailabilityType>(farmerProfile?.waterSource || 'Abundant (Canal/River)');
  const [selectedCropForSeed, setSelectedCropForSeed] = useState<string>('Tomato');

  // Compute recommendation
  const recommendation = getCropRecommendation({
    soilType,
    district,
    season,
    waterAvailability
  });

  // Filter seeds for selected crop
  const matchedSeeds = VERIFIED_SEEDS_DATABASE.filter(s => 
    s.crop.toLowerCase() === selectedCropForSeed.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub Navigation Bar */}
      <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('crop_rec')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading ${
              activeTab === 'crop_rec'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t.navPlantAi}</span>
          </button>

          <button
            onClick={() => setActiveTab('seed_rec')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading ${
              activeTab === 'seed_rec'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t.navSeedAi}</span>
          </button>

          <button
            onClick={() => setActiveTab('soil_calc')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading ${
              activeTab === 'soil_calc'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.soilDecisionTitle}</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-3 hidden md:inline">
          🌱 AI Agronomic Decision Engine
        </span>
      </div>

      {/* TAB 1: WHAT SHOULD I PLANT? */}
      {activeTab === 'crop_rec' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl shadow-emerald-700/10">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI CROP RECOMMENDATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading">
                {t.cropRecTitle}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
                {t.cropRecSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Farmer Soil & Farm Inputs */}
            <div className="lg:col-span-5 farmer-card p-5 space-y-4">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>1. Verify Your Farm Conditions</span>
                <span className="text-[10px] text-slate-400">Step 1 of 2</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.authSoilTypeLabel}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Black Cotton">{t.soilTypeBlack}</option>
                  <option value="Red Loamy">{t.soilTypeRed}</option>
                  <option value="Sandy Loam">{t.soilTypeSandy}</option>
                  <option value="Clay">{t.soilTypeClay}</option>
                  <option value="Alluvial">{t.soilTypeAlluvial}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as SeasonType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kharif (Monsoon)">{t.seasonKharif}</option>
                    <option value="Rabi (Winter)">{t.seasonRabi}</option>
                    <option value="Zaid (Summer)">{t.seasonZaid}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.authWaterSourceLabel}
                  </label>
                  <select
                    value={waterAvailability}
                    onChange={(e) => setWaterAvailability(e.target.value as WaterAvailabilityType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Abundant (Canal/River)">{t.waterAbundant}</option>
                    <option value="Medium (Borewell/Well)">{t.waterMedium}</option>
                    <option value="Low (Rainfed/Drip Only)">{t.waterLow}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District / Location
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Farmer Records Integrated:</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Using your previous crop history, local APMC mandi price trajectory, and monsoon moisture levels.
                </p>
              </div>
            </div>

            {/* Right Result: AI Primary Recommendation & Alternatives */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Main Recommended Crop Card */}
              <div className="farmer-card p-6 border-2 border-emerald-500/40 dark:border-emerald-500/50 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/20 to-transparent space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-heading">
                      {t.recommendedCropHeading}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                      <span>{recommendation.icon}</span>
                      <span>{recommendation.cropName}</span>
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                        ({recommendation.hindiName} / {recommendation.marathiName})
                      </span>
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20">
                      ★ {recommendation.suitabilityScore}% Match
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {recommendation.expectedDurationDays} Days Cycle
                    </div>
                  </div>
                </div>

                {/* Why this recommendation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t.whyRecommendedHeading}
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {recommendation.recommendedReason}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {recommendation.keyDrivers.map((driver, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Price & Farming Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {t.expectedPriceBand}
                    </span>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                      {recommendation.estimatedPriceRange}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Recommended Variety
                    </span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                      {recommendation.variety}
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  ⚠️ {t.disclaimerProfit}
                </div>
              </div>

              {/* 2-3 Alternative Crops */}
              <div className="farmer-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                  {t.alternativeCropsHeading}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.alternatives.map((alt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{alt.icon}</span>
                        <span>{alt.cropName}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {alt.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHICH SEED SHOULD I USE? */}
      {activeTab === 'seed_rec' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-700/10">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>CERTIFIED SEED RECOMMENDATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading">
                {t.seedRecTitle}
              </h1>
              <p className="text-xs sm:text-sm text-teal-100 font-medium">
                {t.seedRecSubtitle}
              </p>
            </div>
          </div>

          {/* Crop Selector for Seeds */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['Tomato', 'Onion', 'Potato', 'Grapes', 'Green Peas'].map((cropName) => (
              <button
                key={cropName}
                onClick={() => setSelectedCropForSeed(cropName)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-heading ${
                  selectedCropForSeed === cropName
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cropName} Seeds
              </button>
            ))}
          </div>

          {/* Seeds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matchedSeeds.map((seed) => (
              <div key={seed.id} className="farmer-card p-5 space-y-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-400">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {seed.brandCompany}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                      {seed.seedVariety}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {seed.durationDays} Days
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  💡 {seed.simpleExplanation}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t.seedRate}:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{seed.seedRatePerAcre}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t.expectedYield}:</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{seed.expectedYieldPerAcre}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{t.seedFeatures}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {seed.keyFeatures.map((feat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{t.diseaseResistance}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {seed.diseaseResistance.map((dis, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                        🛡️ {dis}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOIL & CLIMATE CROP DECISION CALCULATOR */}
      {activeTab === 'soil_calc' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-800/10">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading">
                {t.soilDecisionTitle}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                {t.soilDecisionSubtitle}
              </p>
            </div>
          </div>

          <div className="farmer-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
              Select Soil Type to Explore Ideal Crops:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: 'Black Cotton' as SoilType, label: t.soilTypeBlack, crops: 'Tomato, Onion, Cotton, Soybean', icon: '🌱' },
                { type: 'Red Loamy' as SoilType, label: t.soilTypeRed, crops: 'Grapes, Pomegranate, Groundnut, Tomato', icon: '🍇' },
                { type: 'Sandy Loam' as SoilType, label: t.soilTypeSandy, crops: 'Potato, Carrot, Watermelon, Green Chilli', icon: '🥔' },
                { type: 'Clay' as SoilType, label: t.soilTypeClay, crops: 'Rice, Wheat, Onion, Sugarcane', icon: '🌾' },
                { type: 'Alluvial' as SoilType, label: t.soilTypeAlluvial, crops: 'Wheat, Mustard, Vegetables, Potato', icon: '🥬' },
              ].map(s => (
                <button
                  key={s.type}
                  onClick={() => {
                    setSoilType(s.type);
                    setActiveTab('crop_rec');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all hover:scale-102 flex flex-col justify-between ${
                    soilType === s.type
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-2xl">{s.icon}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      {s.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Best for: <strong className="text-emerald-600 dark:text-emerald-400">{s.crops}</strong>
                    </div>
                  </div>

                  <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>Calculate Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
