import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building, 
  Receipt, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CropLot, BuyerOffer, LanguageCode } from '../types';

interface DirectBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: CropLot | null;
  onBuyConfirmed: (lotId: string, offer: BuyerOffer) => void;
}

export const DirectBuyModal: React.FC<DirectBuyModalProps> = ({
  isOpen,
  onClose,
  lot,
  onBuyConfirmed
}) => {
  if (!isOpen || !lot) return null;

  const [purchaseQty, setPurchaseQty] = useState<number>(lot.quantityQuintals);
  const [purchaseRate, setPurchaseRate] = useState<number>(lot.expectedPricePerQ);
  const [transportChoice, setTransportChoice] = useState<'BUYER' | 'FARMER'>('BUYER');
  const [paymentMethod, setPaymentMethod] = useState<string>('NEFT_ESCROW');
  const [dealSuccess, setDealSuccess] = useState<boolean>(false);

  const grossTotal = purchaseQty * purchaseRate;
  const transportDeduction = transportChoice === 'BUYER' ? 0 : purchaseQty * 35;
  const handlingDeduction = purchaseQty * 25;
  const netPayableToFarmer = grossTotal - transportDeduction - handlingDeduction;

  const handleExecuteDeal = () => {
    const buyOffer: BuyerOffer = {
      id: `deal-${Date.now()}`,
      lotId: lot.id,
      lotCode: lot.lotCode,
      buyerId: 'b-current-merchant',
      buyerName: 'Vikram Mehta (Merchant)',
      buyerCompany: 'FreshBasket Hypermarkets Ltd',
      buyerType: 'Retail Chain',
      buyerTrustScore: 97.5,
      buyerCompletedTrades: 145,
      offerPricePerQ: purchaseRate,
      quantityRequestedQ: purchaseQty,
      transportPaidBy: transportChoice,
      estimatedTransportCostPerQ: transportChoice === 'BUYER' ? 0 : 35,
      estimatedHandlingCostPerQ: 25,
      estimatedNetRealisationPerQ: purchaseRate - (transportChoice === 'BUYER' ? 25 : 60),
      status: 'accepted',
      validUntil: 'Immediate Settlement',
      createdAt: 'Just now',
      termsNotes: 'Direct Instant Purchase executed at asking price. Escrow locked.'
    };

    onBuyConfirmed(lot.id, buyOffer);
    setDealSuccess(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {}

    setTimeout(() => {
      setDealSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-emerald-500/50 bg-slate-950 space-y-5 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                INSTANT DIRECT PURCHASE & ESCROW
              </h3>
              <p className="text-xs text-slate-400">
                Execute direct farmgate purchase with digital escrow lock & vehicle dispatch.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {dealSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white font-mono">DEAL LOCKED & ESCROW HELD!</h4>
            <p className="text-xs text-emerald-300">
              Payment of ₹{grossTotal.toLocaleString('en-IN')} held in escrow. Logistics vehicle dispatched for farmgate pickup from {lot.farmerName}.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Target Lot Info */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold">{lot.lotCode}</span>
                <div className="text-sm font-bold text-white">{lot.commodity} ({lot.variety})</div>
                <div className="text-[11px] text-slate-400">Farmer: {lot.farmerName} ({lot.district})</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400">Available Lot</div>
                <div className="text-base font-black text-white">{lot.quantityQuintals} Quintals</div>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Purchase Quantity (Quintals)</label>
                <input
                  type="number"
                  max={lot.quantityQuintals}
                  min={1}
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Agreed Rate (₹ / Quintal)</label>
                <input
                  type="number"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Logistics Arrangement</label>
                <select
                  value={transportChoice}
                  onChange={(e) => setTransportChoice(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="BUYER">Merchant Sends Truck (Farmgate)</option>
                  <option value="FARMER">Farmer Delivers to Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Escrow Settlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="NEFT_ESCROW">Digital Mandi Escrow (Instant Release)</option>
                  <option value="RTGS_DIRECT">Bank RTGS / NEFT Direct</option>
                  <option value="UPI_INSTANT">UPI Fast Settlement</option>
                </select>
              </div>
            </div>

            {/* Financial Invoice Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Gross Purchase Value ({purchaseQty}q @ ₹{purchaseRate}/q):</span>
                <span className="font-bold text-white">₹{grossTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Logistics Freight Responsibility:</span>
                <span>{transportChoice === 'BUYER' ? 'Paid by Merchant (Zero farmer deduction)' : '-₹' + transportDeduction}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Handling & Weighment Fee:</span>
                <span>-₹{handlingDeduction.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-black text-sm pt-2 border-t border-slate-800">
                <span>Net Payable to Farmer:</span>
                <span>₹{netPayableToFarmer.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Execute CTA */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">
                Cancel
              </button>

              <button
                onClick={handleExecuteDeal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black font-mono shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>CONFIRM & LOCK PURCHASE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
