import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  User, 
  Building2, 
  Receipt, 
  Calendar, 
  Hash, 
  ChevronRight, 
  CreditCard,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CropLot, BuyerOffer, LanguageCode, PaymentStatus, PaymentRecord } from '../types';
import { translations } from '../i18n/translations';
import { QrCodeDisplay } from './QrCodeDisplay';

interface QrPaymentTrackingViewProps {
  cropLots?: CropLot[];
  buyerOffers?: BuyerOffer[];
  language: LanguageCode;
  onViewTransactionDetails?: () => void;
  onPaymentComplete?: (payment: PaymentRecord) => void;
  customAmount?: number;
  customTransactionId?: string;
}

const DEFAULT_PAYMENT_HISTORY: PaymentRecord[] = [
  {
    id: 'pay-01',
    transactionId: 'KM-TRX-00125',
    paymentRef: 'PAY-892104',
    amount: 25000,
    lotCode: 'AGRI-2026-NASH-0421',
    commodity: 'Tomato (Hybrid Shivam)',
    farmerName: 'Ramesh Balasaheb Patil',
    buyerCompany: 'FreshBasket Hypermarkets Ltd',
    date: '22 Sep 2026',
    status: 'PAYMENT_RECEIVED',
    isDemo: true
  },
  {
    id: 'pay-02',
    transactionId: 'KM-TRX-00098',
    paymentRef: 'PAY-741298',
    amount: 18500,
    lotCode: 'AGRI-2026-FPO-001',
    commodity: 'Garwa Red Onion',
    farmerName: 'Ramesh Balasaheb Patil',
    buyerCompany: 'Kisan Mart Food Processors',
    date: '20 Sep 2026',
    status: 'COMPLETED',
    isDemo: true
  },
  {
    id: 'pay-03',
    transactionId: 'KM-TRX-00084',
    paymentRef: 'PAY-612049',
    amount: 12000,
    lotCode: 'AGRI-2026-NASH-0912',
    commodity: 'Grapes (Thompson Seedless)',
    farmerName: 'Ramesh Balasaheb Patil',
    buyerCompany: 'EuroAgro Exports Pvt Ltd',
    date: '18 Sep 2026',
    status: 'PENDING',
    isDemo: true
  }
];

export const QrPaymentTrackingView: React.FC<QrPaymentTrackingViewProps> = ({
  cropLots = [],
  buyerOffers = [],
  language,
  onViewTransactionDetails,
  onPaymentComplete,
  customAmount,
  customTransactionId
}) => {
  const t = translations[language];

  // Primary active deal info
  const activeLot = cropLots[0];
  const activeOffer = buyerOffers[0];

  const transactionId = customTransactionId || 'KM-TRX-00125';
  const amount = customAmount || 25000;
  const farmerName = activeLot?.farmerName || 'Ramesh Balasaheb Patil';
  const buyerCompany = activeOffer?.buyerCompany || 'FreshBasket Hypermarkets Ltd';
  const lotCode = activeLot?.lotCode || 'AGRI-2026-NASH-0421';
  const commodity = activeLot?.commodity || 'Tomato (Hybrid Shivam)';

  // Interaction State
  const [activeRole, setActiveRole] = useState<'farmer' | 'buyer'>('farmer');
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [paymentRef, setPaymentRef] = useState<string>('PAY-892104');
  const [paymentDate, setPaymentDate] = useState<string>('22 September 2026');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(DEFAULT_PAYMENT_HISTORY);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  // Simulated Payment Action (Triggered by Buyer or Demo button)
  const handleSimulatePayment = () => {
    setSimulatedError(null);
    setPaymentStatus('PROCESSING');

    setTimeout(() => {
      const newRef = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const currentDate = '22 September 2026';
      setPaymentRef(newRef);
      setPaymentDate(currentDate);
      setPaymentStatus('PAYMENT_RECEIVED');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Update History List
      const completedRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        transactionId,
        paymentRef: newRef,
        amount,
        lotCode,
        commodity,
        farmerName,
        buyerCompany,
        date: '22 Sep 2026',
        status: 'PAYMENT_RECEIVED',
        isDemo: true
      };

      setPaymentHistory(prev => [
        completedRecord,
        ...prev.filter(p => p.transactionId !== transactionId)
      ]);

      if (onPaymentComplete) {
        onPaymentComplete(completedRecord);
      }
    }, 900);
  };

  const handleResetDemo = () => {
    setPaymentStatus('PENDING');
    setSimulatedError(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.qrPaymentTrackingTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading">
            {t.qrPaymentTrackingTitle}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            {t.qrPaymentSubtitle}
          </p>
        </div>

        {/* Prototype Indicator Badge */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Payment Prototype (Demo)</span>
        </div>
      </div>

      {/* Prototype Flow Switcher (Farmer Receive vs Buyer Scan & Pay) */}
      <div className="p-1.5 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center gap-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveRole('farmer')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeRole === 'farmer'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.viewAsFarmer}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRole('buyer')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeRole === 'buyer'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.viewAsBuyer}</span>
        </button>
      </div>

      {/* Simulated Error Alert if triggered */}
      {simulatedError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{simulatedError}</span>
          </div>
          <button
            onClick={() => setSimulatedError(null)}
            className="text-xs underline hover:text-rose-600"
          >
            {t.btnClose}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FARMER PAYMENT FLOW (FARMER VIEW) */}
      {/* ========================================================================= */}
      {activeRole === 'farmer' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Offer Accepted Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md">
                🤝
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  {t.offerAcceptedLabel}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {commodity} • Lot #{lotCode}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Buyer: <strong>{buyerCompany}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                ✓ Ready for Payment
              </span>
            </div>
          </div>

          {/* Main Farmer Payment Card */}
          <div className="farmer-card p-6 sm:p-8 space-y-6 text-center max-w-xl mx-auto border-2 border-emerald-500/30 shadow-xl">
            
            {/* Header: Payment & Amount to Receive */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading block">
                {t.amountToReceiveLabel}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading">
                ₹{amount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.paymentHeading} • Direct Settlement to <strong>{farmerName}</strong>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center justify-center">
              {paymentStatus === 'PENDING' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span>● {t.statusPendingText}</span>
                </div>
              )}

              {paymentStatus === 'PROCESSING' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 text-xs sm:text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                  <span>Verifying Payment...</span>
                </div>
              )}

              {(paymentStatus === 'PAYMENT_RECEIVED' || paymentStatus === 'COMPLETED') && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>✓ {t.statusReceivedText}</span>
                </div>
              )}
            </div>

            {/* Large SHOW / HIDE QR Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="w-full sm:w-auto min-w-[220px] py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base font-heading shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 mx-auto"
              >
                <QrCode className="w-5 h-5" />
                <span>{showQrCode ? t.btnHideQr : t.btnShowQr}</span>
              </button>
            </div>

            {/* QR Code Container with High Contrast & Simple Instruction */}
            {showQrCode && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                
                {/* Farmer Friendly Instruction */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                  <span>📱</span>
                  <span>{t.farmerScanInstruction}</span>
                </div>

                {/* The QR Component */}
                <QrCodeDisplay
                  transactionId={transactionId}
                  amount={amount}
                  farmerName={farmerName}
                  buyerName={buyerCompany}
                  lotCode={lotCode}
                  language={language}
                  size={240}
                />
              </div>
            )}

            {/* If Completed: Full Transaction Receipt Details */}
            {(paymentStatus === 'PAYMENT_RECEIVED' || paymentStatus === 'COMPLETED') && (
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-left space-y-3 font-mono text-xs animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-sans font-bold">{t.paymentHeading} Summary</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                    ✓ {t.statusReceivedText}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.transactionIdLabel}:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{transactionId}</strong>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.paymentRefLabel}:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{paymentRef}</strong>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.dateLabel}:</span>
                  <strong className="text-slate-900 dark:text-white">{paymentDate}</strong>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 font-sans">
                  <span className="font-bold text-slate-900 dark:text-white">{t.amountToReceiveLabel}:</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions for Farmer: View Transaction & Demo triggers */}
            <div className="pt-2 space-y-3">
              {paymentStatus === 'PENDING' && (
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.btnConfirmReceipt} (Demo Simulation)</span>
                </button>
              )}

              {onViewTransactionDetails && (
                <button
                  type="button"
                  onClick={onViewTransactionDetails}
                  className="w-full py-3 px-6 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{t.btnViewTransaction}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {paymentStatus !== 'PENDING' && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo Payment</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BUYER / MERCHANT FLOW (BUYER VIEW) */}
      {/* ========================================================================= */}
      {activeRole === 'buyer' && (
        <div className="farmer-card p-6 sm:p-8 space-y-6 max-w-xl mx-auto border-2 border-indigo-500/30 shadow-xl animate-fadeIn">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>BUYER CHECKOUT & ESCROW RELEASE</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              {t.paymentHeading}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.buyerScanInstruction}
            </p>
          </div>

          {/* Simple Buyer Invoice Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="font-sans font-medium">{t.amountToPayLabel}:</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading font-sans">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="font-sans">{t.transactionIdLabel}:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{transactionId}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="font-sans">Farmer Payee:</span>
              <strong className="text-slate-900 dark:text-white">{farmerName}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="font-sans">Consignment:</span>
              <strong className="text-slate-900 dark:text-white">{commodity} ({lotCode})</strong>
            </div>
          </div>

          {/* Buyer Payment Action or Success Screen */}
          {paymentStatus === 'PENDING' ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base font-heading shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
              >
                <QrCode className="w-5 h-5" />
                <span>{t.btnScanAndPay} (₹{amount.toLocaleString('en-IN')})</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                ⚡ {t.demoPaymentNotice}
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {t.paymentSuccessfulTitle}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Payment has been transferred to {farmerName}.
              </p>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.paymentRefLabel}:</span>
                  <strong className="text-slate-900 dark:text-white">{paymentRef}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.transactionIdLabel}:</span>
                  <strong className="text-slate-900 dark:text-white">{transactionId}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.dateLabel}:</span>
                  <strong className="text-slate-900 dark:text-white">{paymentDate}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Amount:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">₹{amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Status:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">✓ {t.statusReceivedText}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDemo}
                className="text-xs text-indigo-600 dark:text-indigo-400 underline font-bold"
              >
                Reset for Demo
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PAYMENT HISTORY SECTION (ACCESSIBLE & CLEAN) */}
      {/* ========================================================================= */}
      <div className="farmer-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
              {t.paymentHistoryTitle}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {paymentHistory.length} Transactions
          </span>
        </div>

        {/* Clean, Simple List of Payment Cards */}
        <div className="space-y-3">
          {paymentHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  
                  {item.status === 'PAYMENT_RECEIVED' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      ✓ {t.statusReceivedText}
                    </span>
                  )}
                  {item.status === 'COMPLETED' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      ✓ {t.statusCompletedText}
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      ● {t.statusPendingText}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {item.commodity} • {item.buyerCompany}
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  {item.transactionId} • Ref: {item.paymentRef}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {item.date}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Direct Mandi Settlement
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
