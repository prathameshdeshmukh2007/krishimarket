import React, { useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  QrCode, 
  Star, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import { CropLot, BuyerOffer, LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { PaymentQrModal } from './PaymentQrModal';
import { RatingReviewModal } from './RatingReviewModal';
import { QrPaymentTrackingView } from './QrPaymentTrackingView';

interface TransactionTrackerViewProps {
  cropLots: CropLot[];
  buyerOffers: BuyerOffer[];
  language: LanguageCode;
  onNavigateToLots?: () => void;
  onNavigateToOffers?: () => void;
}

export const TransactionTrackerView: React.FC<TransactionTrackerViewProps> = ({
  cropLots,
  buyerOffers,
  language,
  onNavigateToLots,
  onNavigateToOffers
}) => {
  const t = translations[language];

  // Tracker Mode: 'workflow' (8-stage consignment tracker) or 'qr_payment' (QR Payment & Tracking)
  const [activeTrackerTab, setActiveTrackerTab] = useState<'workflow' | 'qr_payment'>('workflow');

  // Active Transaction State (Simulated interactive deal lifecycle)
  const [currentStage, setCurrentStage] = useState<number>(6); // 1 to 8
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const activeLot = cropLots[0] || {
    id: 'lot-01',
    lotCode: 'AGRI-2026-NASH-0421',
    commodity: 'Tomato',
    quantityQuintals: 85,
    farmerName: 'Ramesh Balasaheb Patil'
  };
  const activeOffer = buyerOffers[0] || {
    buyerCompany: 'FreshBasket Hypermarkets Ltd',
    offerPricePerQ: 2580,
    estimatedNetRealisationPerQ: 2550
  };

  const dealTotalAmount = (activeLot.quantityQuintals || 85) * (activeOffer.estimatedNetRealisationPerQ || 2550);

  const stages = [
    { num: 1, id: 'crop', title: t.stepMyCrop, icon: '🌾' },
    { num: 2, id: 'offer', title: t.stepOffer, icon: '📩' },
    { num: 3, id: 'compare', title: t.stepCompare, icon: '⚖️' },
    { num: 4, id: 'accept', title: t.stepAccept, icon: '🤝' },
    { num: 5, id: 'inspection', title: t.stepInspection, icon: '🔬' },
    { num: 6, id: 'transport', title: t.stepTransport, icon: '🚛' },
    { num: 7, id: 'payment', title: t.stepPayment, icon: '💳' },
    { num: 8, id: 'done', title: t.stepDone, icon: '✅' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl shadow-emerald-700/10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>TRANSPARENT SELLING & ESCROW WORKFLOW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            {t.transactionFlowTitle}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            Active Consignment: <strong>{activeLot.lotCode}</strong> ({activeLot.commodity}) • Buyer: <strong>{activeOffer.buyerCompany}</strong>
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation: 8-Step Consignment Workflow vs QR Payment & Payment Tracking */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTrackerTab('workflow')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center justify-center gap-2 transition-all ${
            activeTrackerTab === 'workflow'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>8-Step Consignment Workflow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTrackerTab('qr_payment')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center justify-center gap-2 transition-all ${
            activeTrackerTab === 'qr_payment'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{t.qrPaymentTrackingTitle}</span>
        </button>
      </div>

      {/* VIEW 1: DEDICATED QR PAYMENT & PAYMENT TRACKING SECTION */}
      {activeTrackerTab === 'qr_payment' ? (
        <div className="animate-fadeIn">
          <QrPaymentTrackingView
            cropLots={cropLots}
            buyerOffers={buyerOffers}
            language={language}
            customAmount={25000}
            customTransactionId="KM-TRX-00125"
            onViewTransactionDetails={() => setActiveTrackerTab('workflow')}
            onPaymentComplete={() => {
              setCurrentStage(8);
              setIsCompleted(true);
            }}
          />
        </div>
      ) : (
        /* VIEW 2: 8-STEP CONSIGNMENT WORKFLOW */
        <div className="space-y-6 animate-fadeIn">
          {/* 8-STEP VISUAL PROGRESS STEPPER */}
          <div className="farmer-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                {t.currentStageLabel}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{stages[currentStage - 1].title}</strong>
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Step {currentStage} of 8
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {stages.map((st) => {
                const isPassed = st.num < currentStage;
                const isCurrent = st.num === currentStage;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => {
                      setCurrentStage(st.num);
                      if (st.num === 7) {
                        setActiveTrackerTab('qr_payment');
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 shadow-md ring-2 ring-emerald-500/20'
                        : isPassed
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-60'
                    }`}
                  >
                    <span className="text-lg">{st.icon}</span>
                    <span className="text-[11px] font-bold font-heading mt-1 leading-tight line-clamp-1">
                      {st.title}
                    </span>
                    <div className="w-full mt-1">
                      {isPassed ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto animate-ping" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE DETAILS CARD & ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Active Stage Details */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Stage 5: Quality Inspection Card */}
              <div className="farmer-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>{t.inspectionStatusLabel}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    ✓ Passed Grade A
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Inspection Date:</span>
                    <strong>28 Aug 2026 (10:45 AM)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assaying Agronomist:</span>
                    <strong>Aniket Kadam (Certified QC)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Parameters Verified:</span>
                    <strong>92.5% Color Uniformity • Zero Decay • Sugar 19° Brix</strong>
                  </div>
                </div>
              </div>

              {/* Stage 6: Logistics & Transport Tracker */}
              <div className="farmer-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <span>🚛</span>
                    <span>{t.logisticsStatusLabel}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                    {t.statusInTransit}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vehicle / Driver:</span>
                    <strong>Tata 1109 Container (MH-15-EG-4412) • Rajesh Yadav</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pickup Location:</span>
                    <strong>Farmgate: Gat 112, Pimpalgaon Baswant</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Destination Hub:</span>
                    <strong>FreshBasket Central Terminal, Vashi</strong>
                  </div>
                </div>
              </div>

              {/* Stage 7 & 8 Actions: Direct QR Payment & Review Trigger */}
              <div className="farmer-card p-5 space-y-3 bg-gradient-to-r from-emerald-50/50 dark:from-emerald-950/20 to-transparent border-2 border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <span>📲</span>
                    <span>{t.qrPaymentTrackingTitle}</span>
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    KM-TRX-00125
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.paymentSectionSubtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTrackerTab('qr_payment')}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t.btnShowQr} & Track</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRatingModal(true)}
                    className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>{t.giveRatingTitle}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right 5 Cols: True Net Realisation Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="farmer-card p-5 space-y-4 border-2 border-indigo-500/30">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span>💰</span>
                  <span>{t.netRealisationTitle}</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t.buyerOfferPart}:</span>
                    <strong className="text-slate-900 dark:text-white font-bold text-sm">
                      ₹{activeOffer.offerPricePerQ}/q (₹{(activeOffer.offerPricePerQ / 100).toFixed(1)}/kg)
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span>- {t.transportDeductionPart} (Buyer Borne):</span>
                    <strong>-₹0/q (₹0/kg)</strong>
                  </div>

                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span>- {t.storageDeductionPart}:</span>
                    <strong>-₹30/q (₹0.3/kg)</strong>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                      {t.netInHandPart}:
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                      ₹{activeOffer.estimatedNetRealisationPerQ}/q
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  💡 {t.netRealisationFormula}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Payment QR Modal */}
      <PaymentQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        language={language}
        amount={dealTotalAmount}
        lotCode={activeLot.lotCode}
        farmerName={activeLot.farmerName}
        buyerName={activeOffer.buyerCompany}
        onPaymentConfirmed={() => {
          setCurrentStage(8);
          setIsCompleted(true);
        }}
      />

      {/* Rating & Review Modal */}
      <RatingReviewModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        language={language}
        transactionId={`tx-${activeLot.lotCode}`}
        lotCode={activeLot.lotCode}
        targetName={activeOffer.buyerCompany}
        targetRole="merchant"
        onReviewSubmitted={(rev) => {
          setIsCompleted(true);
        }}
      />
    </div>
  );
};
