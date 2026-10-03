import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginWelcomeScreen } from './components/LoginWelcomeScreen';
import { MarketTicker } from './components/MarketTicker';
import { FarmerHomeDashboard } from './components/FarmerHomeDashboard';
import { CropRecommendationView } from './components/CropRecommendationView';
import { MarketPriceView } from './components/MarketPriceView';
import { FarmFinanceView } from './components/FarmFinanceView';
import { TransactionTrackerView } from './components/TransactionTrackerView';
import { ExoticCropsView } from './components/ExoticCropsView';
import { AskFarmAiView } from './components/AskFarmAiView';
import { AgriNewsView } from './components/AgriNewsView';
import { MarketTerminalView } from './components/MarketTerminalView';
import { MarketExplorerView } from './components/MarketExplorerView';
import { MarketComparisonView } from './components/MarketComparisonView';
import { FarmerDecisionHeroView } from './components/FarmerDecisionHeroView';
import { CropLotsAndPassportView } from './components/CropLotsAndPassportView';
import { BuyerMarketplaceView } from './components/BuyerMarketplaceView';
import { FpoAggregationView } from './components/FpoAggregationView';
import { AdminDataHealthView } from './components/AdminDataHealthView';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { AuthModal } from './components/AuthModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { DataIngestionService } from './services/dataIngestionService';
import { 
  Commodity, 
  APMCMarket, 
  MarketPriceRecord, 
  AgriMarketIndex, 
  CropLot, 
  BuyerOffer,
  LanguageCode, 
  UserRole,
  DataSyncLog,
  FarmVisitAppointment,
  FarmerProfile
} from './types';
import { 
  COMMODITIES_MASTER, 
  MARKETS_MASTER, 
  INITIAL_AGRI_INDICES, 
  INITIAL_CROP_LOTS,
  INITIAL_BUYER_OFFERS
} from './data/initialData';
import { 
  ShieldCheck, 
  Info, 
  Radio, 
  Sparkles, 
  Camera, 
  Mic, 
  Home, 
  TrendingUp, 
  DollarSign, 
  MessageSquare 
} from 'lucide-react';
import { translations } from './i18n/translations';

const INITIAL_FARM_VISITS: FarmVisitAppointment[] = [
  {
    id: 'visit-01',
    lotId: 'lot-01',
    lotCode: 'AGRI-2026-NASH-0421',
    commodity: 'Tomato (Hybrid Shivam)',
    farmerId: 'f-ramesh-patil',
    farmerName: 'Ramesh Balasaheb Patil',
    farmerPhone: '+91 98234 56789',
    farmLocation: 'Gat No. 112, Pimpalgaon Baswant, Nashik, Maharashtra',
    merchantId: 'm-freshbasket',
    merchantName: 'Vikram Mehta',
    merchantCompany: 'FreshBasket Hypermarkets Ltd',
    merchantPhone: '+91 98190 44321',
    merchantType: 'Retail Chain Buyer',
    visitDate: '2026-08-30',
    visitTimeSlot: 'Morning (09:00 AM - 11:30 AM)',
    purpose: 'BULK_FARMGATE_PURCHASE',
    status: 'CONFIRMED',
    notes: 'Bringing 10-Tonner container vehicle. Direct payment release after farm inspection.',
    createdAt: '28 Aug 2026 10:45 AM'
  },
  {
    id: 'visit-02',
    lotId: 'lot-02',
    lotCode: 'AGRI-2026-NASH-0912',
    commodity: 'Grapes (Thompson Seedless)',
    farmerId: 'f-suresh-shinde',
    farmerName: 'Suresh Tukaram Shinde',
    farmerPhone: '+91 94220 88123',
    farmLocation: 'Survey No. 84, Dindori Vineyard Belt, Nashik',
    merchantId: 'm-euro-agro',
    merchantName: 'Harish Chawla',
    merchantCompany: 'EuroAgro Exports Pvt Ltd',
    merchantPhone: '+91 98221 99001',
    merchantType: 'Exporter',
    visitDate: '2026-08-31',
    visitTimeSlot: 'Mid-Day (11:00 AM - 02:00 PM)',
    purpose: 'COMMERCIAL_GRADING',
    status: 'CONFIRMED',
    notes: 'Agronomist will conduct sugar refractometer Brix testing & pesticide residue check.',
    createdAt: '28 Aug 2026 11:30 AM'
  }
];

const DEFAULT_PROFILE: FarmerProfile = {
  id: 'f-ramesh-patil',
  name: 'Ramesh Balasaheb Patil',
  phoneNumber: '9823456789',
  village: 'Pimpalgaon Baswant',
  district: 'Nashik, Maharashtra',
  state: 'Maharashtra',
  landSizeAcres: 4.5,
  soilType: 'Black Cotton',
  waterSource: 'Abundant (Canal/River)',
  preferredLanguage: 'mr',
  isVerified: true,
  avatarIcon: '👨‍🌾'
};

export function App() {
  const dataService = DataIngestionService.getInstance();

  // Navigation & Localization
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('amip_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch (e) {
      console.warn(e);
    }
    return 'mr'; // Default friendly Marathi/Hindi regional start or English
  });

  // Light / Dark Theme Management
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('amip_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch (e) {
      console.warn(e);
    }
    return 'light'; // Clean, crisp, farmer-friendly light theme default
  });

  // Farmer Profile
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('amip_current_farmer');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PROFILE;
  });

  // User Authentication State (Default: false to show Login / Welcome Screen First as requested)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Core Data & State
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(dataService.isDemoMode());
  const [prices, setPrices] = useState<MarketPriceRecord[]>(dataService.getMarketPrices());
  const [syncLogs, setSyncLogs] = useState<DataSyncLog[]>(dataService.getSyncLogs());
  const [lastSynced, setLastSynced] = useState<string>(dataService.getLastSuccessfulSync());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Entities & Live Data
  const [commodities] = useState<Commodity[]>(COMMODITIES_MASTER);
  const [markets] = useState<APMCMarket[]>(MARKETS_MASTER);
  const [indices, setIndices] = useState<AgriMarketIndex[]>(INITIAL_AGRI_INDICES);
  const [cropLots, setCropLots] = useState<CropLot[]>(INITIAL_CROP_LOTS);
  const [buyerOffers, setBuyerOffers] = useState<BuyerOffer[]>(INITIAL_BUYER_OFFERS);
  const [appointments, setAppointments] = useState<FarmVisitAppointment[]>(INITIAL_FARM_VISITS);

  // Modals
  const [showGlobalCameraModal, setShowGlobalCameraModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  // Cross-Navigation Context
  const [selectedCommodityForExplorer, setSelectedCommodityForExplorer] = useState<string>('Tomato');
  const [selectedMarketForExplorer, setSelectedMarketForExplorer] = useState<string>('Pimpalgaon APMC');

  // Apply Theme to Document Element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('amip_theme', theme);
    } catch (e) {
      console.warn(e);
    }
  }, [theme]);

  // Handle Language Change
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('amip_language', lang);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Periodic automatic sync
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await dataService.syncOfficialData();
        if (res.success) {
          setPrices(res.records);
          setSyncLogs(dataService.getSyncLogs());
          setLastSynced(dataService.getLastSuccessfulSync());
        }
      } catch (err) {
        console.warn('Scheduled sync encountered error', err);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleDemoMode = () => {
    const next = !isDemoMode;
    dataService.setDemoMode(next);
    setIsDemoMode(next);
    dataService.syncOfficialData();
    setPrices(dataService.getMarketPrices());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await dataService.syncOfficialData();
      setPrices(res.records);
      setSyncLogs(dataService.getSyncLogs());
      setLastSynced(dataService.getLastSuccessfulSync());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNavigateFromTerminal = (tab: string, commodity?: string, market?: string) => {
    if (commodity) setSelectedCommodityForExplorer(commodity);
    if (market) setSelectedMarketForExplorer(market);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCropLot = (newLot: CropLot) => {
    setCropLots([newLot, ...cropLots]);
    setActiveTab('home');
  };

  const handleAddAppointment = (appt: FarmVisitAppointment) => {
    setAppointments([appt, ...appointments]);
  };

  const handleUpdateLotStatus = (lotId: string, status: any) => {
    setCropLots(prev => prev.map(lot => {
      if (lot.id === lotId) {
        return {
          ...lot,
          status,
          passportEvents: [
            ...lot.passportEvents,
            {
              id: `ev-deal-${Date.now()}`,
              title: 'Purchase Deal Executed',
              description: `Merchant executed purchase. Escrow held & pickup transport assigned.`,
              timestamp: 'Just now',
              actor: 'Merchant & Farmer',
              category: 'PAYMENT',
              status: 'COMPLETED',
              verifiedHash: '0x' + Math.random().toString(16).substring(2, 10)
            }
          ]
        };
      }
      return lot;
    }));
  };

  const t = translations[language];

  // If user is not yet logged in, show the Login / Welcome Screen first (Requirement 4)
  if (!isLoggedIn) {
    return (
      <LoginWelcomeScreen
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoginSuccess={(profile, role) => {
          setFarmerProfile(profile);
          setCurrentRole(role);
          setIsLoggedIn(true);
          if (role === 'buyer') {
            setActiveTab('offers');
          } else {
            setActiveTab('home');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        lastSynced={lastSynced}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        farmerProfile={farmerProfile}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Floating Action Buttons (Bottom-Right for mobile & desktop) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        {/* Floating Voice Assistant Button */}
        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 hover:scale-105 transition-all border-2 border-white dark:border-slate-900"
        >
          <Mic className="w-5 h-5 text-slate-950 animate-bounce" />
          <span className="hidden sm:inline">{t.voiceAssistantTitle}</span>
        </button>

        {/* Floating Snap & List Button */}
        <button
          onClick={() => setShowGlobalCameraModal(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-emerald-600/30 hover:scale-105 transition-all border-2 border-white dark:border-slate-900"
        >
          <Camera className="w-5 h-5" />
          <span>{t.navSnapList}</span>
        </button>
      </div>

      {/* Continuously Refreshing Live APMC Ticker */}
      <MarketTicker
        prices={prices}
        onSelectCommodity={(commodity, market) => handleNavigateFromTerminal('market_prices', commodity, market)}
        lastSynced={lastSynced}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 mb-16 sm:mb-6">
        
        {/* 1. FARMER HOME DASHBOARD (PRIMARY) */}
        {activeTab === 'home' && (
          <FarmerHomeDashboard
            prices={prices}
            commodities={commodities}
            cropLots={cropLots}
            buyerOffers={buyerOffers}
            language={language}
            farmerProfile={farmerProfile}
            onNavigateTab={handleNavigateFromTerminal}
            onOpenVoiceAssistant={() => setShowVoiceModal(true)}
            onOpenSnapList={() => setShowGlobalCameraModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {/* 2. AI CROP RECOMMENDATION ("WHAT SHOULD I PLANT?") */}
        {(activeTab === 'plant_ai' || activeTab === 'seed_ai') && (
          <CropRecommendationView
            language={language}
            farmerProfile={farmerProfile}
            onNavigateToSellStore={(crop) => handleNavigateFromTerminal('sell_store', crop)}
          />
        )}

        {/* 3. MARKET PRICES WITH KG/QUINTAL/TON CONVERTER & 7 GRAPHS */}
        {activeTab === 'market_prices' && (
          <MarketPriceView
            prices={prices}
            commodities={commodities}
            markets={markets}
            language={language}
            initialCommodityName={selectedCommodityForExplorer}
            initialMarketName={selectedMarketForExplorer}
            onNavigateToSellStore={(crop) => handleNavigateFromTerminal('sell_store', crop)}
          />
        )}

        {/* 4. AI SELL OR STORE RECOMMENDATION */}
        {activeTab === 'sell_store' && (
          <FarmerDecisionHeroView
            prices={prices}
            commodities={commodities}
            language={language}
            onCreateLotWithStrategy={(commodity, qty) => {
              setActiveTab('home');
            }}
          />
        )}

        {/* 5. MY FARM MONEY (EXPENSES, EARNINGS & PROFIT TRACKER) */}
        {activeTab === 'farm_money' && (
          <FarmFinanceView language={language} />
        )}

        {/* 6. BUYER OFFERS & DIRECT SALES */}
        {activeTab === 'offers' && (
          <BuyerMarketplaceView
            cropLots={cropLots}
            language={language}
            onViewPassport={(lot) => setActiveTab('lots')}
            onOpenLiveCamera={() => setShowGlobalCameraModal(true)}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onUpdateLotStatus={handleUpdateLotStatus}
          />
        )}

        {/* 7. TRANSACTION FLOW & LOGISTICS */}
        {activeTab === 'transactions' && (
          <TransactionTrackerView
            cropLots={cropLots}
            buyerOffers={buyerOffers}
            language={language}
            onNavigateToLots={() => setActiveTab('lots')}
            onNavigateToOffers={() => setActiveTab('offers')}
          />
        )}

        {/* 8. EXOTIC CROPS GUIDE */}
        {activeTab === 'exotic_crops' && (
          <ExoticCropsView
            language={language}
            onNavigateToPlantAi={() => setActiveTab('plant_ai')}
          />
        )}

        {/* 9. ASK FARM AI ASSISTANT */}
        {activeTab === 'ask_ai' && (
          <AskFarmAiView
            language={language}
            onNavigateToTab={handleNavigateFromTerminal}
            onOpenVoiceModal={() => setShowVoiceModal(true)}
          />
        )}

        {/* 10. AGRICULTURAL NEWS & HAZARD ALERTS */}
        {activeTab === 'news' && (
          <AgriNewsView language={language} />
        )}

        {/* EXISTING ADVANCED MANDI TOOLS (PRESERVED) */}
        {activeTab === 'terminal' && (
          <MarketTerminalView
            prices={prices}
            commodities={commodities}
            indices={indices}
            language={language}
            onNavigateToTab={handleNavigateFromTerminal}
          />
        )}

        {activeTab === 'explorer' && (
          <MarketExplorerView
            prices={prices}
            commodities={commodities}
            markets={markets}
            language={language}
            selectedCommodityName={selectedCommodityForExplorer}
            selectedMarketName={selectedMarketForExplorer}
          />
        )}

        {activeTab === 'comparison' && (
          <MarketComparisonView
            prices={prices}
            commodities={commodities}
            language={language}
          />
        )}

        {activeTab === 'decision' && (
          <FarmerDecisionHeroView
            prices={prices}
            commodities={commodities}
            language={language}
            onCreateLotWithStrategy={(commodity, qty) => {
              setActiveTab('lots');
            }}
          />
        )}

        {activeTab === 'lots' && (
          <CropLotsAndPassportView
            cropLots={cropLots}
            commodities={commodities}
            language={language}
            onAddLot={handleAddCropLot}
            appointments={appointments}
          />
        )}

        {activeTab === 'buyer' && (
          <BuyerMarketplaceView
            cropLots={cropLots}
            language={language}
            onViewPassport={(lot) => {
              setActiveTab('lots');
            }}
            onOpenLiveCamera={() => setShowGlobalCameraModal(true)}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onUpdateLotStatus={handleUpdateLotStatus}
          />
        )}

        {activeTab === 'fpo' && (
          <FpoAggregationView
            cropLots={cropLots}
            language={language}
            onAddAggregatedLot={handleAddCropLot}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDataHealthView
            prices={prices}
            syncLogs={syncLogs}
            isDemoMode={isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onRunSync={handleManualSync}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
            language={language}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-bold ${
            activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">🏡</span>
          <span>{t.navHome}</span>
        </button>

        <button
          onClick={() => setActiveTab('market_prices')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-bold ${
            activeTab === 'market_prices' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">📈</span>
          <span>{t.navMarketPrice}</span>
        </button>

        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex flex-col items-center -mt-5 p-2 rounded-full bg-amber-400 text-slate-950 shadow-lg border-2 border-white dark:border-slate-900"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('farm_money')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-bold ${
            activeTab === 'farm_money' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">💰</span>
          <span>{t.navFarmMoney}</span>
        </button>

        <button
          onClick={() => setActiveTab('ask_ai')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-bold ${
            activeTab === 'ask_ai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">🤖</span>
          <span>{t.navAskAi}</span>
        </button>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
        currentProfile={farmerProfile}
        onLoginSuccess={(prof) => setFarmerProfile(prof)}
      />

      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        language={language}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setShowVoiceModal(false);
        }}
      />

      <CameraCaptureModal
        isOpen={showGlobalCameraModal}
        onClose={() => setShowGlobalCameraModal(false)}
        commodities={commodities}
        language={language}
        onLotCreated={handleAddCropLot}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#090d16] text-xs text-slate-500 dark:text-slate-400 py-8 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-heading">
                KRISHIMARKET — SMART FARMING PLATFORM
              </span>
            </div>

            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Government of India Data (data.gov.in / AGMARKNET)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <div className="text-slate-800 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Farmer Transparency & Produce Notice:</span>
            </div>
            This platform provides informational agricultural market intelligence and trade enablement for physical farm produce (fruits, vegetables, food grains). It is NOT a financial trading or speculative application. Prices reflect daily physical APMC mandi auction modal rates published by the Government of India / AGMARKNET. AI recommendations are decision-support estimates.
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-900">
            <span>© 2026 KrishiMarket. Built for Indian Farmers & Merchants.</span>
            <span>English • हिन्दी • मराठी Multi-lingual System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
