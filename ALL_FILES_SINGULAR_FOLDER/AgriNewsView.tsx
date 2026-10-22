import React, { useState } from 'react';
import { 
  Newspaper, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  Droplets, 
  Wind,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { MOCK_AGRI_NEWS, MOCK_WEATHER_HAZARDS } from '../services/cropRecommendationService';

interface AgriNewsViewProps {
  language: LanguageCode;
}

export const AgriNewsView: React.FC<AgriNewsViewProps> = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'all' | 'schemes' | 'hazards'>('all');

  const filteredNews = MOCK_AGRI_NEWS.filter(n => {
    if (activeTab === 'schemes') return n.isGovernmentScheme;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 text-white shadow-xl shadow-emerald-700/10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
            <Newspaper className="w-3.5 h-3.5 text-amber-300" />
            <span>VERIFIED AGRICULTURAL NEWS & GOVERNMENT SCHEMES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            {t.agriNewsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            {t.agriNewsSubtitle}
          </p>
        </div>
      </div>

      {/* Filter Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'all', label: t.tabAllNews, icon: '📰' },
          { id: 'schemes', label: t.tabSchemes, icon: '🏛️' },
          { id: 'hazards', label: t.tabHazardAlerts, icon: '⚠️' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* NATURAL HAZARDS SECTION */}
      {(activeTab === 'all' || activeTab === 'hazards') && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{t.tabHazardAlerts} (Official IMD / State Disaster Cell)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_WEATHER_HAZARDS.map((haz) => (
              <div 
                key={haz.id}
                className="farmer-card p-5 border-2 border-amber-500/40 space-y-3 bg-amber-50/40 dark:bg-amber-950/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      {haz.district}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white font-heading">
                      {language === 'hi' ? haz.titleHi : language === 'mr' ? haz.titleMr : haz.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    Valid Until: {haz.validUntil}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {language === 'hi' ? haz.descriptionHi : language === 'mr' ? haz.descriptionMr : haz.description}
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <strong>💡 Farmer Action Advisory:</strong>{' '}
                  {language === 'hi' ? haz.farmerAdviceHi : language === 'mr' ? haz.farmerAdviceMr : haz.farmerAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEWS & SCHEMES LIST */}
      {(activeTab === 'all' || activeTab === 'schemes') && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
            {activeTab === 'schemes' ? t.tabSchemes : t.tabAllNews}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item) => (
              <div key={item.id} className="farmer-card p-5 space-y-3 flex flex-col justify-between hover:border-emerald-400">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {item.category === 'SCHEME' ? t.govSchemeBadge : item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white font-heading leading-tight">
                    {language === 'hi' ? item.titleHi : language === 'mr' ? item.titleMr : item.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {language === 'hi' ? item.summaryHi : language === 'mr' ? item.summaryMr : item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-[11px] truncate max-w-[200px]">
                    🏛️ {item.source}
                  </span>

                  {item.linkText && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                      <span>{item.linkText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
