import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  Users, 
  Database, 
  ShieldCheck, 
  AlertTriangle,
  Globe,
  Radio,
  Sun,
  Moon,
  User,
  Sprout,
  DollarSign,
  Newspaper,
  Bot,
  Truck,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Receipt,
  Store
} from 'lucide-react';
import { LanguageCode, UserRole, FarmerProfile } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  lastSynced: string;
  isSyncing: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  farmerProfile: FarmerProfile | null;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  currentRole,
  setCurrentRole,
  isDemoMode,
  onToggleDemoMode,
  lastSynced,
  isSyncing,
  theme,
  onToggleTheme,
  farmerProfile,
  onOpenAuthModal,
  onLogout
}) => {
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Farmer Primary Navigation Items (Simple 5 items per Section 25)
  const primaryNavItems = [
    { id: 'home', label: t.navHome, icon: '🏡' },
    { id: 'market_prices', label: t.navMarketPrice, icon: '📈' },
    { id: 'sell_store', label: t.navSellStore, icon: '📦' },
    { id: 'transactions', label: t.navTransactions, icon: '🧾' },
  ];

  // Secondary Tools (Inside "More" Dropdown)
  const secondaryNavItems = [
    { id: 'plant_ai', label: t.navPlantAi, icon: '🌱', desc: 'AI Crop & Soil Selection' },
    { id: 'seed_ai', label: t.navSeedAi, icon: '🌾', desc: 'Certified Seeds' },
    { id: 'farm_money', label: t.navFarmMoney, icon: '💰', desc: 'Expenses & Profit' },
    { id: 'offers', label: t.navOffers, icon: '🤝', desc: 'Verified Buyer Offers' },
    { id: 'exotic_crops', label: t.navExoticCrops, icon: '🐉', desc: 'High Margin Crops' },
    { id: 'ask_ai', label: t.navAskAi, icon: '🤖', desc: '24/7 Crop Assistant' },
    { id: 'news', label: t.navNews, icon: '📰', desc: 'Agri News & Alerts' },
  ];

  // Advanced Mandi Terminal Tools (Preserved from original project)
  const advancedNavItems = [
    { id: 'terminal', label: t.navTerminal, icon: TrendingUp },
    { id: 'explorer', label: t.navExplorer, icon: BarChart3 },
    { id: 'comparison', label: t.navComparison, icon: Layers },
    { id: 'lots', label: t.navMyLots, icon: Package },
    { id: 'buyer', label: t.navBuyerMarket, icon: ShoppingBag },
    { id: 'fpo', label: t.navAggregation, icon: Users },
    { id: 'admin', label: t.navAdmin, icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0a0e17]/95 backdrop-blur-md transition-colors">
      
      {/* Top Bar: Official Govt Data Stamp, Demo Mode, Theme & Language Toggles */}
      <div className="px-4 py-1.5 text-xs border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {isDemoMode ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.demoDataWarning}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>{t.officialDataSource}</span>
            </div>
          )}

          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline text-[11px]">
            {t.lastSynced}: <strong className="text-slate-800 dark:text-slate-200">{lastSynced}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-bold"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
          </button>

          {/* Language Switcher (EN, HI, MR) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm">
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">EN (English)</option>
              <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">HI (हिन्दी)</option>
              <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">MR (मराठी)</option>
            </select>
          </div>

          {/* User Profile / Account Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {farmerProfile ? farmerProfile.name.split(' ')[0] : t.loginBtn}
              </span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {farmerProfile?.name || 'Ramesh Patil'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {farmerProfile?.district || 'Nashik, Maharashtra'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onOpenAuthModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Profile</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-left border-t border-slate-100 dark:border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch / Logout to Welcome</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono transition-colors hidden lg:inline ${
              isDemoMode 
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300' 
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isDemoMode ? '⚡ Exit Demo' : '🧪 Demo Mode'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand: KRISHIMARKET */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
              <span className="text-xl">🌾</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-heading flex items-center gap-1">
                <span>KRISHI</span>
                <span className="text-emerald-600 dark:text-emerald-400">MARKET</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  SMART PLATFORM
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Smart Farming. Better Markets.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Clean 4 Core + More Dropdown) */}
        <nav className="hidden lg:flex items-center gap-1">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap font-heading ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* "More Features" Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                showMoreDropdown || ['plant_ai', 'seed_ai', 'farm_money', 'offers', 'exotic_crops', 'ask_ai', 'news', 'terminal', 'explorer', 'lots'].includes(activeTab)
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>More Features</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMoreDropdown && (
              <div className="absolute right-0 mt-2 w-72 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 px-3 uppercase block pt-1">
                  Farmer AI & Money Tools
                </span>
                
                {secondaryNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      activeTab === item.id 
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 px-3 uppercase block mb-1">
                    Advanced Mandi & B2B Hub
                  </span>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {advancedNavItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setShowMoreDropdown(false);
                          }}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 text-left"
                        >
                          <Icon className="w-3 h-3 text-emerald-500" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn max-h-[75vh] overflow-y-auto">
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>

          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-left font-heading ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="line-clamp-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Farmer Features:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 text-left"
                >
                  <span>{item.icon}</span>
                  <span className="line-clamp-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {onLogout && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account / Sign Out</span>
              </button>
            </div>
          )}

        </div>
      )}

    </header>
  );
};
