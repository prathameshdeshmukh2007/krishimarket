import React, { useState, useMemo } from 'react';
import { 
  Globe2, 
  Ship, 
  Calculator, 
  FileCheck, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Info, 
  ExternalLink, 
  Download, 
  Filter, 
  Percent, 
  DollarSign, 
  Scale, 
  Check, 
  X,
  Truck,
  Box,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { 
  ExportListing, 
  BuyerQuote, 
  MarketObservation, 
  DataSourceHealth, 
  TradeOrder, 
  IncotermType, 
  TradeCurrency,
  ObservationPriceCategory 
} from '../types/globalTrade';
import { LanguageCode, FarmerProfile } from '../types';
import { GlobalTradeService } from '../services/globalTradeService';
import { NetReturnCalculator } from '../services/netReturnCalculator';

interface GlobalTradeViewProps {
  userProfile?: FarmerProfile;
  language: LanguageCode;
  onNavigateHome?: () => void;
}

export const GlobalTradeView: React.FC<GlobalTradeViewProps> = ({
  userProfile,
  language = 'en'
}) => {
  const globalTradeService = GlobalTradeService.getInstance();

  // Active Tab: 'price_board' | 'lots' | 'quotes' | 'calculator' | 'orders'
  const [activeTab, setActiveTab] = useState<'price_board' | 'lots' | 'quotes' | 'calculator' | 'orders'>('calculator');

  // Selected Commodity & Destination
  const [selectedCommodity, setSelectedCommodity] = useState('Onion');
  const [selectedDestination, setSelectedDestination] = useState('ARE'); // UAE

  // Data Sources & Observations
  const observations = useMemo(() => {
    return globalTradeService.getObservationsForCommodity(selectedCommodity, selectedDestination);
  }, [selectedCommodity, selectedDestination]);

  const dataSources = useMemo(() => {
    return globalTradeService.getDataSources();
  }, []);

  const [listings, setListings] = useState<ExportListing[]>(() => globalTradeService.getExportListings());
  const [quotes, setQuotes] = useState<BuyerQuote[]>(() => globalTradeService.getBuyerQuotes());
  const [orders, setOrders] = useState<TradeOrder[]>(() => globalTradeService.getTradeOrders());

  // Benchmark Lot Selection
  const [selectedLotId, setSelectedLotId] = useState<string>(listings[0]?.id || 'exp-lot-onion-001');
  const activeLot = listings.find(l => l.id === selectedLotId) || listings[0];

  // Calculator Form State (Benchmark 1,000 kg Onion Lot to UAE at 2.40 AED/kg)
  const [calcLotKg, setCalcLotKg] = useState<number>(1000);
  const [calcUnitPrice, setCalcUnitPrice] = useState<number>(2.40);
  const [calcCurrency, setCalcCurrency] = useState<TradeCurrency>('AED');
  const [calcIncoterm, setCalcIncoterm] = useState<IncotermType>('FOB');
  const [calcShrinkagePct, setCalcShrinkagePct] = useState<number>(6.0);
  const [showItemizedCost, setShowItemizedCost] = useState<boolean>(true);

  // FX Rate for active currency
  const activeFxRate = globalTradeService.getFxRate(calcCurrency);

  // Compute Net Return via pure mathematical engine
  const calculationResult = useMemo(() => {
    return NetReturnCalculator.calculate({
      lotQuantityKg: calcLotKg,
      unitPrice: calcUnitPrice,
      currency: calcCurrency,
      incoterm: calcIncoterm,
      namedPortOrPlace: calcIncoterm === 'FOB' ? 'Nhava Sheva (JNPT Mumbai)' : 'Jebel Ali Port (Dubai AEJEA)',
      exchangeRateToInr: activeFxRate,
      fxRateSource: calcCurrency === 'AED' ? 'RBI Interbank Forex (Pegged 3.6725 AED/USD)' : 'RBI Benchmark Rate',
      fxRateTimestamp: '2026-10-20 10:45 AM IST',
      shrinkageRejectionPct: calcShrinkagePct
    });
  }, [calcLotKg, calcUnitPrice, calcCurrency, calcIncoterm, calcShrinkagePct, activeFxRate]);

  // Modal States
  const [showCreateLotModal, setShowCreateLotModal] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState<BuyerQuote | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Form State for New Export Lot
  const [newCommodity, setNewCommodity] = useState('Onion');
  const [newVariety, setNewVariety] = useState('Nashik Red (Garwa)');
  const [newGrade, setNewGrade] = useState('Export Grade A+ (45mm - 55mm)');
  const [newQuantity, setNewQuantity] = useState(1000);
  const [newDestination, setNewDestination] = useState('ARE');
  const [newPort, setNewPort] = useState('Jebel Ali Port, Dubai (AEJEA)');
  const [newIncoterm, setNewIncoterm] = useState<IncotermType>('FOB');
  const [newCurrency, setNewCurrency] = useState<TradeCurrency>('AED');
  const [newPrice, setNewPrice] = useState(2.40);
  const [newDispatchPort, setNewDispatchPort] = useState('Nhava Sheva (JNPT Mumbai)');
  const [newPackaging, setNewPackaging] = useState('25 kg ventilated mesh bags on wooden pallets');

  // Create Lot Handler
  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    const created = globalTradeService.createExportListing({
      sellerUserId: userProfile?.id || 'usr-farmer-01',
      sellerName: userProfile?.name || 'Ramesh Balasaheb Patil',
      sellerPhone: userProfile?.phoneNumber || '+919823456789',
      sellerOrganizationName: 'Pimpalgaon Onion Growers Cluster',
      commodity: newCommodity,
      variety: newVariety,
      grade: newGrade,
      totalQuantityKg: Number(newQuantity),
      availableQuantityKg: Number(newQuantity),
      minOrderQuantityKg: Math.round(Number(newQuantity) * 0.5),
      targetDestinationCountry: newDestination,
      targetDestinationPort: newPort,
      preferredIncoterm: newIncoterm,
      preferredCurrency: newCurrency,
      indicativeFobPricePerKg: Number(newPrice),
      originState: 'Maharashtra',
      originDistrict: 'Nashik',
      dispatchHubOrPort: newDispatchPort,
      harvestDate: new Date().toISOString().split('T')[0],
      packagingDetails: newPackaging,
      expectedShrinkagePct: 6.0,
      photoUrls: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80'
      ],
      isDemo: true
    });

    setListings(globalTradeService.getExportListings());
    setSelectedLotId(created.id);
    setShowCreateLotModal(false);
    setActiveTab('lots');
  };

  // Accept Quote Handler (Atomic Idempotent Transaction)
  const handleConfirmAcceptQuote = () => {
    if (!acceptingQuote) return;
    try {
      const res = globalTradeService.acceptBuyerQuote(acceptingQuote.id, userProfile?.id || 'usr-farmer-01');
      setOrders(globalTradeService.getTradeOrders());
      setQuotes(globalTradeService.getBuyerQuotes());
      setListings(globalTradeService.getExportListings());
      setOrderSuccessMessage(`Contract confirmed! Export Order #${res.order.orderNumber} successfully issued.`);
      setAcceptingQuote(null);
      setActiveTab('orders');
    } catch (err: any) {
      alert(err.message || 'Error accepting quote.');
    }
  };

  // Policy check status
  const policyCheck = useMemo(() => {
    return globalTradeService.getPolicyCheck(selectedCommodity);
  }, [selectedCommodity]);

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-900 dark:text-slate-100 animate-fadeIn">
      
      {/* TOP HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-[#064e3b] text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        
        {/* Background Subtle Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>International Agri Trade Hub • भारत-UAE कॉरिडॉर</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-heading leading-tight text-white">
              Global Trade & Export Intelligence
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              {language === 'mr'
                ? 'नाशिक कांदा व भारतीय पिकांची थेट UAE/आखाती देशांना निर्यात. सर्व खर्च वजा जाता शेतकऱ्याला मिळणारा निव्वळ भाव स्पष्ट पहा.'
                : language === 'hi'
                ? 'नासिक प्याज व भारतीय फसलों का सीधा UAE व खाड़ी देशों को निर्यात। सभी खर्चे काटकर किसान को मिलने वाला शुद्ध मुनाफा पारदर्शी देखें।'
                : 'Direct export of Indian produce to UAE & global markets. Transparent Net Return Calculator after all packing, logistics and port handling.'}
            </p>
          </div>

          {/* Quick Benchmark Stats Badge */}
          <div className="bg-emerald-950/70 backdrop-blur-md border border-emerald-700/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shrink-0 md:w-80">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <span className="text-xs font-bold text-emerald-300">Live Forex Benchmark</span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                1 AED = ₹22.80
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200/80">Benchmark Export Lot:</span>
              <span className="font-bold text-white">1,000 kg Nashik Onion</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200/80">Destination Port:</span>
              <span className="font-bold text-white">Jebel Ali (Dubai, UAE)</span>
            </div>

            <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold">Indicative Net Return:</span>
              <span className="text-base font-black text-amber-300">₹38.50 / kg</span>
            </div>
          </div>
        </div>

        {/* DGFT Policy Notice Strip */}
        <div className="mt-6 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>DGFT Policy Status:</strong> Onion export is <span className="text-white font-bold underline decoration-emerald-400 underline-offset-2">FREE</span> (No MEP / Zero Minimum Export Price restriction).
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/70 font-mono">
            {policyCheck.officialNotificationRef}
          </span>
        </div>
      </div>

      {/* SUCCESS BANNER WHEN ORDER CREATED */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">{orderSuccessMessage}</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">
                Compliance checklist and logistics tracking are now ready in the Orders tab.
              </div>
            </div>
          </div>
          <button 
            onClick={() => setOrderSuccessMessage(null)}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all min-h-[48px] ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{language === 'mr' ? 'निव्वळ नफा कॅल्क्युलेटर' : language === 'hi' ? 'शुद्ध मुनाफा कैलकुलेटर' : 'Net Return Calculator'}</span>
        </button>

        <button
          onClick={() => setActiveTab('price_board')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all min-h-[48px] ${
            activeTab === 'price_board'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{language === 'mr' ? '५ किंमत श्रेणी (भाव बोर्ड)' : language === 'hi' ? '5 मूल्य श्रेणियां' : '5 Price Categories Board'}</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all min-h-[48px] ${
            activeTab === 'quotes'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'mr' ? 'सत्यापित खरेदीदार ऑफर्स' : language === 'hi' ? 'सत्यापित खरीदार कोट्स' : 'Verified Buyer Quotes'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
            {quotes.filter(q => q.status === 'verified').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lots')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all min-h-[48px] ${
            activeTab === 'lots'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>{language === 'mr' ? 'माझे निर्यात लॉट' : language === 'hi' ? 'मेरे निर्यात लॉट' : 'My Export Lots'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all min-h-[48px] ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>{language === 'mr' ? 'ऑर्डर्स व कागदपत्रे' : language === 'hi' ? 'ऑर्डर्स व अनुपालन' : 'Orders & Compliance'}</span>
          {orders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-bold">
              {orders.length}
            </span>
          )}
        </button>

      </div>

      {/* ==================================================================== */}
      {/* TAB 1: NET RETURN CALCULATOR (Pure Decimal Math Engine) */}
      {/* ==================================================================== */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          
          {/* THE BIG PLAIN SUMMARY BANNER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-emerald-600/15 border-2 border-amber-500/40 dark:border-amber-400/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span>Transparent Farmer Net Return (खर्च वजा जाता निव्वळ हातात)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {language === 'mr'
                  ? calculationResult.summarySentenceMr
                  : language === 'hi'
                  ? calculationResult.summarySentenceHi
                  : calculationResult.summarySentenceEn}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
                <span>Total Net Handover: <strong className="text-emerald-700 dark:text-emerald-300 font-mono text-sm">₹{calculationResult.netProceedsInr.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Lot: <strong>{calculationResult.lotQuantityKg} kg</strong> (Saleable: <strong>{calculationResult.saleableQuantityKg} kg</strong> after {calculationResult.shrinkageRejectionPct}% shrinkage)</span>
              </div>
            </div>

            {/* Comparison vs Domestic APMC */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shrink-0 flex flex-col gap-1 text-center shadow-sm min-w-[210px]">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Vs Domestic APMC Mandi
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pimpalgaon APMC: <strong className="font-mono">₹27.50 / kg</strong>
              </div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <ArrowUpRight className="w-4 h-4" />
                <span>+₹11.00 / kg (+40% Extra)</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Inputs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Controls Card */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  <span>Calculator Parameters</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Incoterms 2020</span>
              </div>

              {/* Lot Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Total Lot Quantity (kg)
                  </label>
                  <span className="font-mono text-emerald-600 font-bold">{calcLotKg.toLocaleString()} kg</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 5000].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setCalcLotKg(qty)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        calcLotKg === qty
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {qty.toLocaleString()} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Offered Unit Price & Currency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Buyer Offered Unit Price
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    value={calcUnitPrice}
                    onChange={(e) => setCalcUnitPrice(Math.max(0.1, Number(e.target.value)))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <select
                    value={calcCurrency}
                    onChange={(e) => setCalcCurrency(e.target.value as TradeCurrency)}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-bold text-xs"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Forex Rate: 1 {calcCurrency} = ₹{activeFxRate.toFixed(2)} (Interbank Benchmark)
                </div>
              </div>

              {/* Incoterm Toggle (FOB vs CIF) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Delivery Incoterm (Who Pays Freight & Insurance?)
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold">{calcIncoterm}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcIncoterm('FOB')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      calcIncoterm === 'FOB'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-sm">FOB (Free on Board)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      Seller pays till JNPT sea port. Ocean freight paid by BUYER.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalcIncoterm('CIF')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      calcIncoterm === 'CIF'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-sm">CIF (Cost, Ins, Freight)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      Seller pays sea freight & transit insurance to Jebel Ali.
                    </div>
                  </button>
                </div>
              </div>

              {/* Shrinkage & Rejection % Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Transit Shrinkage & Grading Rejection
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {calcShrinkagePct}% ({Math.round(calcLotKg * (calcShrinkagePct / 100))} kg)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={calcShrinkagePct}
                  onChange={(e) => setCalcShrinkagePct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Ideal)</span>
                  <span>6.0% (Nashik Onion Standard)</span>
                  <span>15% (Monsoon Risk)</span>
                </div>
              </div>

              {/* Toggle Itemized breakdown button */}
              <button
                type="button"
                onClick={() => setShowItemizedCost(!showItemizedCost)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
              >
                <span>{showItemizedCost ? 'Hide Detailed Deductions' : 'Show Itemized Deductions (खर्चांचा तपशील)'}</span>
                {showItemizedCost ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

            </div>

            {/* Calculations Breakdown Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>Financial Settlement Breakdown</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Verified Math
                </span>
              </div>

              {/* High-Level Math Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Gross Revenue</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    ₹{calculationResult.grossProceedsInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {calculationResult.grossProceedsForeignCurrency.toFixed(2)} {calcCurrency}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">Seller Deductions</div>
                  <div className="text-lg font-black text-rose-700 dark:text-rose-400 font-mono">
                    -₹{calculationResult.totalSellerDeductionsInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-rose-600/80">
                    {(calculationResult.totalSellerDeductionsInr / calculationResult.saleableQuantityKg).toFixed(2)} ₹/kg
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Final Net In Pocket</div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    ₹{calculationResult.netProceedsInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    ₹{calculationResult.netPerKgInr.toFixed(2)} / kg
                  </div>
                </div>

              </div>

              {/* Itemized Cost Table (Only if toggled) */}
              {showItemizedCost && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Itemized Cost Deductions (शेतकऱ्याला पडणारे प्रत्यक्ष खर्च)</span>
                    <span className="text-[11px] text-slate-400">Payer Party: SELLER</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Expense Item / खर्च</th>
                          <th className="py-2.5 px-3">Payer Party</th>
                          <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                          <th className="py-2.5 px-3 text-right">Per kg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                        {calculationResult.itemizedCosts.map((cost) => (
                          <tr 
                            key={cost.id} 
                            className={cost.payerParty === 'BUYER' ? 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                          >
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{cost.displayTitle}</div>
                              {cost.note && <div className="text-[10px] text-slate-400">{cost.note}</div>}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cost.payerParty === 'BUYER' 
                                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' 
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              }`}>
                                {cost.payerParty === 'BUYER' ? 'Paid by BUYER' : 'Paid by SELLER'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {cost.payerParty === 'BUYER' ? '₹0 (Buyer pays)' : `₹${cost.amountInr.toLocaleString('en-IN')}`}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">
                              {cost.payerParty === 'BUYER' ? '-' : `₹${(cost.amountInr / calculationResult.saleableQuantityKg).toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action: Use in Export Lot */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Ready to lock this export margin with verified Dubai buyers?
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('quotes')}
                  className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 hover:scale-[1.01] transition-all min-h-[48px]"
                >
                  <span>Review Verified UAE Buyer Quotes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: 5 STRICTLY SEPARATED PRICE CATEGORIES */}
      {/* ==================================================================== */}
      {activeTab === 'price_board' && (
        <div className="space-y-6">
          
          {/* Header & Source Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                5 Price Categories Board (किंमत वर्गीकरण)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Strict separation of verified transactions, official mandi rates, and statistical baselines. No mixing of estimates with verified contracts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Commodity:</span>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
              >
                <option value="Onion">Nashik Red Onion (कांदा)</option>
                <option value="Grapes">Table Grapes (द्राक्षे)</option>
                <option value="Pomegranate">Pomegranate (डाळिंब)</option>
              </select>
            </div>
          </div>

          {/* Observations List */}
          {observations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                No verified export quotation is currently available.
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active buyer quotes have been approved by the platform verification cell for this commodity today.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {observations.map((obs) => {
                const isVerifiedBuyer = obs.priceCategory === 'verified_current_buyer_quotation';
                const isVerifiedExporter = obs.priceCategory === 'verified_exporter_quotation';
                const isHistorical = obs.priceCategory === 'historical_export_statistics';
                const isDomesticMandi = obs.priceCategory === 'domestic_mandi_reference_price';
                const isIndicative = obs.priceCategory === 'indicative_estimate';

                return (
                  <div
                    key={obs.id}
                    className={`rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                      isVerifiedBuyer
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800'
                        : isDomesticMandi
                        ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-400 dark:border-sky-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Price Category Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isVerifiedBuyer 
                            ? 'bg-emerald-600 text-white' 
                            : isVerifiedExporter
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                            : isHistorical
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : isDomesticMandi
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {isVerifiedBuyer && '1. Verified Current Buyer Quote'}
                          {isVerifiedExporter && '2. Verified Exporter Quote'}
                          {isHistorical && '3. Historical Export Statistics'}
                          {isDomesticMandi && '4. Domestic Mandi Reference'}
                          {isIndicative && '5. Indicative Estimate'}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {obs.freshnessStatus}
                        </span>
                      </div>

                      {/* Main Price Numbers */}
                      <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {obs.rawPriceValue.toLocaleString()} {obs.rawPriceUnit}
                        </div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          Equivalent: ₹{obs.normalizedPricePerKgInr.toFixed(2)} / kg
                        </div>
                      </div>

                      {/* Commodity Details */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                        <div><strong>Commodity:</strong> {obs.commodity} ({obs.variety})</div>
                        <div><strong>Hub / Port:</strong> {obs.originMandiOrPort} → {obs.destinationCountry}</div>
                      </div>

                    </div>

                    {/* Source Attribution & Conversion Rule */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{obs.sourceAttribution}</span>
                      </div>
                      {obs.conversionMethod && (
                        <div className="font-mono text-[10px] text-slate-400">
                          {obs.conversionMethod}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Official Source Health Tracking */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-600" />
                <span>Connected Official Data Sources Status</span>
              </h3>
              <span className="text-xs text-emerald-600 font-bold">100% Operational</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dataSources.map((src) => (
                <div key={src.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{src.displayName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[11px] text-slate-500">{src.reportingFrequency}</div>
                  <div className="text-[10px] text-slate-400">Last sync: {src.lastSuccessfulSync}</div>
                  <a 
                    href={src.homepageUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: VERIFIED BUYER QUOTES */}
      {/* ==================================================================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Verified Buyer Quotations (सत्यापित खरेदीदार ऑफर्स)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Every quotation is verified by the KrishiMarket export compliance desk before acceptance.
              </p>
            </div>

            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              Active Lot: 1,000 kg Nashik Onion (KM-EXP-2026-ONION-001)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotes.map((quote) => {
              const isVerified = quote.status === 'verified';
              const isAccepted = quote.status === 'accepted';
              const fxRate = globalTradeService.getFxRate(quote.currency);
              const inrTotal = Math.round(quote.totalQuoteValue * fxRate);

              return (
                <div
                  key={quote.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5 transition-all ${
                    isAccepted
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : isVerified
                      ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      : 'border-amber-300 dark:border-amber-800 opacity-90'
                  }`}
                >
                  
                  {/* Buyer Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {quote.buyerCompanyName}
                        </span>
                        {quote.isBuyerVerified && (
                          <span className="p-0.5 rounded-full bg-emerald-500 text-white" title="Verified Buyer">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Contact: {quote.buyerName}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-600 font-bold">Trust Score: {quote.buyerTrustScore}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isAccepted
                          ? 'bg-emerald-600 text-white'
                          : isVerified
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {quote.status.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">{quote.quoteNumber}</div>
                    </div>
                  </div>

                  {/* Pricing Terms & Incoterms */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Offered Price & Terms</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {quote.offeredPricePerKg} {quote.currency} <span className="text-xs font-normal text-slate-400">/ kg</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {quote.incoterm} • {quote.namedPortOrPlace}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Total Value ({quote.quantityKg} kg)</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {quote.totalQuoteValue.toLocaleString()} {quote.currency}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        ≈ ₹{inrTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Payment & Inspection Terms */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div><strong>Payment Terms:</strong> {quote.paymentTerms}</div>
                    <div><strong>Inspection:</strong> {quote.inspectionTerms}</div>
                    {quote.adminVerificationNotes && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-[11px] border border-emerald-200 dark:border-emerald-800">
                        <strong>Compliance Note:</strong> {quote.adminVerificationNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Valid until {new Date(quote.validUntil).toLocaleDateString()}
                    </span>

                    {isAccepted ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Contract Active</span>
                      </div>
                    ) : isVerified ? (
                      <button
                        type="button"
                        onClick={() => setAcceptingQuote(quote)}
                        className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 hover:scale-[1.01] transition-all min-h-[48px]"
                      >
                        <span>ACCEPT QUOTE</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-200">
                        Pending Admin KYC Review
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: MY EXPORT LOTS */}
      {/* ==================================================================== */}
      {activeTab === 'lots' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                My Export Lots (माझे निर्यात लॉट)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                List and manage export grade agricultural lots for overseas buyers.
              </p>
            </div>

            <button
              onClick={() => setShowCreateLotModal(true)}
              className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE NEW EXPORT LOT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((lot) => (
              <div 
                key={lot.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  {lot.photoUrls[0] && (
                    <div className="h-44 w-full overflow-hidden relative">
                      <img 
                        src={lot.photoUrls[0]} 
                        alt={lot.commodity} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white font-mono">
                        {lot.listingCode}
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {lot.status}
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                        {lot.totalQuantityKg.toLocaleString()} kg {lot.commodity}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lot.variety} • {lot.grade}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-400 block text-[10px]">Target Destination</span>
                        <strong className="text-slate-900 dark:text-white">{lot.targetDestinationPort}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-400 block text-[10px]">Preferred Incoterm</span>
                        <strong className="text-emerald-600">{lot.preferredIncoterm} ({lot.dispatchHubOrPort})</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-400 block text-[10px]">Available / Allocated</span>
                        <strong className="text-slate-900 dark:text-white">{lot.availableQuantityKg} kg / {lot.allocatedQuantityKg} kg</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-400 block text-[10px]">Expected Shrinkage</span>
                        <strong className="text-amber-600">{lot.expectedShrinkagePct}%</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      <strong>Packaging:</strong> {lot.packagingDetails}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Seller: {lot.sellerName}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLotId(lot.id);
                      setCalcLotKg(lot.availableQuantityKg);
                      setCalcUnitPrice(lot.indicativeFobPricePerKg || 2.40);
                      setCalcIncoterm(lot.preferredIncoterm);
                      setCalcCurrency(lot.preferredCurrency);
                      setActiveTab('calculator');
                    }}
                    className="py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
                  >
                    Open in Calculator
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: ORDERS & COMPLIANCE TRACKING */}
      {/* ==================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Export Orders & Trade Compliance (ऑर्डर्स व कायदेशीर कागदपत्रे)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              End-to-end milestone tracking, phytosanitary clearance, and UAE import customs documentation.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <Ship className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                No active export contracts yet.
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Accept a verified buyer quotation from the Verified Buyer Quotes tab to initiate an official export contract and compliance workflow.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Go to Verified Quotes
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6"
                >
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white font-heading">
                          Order #{order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.quantityKg.toLocaleString()} kg {order.commodity} • {order.buyerCompanyName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        {order.totalContractValueForeign.toLocaleString()} {order.contractCurrency}
                      </div>
                      <div className="text-xs font-bold text-emerald-600">
                        ≈ ₹{order.totalContractValueInr.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Two Columns: Timeline & Compliance Docs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Column 1: Milestone Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Shipment Milestones</span>
                      </h4>

                      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                        {order.events.map((evt) => (
                          <div key={evt.id} className="relative space-y-0.5">
                            <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{evt.eventTitle}</div>
                            <div className="text-[11px] text-slate-500">{evt.eventDescription}</div>
                            {evt.location && <div className="text-[10px] text-slate-400 font-mono">📍 {evt.location}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Required Compliance Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Regulatory Documents Checklist</span>
                      </h4>

                      <div className="space-y-2">
                        {order.documents.map((doc) => (
                          <div 
                            key={doc.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{doc.displayName}</span>
                                {doc.status === 'VERIFIED' && (
                                  <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{doc.issuingAuthority}</div>
                              {doc.documentNumber && (
                                <div className="text-[10px] text-emerald-600 font-mono">{doc.documentNumber}</div>
                              )}
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ACCEPT QUOTE CONFIRMATION */}
      {/* ==================================================================== */}
      {acceptingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Confirm Export Quotation Acceptance</span>
              </h3>
              <button 
                onClick={() => setAcceptingQuote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div>Buyer: <strong>{acceptingQuote.buyerCompanyName}</strong></div>
                <div>Offered Rate: <strong className="text-emerald-600 text-sm font-mono">{acceptingQuote.offeredPricePerKg} {acceptingQuote.currency}/kg</strong></div>
                <div>Terms: <strong>{acceptingQuote.incoterm} ({acceptingQuote.namedPortOrPlace})</strong></div>
                <div>Quantity: <strong>{acceptingQuote.quantityKg} kg</strong></div>
                <div className="pt-1 text-slate-400">Total Contract Value: <strong>{acceptingQuote.totalQuoteValue} {acceptingQuote.currency} (≈ ₹{Math.round(acceptingQuote.totalQuoteValue * activeFxRate).toLocaleString('en-IN')})</strong></div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1 text-[11px]">
                <strong>Contract Binding Notice:</strong>
                <div>
                  Accepting this verified quotation reserves the lot, locks the foreign exchange rate benchmark, and triggers the mandatory phytosanitary inspection.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAcceptingQuote(null)}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptQuote}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors"
              >
                Confirm & Issue Order
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE EXPORT LOT */}
      {/* ==================================================================== */}
      {showCreateLotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-600" />
                <span>Create New Export Lot (नवीन निर्यात लॉट)</span>
              </h3>
              <button 
                onClick={() => setShowCreateLotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Commodity</label>
                  <select
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Table Grapes">Table Grapes (द्राक्षे)</option>
                    <option value="Pomegranate">Pomegranate (डाळिंब)</option>
                    <option value="Green Chilli">Green Chilli (हिरवी मिरची)</option>
                    <option value="Basmati Rice">Basmati Rice (बासमती तांदूळ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Total Lot Quantity (kg)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Variety</label>
                  <input
                    type="text"
                    required
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="e.g. Nashik Red (Garwa)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Grade / Size</label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="e.g. Export Grade A+ (45-55mm)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Destination</label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="ARE">UAE (Dubai / Abu Dhabi)</option>
                    <option value="SAU">Saudi Arabia (Jeddah)</option>
                    <option value="QAT">Qatar (Doha)</option>
                    <option value="GBR">United Kingdom (London)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Preferred Incoterm</label>
                  <select
                    value={newIncoterm}
                    onChange={(e) => setNewIncoterm(e.target.value as IncotermType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="FOB">FOB (Nhava Sheva Sea Port)</option>
                    <option value="CIF">CIF (Jebel Ali Sea Port)</option>
                    <option value="EXW">EXW (Ex-Packhouse Nashik)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Indicative Price / kg</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as TradeCurrency)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Packaging Details</label>
                <input
                  type="text"
                  value={newPackaging}
                  onChange={(e) => setNewPackaging(e.target.value)}
                  placeholder="e.g. 25 kg red leno mesh bags"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateLotModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 transition-colors"
                >
                  Create & Publish Lot
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
