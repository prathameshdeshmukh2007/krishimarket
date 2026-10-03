import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck, 
  Check,
  Receipt,
  Calendar,
  Hash,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { QrCodeDisplay } from './QrCodeDisplay';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  amount?: number;
  lotCode?: string;
  farmerName?: string;
  buyerName?: string;
  transactionId?: string;
  onPaymentConfirmed?: () => void;
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  language,
  amount = 25000,
  lotCode = 'KM-LOT-0421',
  farmerName = 'Ramesh Balasaheb Patil',
  buyerName = 'FreshBasket Hypermarkets Ltd',
  transactionId = 'KM-TRX-00125',
  onPaymentConfirmed
}) => {
  const t = translations[language];
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const [paymentRef, setPaymentRef] = useState<string>('PAY-892104');
  const [paymentDate, setPaymentDate] = useState<string>('22 Sep 2026');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    const generatedRef = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setPaymentRef(generatedRef);
    setPaymentDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setPaymentStatus('completed');

    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onPaymentConfirmed) {
      onPaymentConfirmed();
    }
  };

  const handleDone = () => {
    if (onPaymentConfirmed && paymentStatus === 'completed') {
      onPaymentConfirmed();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              📲
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                KRISHIMARKET QR PAYMENT
              </div>
              <h3 className="text-base font-bold font-heading">
                {paymentStatus === 'completed' ? 'Payment Completed' : 'Scan & Pay'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Demo Payment • Prototype Simulation (No real bank debit)</span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-center">
          
          {/* FLOW: PENDING STATE */}
          {paymentStatus === 'pending' ? (
            <>
              {/* Payment Details */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                  PAYMENT
                </span>
                <div className="text-4xl font-black text-slate-900 dark:text-white font-heading">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Buyer: <strong>{buyerName}</strong> • Lot: <strong>{lotCode}</strong>
                </div>
              </div>

              {/* Farmer Instruction */}
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                📱 Ask the buyer to scan this QR and pay.
              </div>

              {/* Large QR Code */}
              <div className="flex justify-center">
                <QrCodeDisplay
                  transactionId={transactionId}
                  amount={amount}
                  farmerName={farmerName}
                  buyerName={buyerName}
                  lotCode={lotCode}
                  language={language}
                  size={210}
                />
              </div>

              {/* Status Indicator */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Payment Status: Pending</span>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  ID: {transactionId}
                </div>
              </div>

              {/* Simulated Buyer Payment Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>⚡ Simulate Buyer Scan & Pay (₹{amount.toLocaleString('en-IN')})</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </>
          ) : (
            /* FLOW: PAYMENT RECEIVED COMPLETED STATE */
            <div className="space-y-5 animate-fadeIn">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
                ✓
              </div>

              <div className="space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 font-heading">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PAYMENT RECEIVED ✓</span>
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white font-heading">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct Settlement to {farmerName}
                </p>
              </div>

              {/* Transaction Detail Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 font-mono">
                  <span className="text-slate-500">Transaction ID:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{transactionId}</strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 font-mono">
                  <span className="text-slate-500">Payment Reference:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{paymentRef}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{paymentDate}</strong>
                </div>
              </div>

              {/* DONE BUTTON */}
              <button
                type="button"
                onClick={handleDone}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>DONE</span>
                <Check className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
