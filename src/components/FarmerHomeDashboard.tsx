import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Camera, 
  Mic, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  QrCode,
  Receipt,
  RotateCcw,
  Check,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { 
  MarketPriceRecord, 
  Commodity, 
  CropLot, 
  BuyerOffer, 
  LanguageCode, 
  FarmerProfile 
} from '../types';
import { translations } from '../i18n/translations';
import { FinanceService } from '../services/financeService';
import { PaymentQrModal } from './PaymentQrModal';

interface FarmerHomeDashboardProps {
  prices: MarketPriceRecord[];
  commodities: Commodity[];
  cropLots: CropLot[];
  buyerOffers: BuyerOffer[];
  language: LanguageCode;
  farmerProfile: FarmerProfile | null;
  onNavigateTab: (tab: string, commodity?: string, market?: string) => void;
  onOpenVoiceAssistant: () => void;
  onOpenSnapList: () => void;
  onOpenAuthModal: () => void;
}

export const FarmerHomeDashboard: React.FC<FarmerHomeDashboardProps> = ({
  prices,
  commodities,
  cropLots,
  buyerOffers,
  language,
  farmerProfile,
  onNavigateTab,
  onOpenVoiceAssistant,
  onOpenSnapList,
  onOpenAuthModal
}) => {
  const t = translations[language];
  const financeService = FinanceService.getInstance();
  const finSummary = financeService.getFinancialSummary();

  // QR Payment Card State (Prominent feature requested by user)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const paymentAmount = 25000;
  const transactionId = 'KM-TRX-00125';

  // Primary highlight crop for the farmer (Tomato)
  const primaryCropRecord = prices.find(p => p.commodity.toLowerCase().includes('tomato')) || prices[0];
  const primaryCommodity = commodities.find(c => c.name.toLowerCase().includes('tomato')) || commodities[0];
  const activeOffers = buyerOffers.filter(o => o.status === 'pending');

  const greetingText = language === 'mr' 
    ? 'शुभ प्रभात, शेतकरी बंधू' 
    : language === 'hi' 
    ? 'शुभ प्रभात, किसान भाई' 
    : 'Good Morning, Farmer';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* 1. TOP SECTION: WELCOME & PROFILE HEADER */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KRISHIMARKET • {t.verifiedDataLabel}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            {greetingText}, {farmerProfile ? farmerProfile.name : 'Ramesh Patil'}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {farmerProfile ? `${farmerProfile.village}, ${farmerProfile.district}` : 'Pimpalgaon Baswant, Nashik'}
            </span>
            <span>•</span>
            <span>{farmerProfile?.soilType || 'Black Cotton Soil'} (4.5 Acres)</span>
          </p>
        </div>

        {/* Quick Voice & Camera shortcuts */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
          >
            <Mic className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>{t.voiceTapToSpeak}</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            <span>Profile</span>
          </button>
        </div>

      </div>

      {/* 2. PRIMARY ACTIONS: 3 MAIN FARMER BUTTONS */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Primary Actions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Action 1: SELL MY CROP */}
          <button
            onClick={onOpenSnapList}
            className="group p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                🧺
              </div>
              <div>
                <div className="text-base sm:text-lg font-black tracking-wide font-heading">
                  SELL MY CROP
                </div>
                <div className="text-xs text-emerald-100">
                  {language === 'mr' ? 'पीक फोटो काढा व विक्री करा' : language === 'hi' ? 'फसल फोटो लें और बेचें' : 'Snap photo & list with price'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 2: CHECK MARKET */}
          <button
            onClick={() => onNavigateTab('market_prices', primaryCommodity.name, primaryCropRecord.market)}
            className="group p-5 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-white shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <div className="text-base sm:text-lg font-black tracking-wide font-heading">
                  CHECK MARKET
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'थेट APMC मंडी दर व आलेख' : language === 'hi' ? 'लाइव APMC मंडी भाव व चार्ट' : 'Live rates in kg, quintal & ton'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 3: MY TRANSACTIONS */}
          <button
            onClick={() => onNavigateTab('transactions')}
            className="group p-5 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-white shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl">
                🧾
              </div>
              <div>
                <div className="text-base sm:text-lg font-black tracking-wide font-heading">
                  MY TRANSACTIONS
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'व्यवहार, पावती व पेमेंट स्थिती' : language === 'hi' ? 'सौदा स्थिति व भुगतान ट्रैकिंग' : 'Deals, consignment & payment'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>

      {/* 3. PROMINENT QR PAYMENT CARD (AS REQUESTED IN SECTION 8) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-xl shadow-emerald-600/5 relative overflow-hidden">
        
        {/* Top Label */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-heading">
              QR PAYMENT & SETTLEMENT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Demo Prototype
            </span>

            {/* Reset button for demo testing */}
            {paymentStatus === 'completed' && (
              <button
                type="button"
                onClick={() => setPaymentStatus('pending')}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                title="Reset to Pending to test again"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Test Again</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Body with Exact Layout from Specification */}
        <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
              PAYMENT
            </div>

            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              ₹{paymentAmount.toLocaleString('en-IN')}
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Payment Status:
              </div>

              {paymentStatus === 'pending' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>PAYMENT PENDING</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>PAYMENT RECEIVED ✓</span>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              Transaction ID: <strong>{transactionId}</strong>
            </div>
          </div>

          {/* Action Button: SHOW QR or VIEW TRANSACTION */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {paymentStatus === 'pending' ? (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              >
                <QrCode className="w-5 h-5" />
                <span>SHOW QR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              >
                <Receipt className="w-5 h-5" />
                <span>VIEW TRANSACTION</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              All Payments
            </button>
          </div>

        </div>

      </div>

      {/* 4. AI SELLING INSIGHT: SELL / STORE / MONITOR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
              AI SELLING INSIGHT (ASSISTED DECISION)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Confidence: 86%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          <div className="space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Crop: <strong>Tomato (Hybrid Shivam)</strong>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-heading">
              Suggested Action: MONITOR
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Your crop is showing a positive market trend.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              Why this advice?
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Mandi demand is up 18% while arrivals dropped 14%. Price projected to increase from <strong>₹24/kg</strong> to <strong>₹28–₹30/kg</strong> in 7–10 days.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onNavigateTab('sell_store', primaryCommodity.name)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm transition-all text-center"
            >
              Run Full Sell / Store AI
            </button>
            <div className="text-[10px] text-slate-400 text-center">
              AI-assisted insight. Not a guaranteed financial prediction.
            </div>
          </div>

        </div>

      </div>

      {/* 5. MARKET SNAPSHOT (PRICE TREND, DEMAND, ARRIVALS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Market Snapshot (Official AGMARKNET)
          </div>
          <button
            onClick={() => onNavigateTab('market_prices')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Mandi Rates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          {/* Item 1: Tomato */}
          <div 
            onClick={() => onNavigateTab('market_prices', 'Tomato')}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🍅</span>
                <span>Tomato</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                +4.2% ↑
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                ₹24.50 <span className="text-xs font-normal text-slate-500">/kg</span>
              </span>
              <span className="text-xs text-slate-400">₹2,450/q</span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Arrivals: 4,200 q</span>
              <span className="text-emerald-600 font-medium">High Demand</span>
            </div>
          </div>

          {/* Item 2: Onion */}
          <div 
            onClick={() => onNavigateTab('market_prices', 'Onion')}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🧅</span>
                <span>Onion (Garwa)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                +2.8% ↑
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                ₹18.80 <span className="text-xs font-normal text-slate-500">/kg</span>
              </span>
              <span className="text-xs text-slate-400">₹1,880/q</span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Arrivals: 8,100 q</span>
              <span className="text-emerald-600 font-medium">Steady Demand</span>
            </div>
          </div>

          {/* Item 3: Grapes */}
          <div 
            onClick={() => onNavigateTab('market_prices', 'Grapes')}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🍇</span>
                <span>Grapes (Export)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                +6.5% ↑
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                ₹65.00 <span className="text-xs font-normal text-slate-500">/kg</span>
              </span>
              <span className="text-xs text-slate-400">₹6,500/q</span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Arrivals: 1,850 q</span>
              <span className="text-emerald-600 font-medium">Export Demand</span>
            </div>
          </div>

        </div>
      </div>

      {/* 6. MY FARM FINANCE SNAPSHOT (EXPENSES, EARNINGS, PROFIT) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
              MY FARM MONEY (SEASON SUMMARY)
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('farm_money')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Manage Expenses & Profit →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <div className="text-xs text-slate-500 dark:text-slate-400">Expenses</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-heading mt-1">
              ₹{finSummary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Seeds, Fertilizers, Labor</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <div className="text-xs text-slate-500 dark:text-slate-400">Earnings</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1">
              ₹{finSummary.totalEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Produce Sales & Escrow</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Net Profit</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-heading mt-1">
              ₹{finSummary.netProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Safe margin: +62%</div>
          </div>

        </div>

      </div>

      {/* 7. MARKETPLACE: VERIFIED BUYERS & OFFERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Verified Buyers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                VERIFIED BUYERS NEAR YOU
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('offers')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🏢 FreshBasket Hypermarkets</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
                    ✓ Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500">Nashik & Mumbai Hub • Rating: 4.9 ★</div>
                <div className="text-[11px] text-slate-400">Seeking: 500 Quintals Tomato & Onion</div>
              </div>
              <button
                onClick={() => onNavigateTab('offers')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
              >
                Contact
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🍇 EuroAgro Exports Pvt Ltd</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
                    ✓ Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500">Dindori Belt • Rating: 4.8 ★</div>
                <div className="text-[11px] text-slate-400">Seeking: Export Grade Thompson Grapes</div>
              </div>
              <button
                onClick={() => onNavigateTab('offers')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Active Offers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                ACTIVE BUYER OFFERS ({activeOffers.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('offers')}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              Compare Offers
            </button>
          </div>

          <div className="space-y-3">
            {activeOffers.slice(0, 2).map((offer) => (
              <div 
                key={offer.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {offer.buyerCompany}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    For {offer.lotCode} • {offer.quantityRequestedQ} Quintals
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    Net: ₹{offer.estimatedNetRealisationPerQ}/q
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="text-base font-black text-slate-900 dark:text-white font-heading">
                    ₹{offer.offerPricePerQ}/q
                  </div>
                  <button
                    onClick={() => onNavigateTab('offers')}
                    className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* QR Payment Modal */}
      <PaymentQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        language={language}
        amount={paymentAmount}
        transactionId={transactionId}
        farmerName={farmerProfile ? farmerProfile.name : 'Ramesh Balasaheb Patil'}
        buyerName="FreshBasket Hypermarkets Ltd"
        onPaymentConfirmed={() => {
          setPaymentStatus('completed');
        }}
      />

    </div>
  );
};
