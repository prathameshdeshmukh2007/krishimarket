import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  UserCheck, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Building, 
  Phone, 
  ShieldCheck, 
  Navigation,
  Compass,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CropLot, FarmVisitAppointment, LanguageCode } from '../types';

interface FarmVisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: CropLot | null;
  onVisitScheduled: (appointment: FarmVisitAppointment) => void;
}

export const FarmVisitsModal: React.FC<FarmVisitsModalProps> = ({
  isOpen,
  onClose,
  lot,
  onVisitScheduled
}) => {
  if (!isOpen || !lot) return null;

  const [visitDate, setVisitDate] = useState<string>('2026-08-30');
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('Morning (09:00 AM - 12:00 PM)');
  const [purpose, setPurpose] = useState<'SAMPLE_TESTING' | 'COMMERCIAL_GRADING' | 'BULK_FARMGATE_PURCHASE'>('BULK_FARMGATE_PURCHASE');
  const [merchantName, setMerchantName] = useState<string>('Vikram Mehta');
  const [merchantCompany, setMerchantCompany] = useState<string>('FreshBasket Hypermarkets Ltd');
  const [merchantPhone, setMerchantPhone] = useState<string>('+91 98190 44321');
  const [notes, setNotes] = useState<string>('Bringing 10-Tonner Reefer Truck. Ready for on-spot NEFT settlement after Brix inspection.');
  const [scheduledSuccess, setScheduledSuccess] = useState<boolean>(false);

  const handleSubmitVisit = () => {
    const appointment: FarmVisitAppointment = {
      id: `visit-${Date.now()}`,
      lotId: lot.id,
      lotCode: lot.lotCode,
      commodity: lot.commodity,
      farmerId: lot.farmerId,
      farmerName: lot.farmerName,
      farmerPhone: lot.farmerPhone,
      farmLocation: lot.farmAddress || `${lot.village}, ${lot.district}, Maharashtra`,
      merchantId: 'm-current-user',
      merchantName,
      merchantCompany,
      merchantPhone,
      merchantType: 'Retail Chain / Wholesale Merchant',
      visitDate,
      visitTimeSlot,
      purpose,
      status: 'CONFIRMED',
      notes,
      createdAt: 'Just now'
    };

    onVisitScheduled(appointment);
    setScheduledSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => {
      setScheduledSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-emerald-500/50 bg-slate-950 space-y-5 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                SCHEDULE ON-FARM VISIT & DIRECT PURCHASE
              </h3>
              <p className="text-xs text-slate-400">
                Meet farmer at farmgate, inspect physical produce quality, and buy directly.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white font-mono">FARM VISIT CONFIRMED!</h4>
            <p className="text-xs text-emerald-300">
              Farmer {lot.farmerName} has received your appointment for {visitDate} ({visitTimeSlot}). Farm location GPS and route dispatched.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Target Lot Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold">{lot.lotCode}</span>
                <div className="text-sm font-bold text-white">{lot.commodity} ({lot.variety})</div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lot.farmAddress || `${lot.village}, ${lot.district}`}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Lot Volume</div>
                <div className="text-base font-black text-emerald-400">{lot.quantityQuintals} Quintals</div>
                <div className="text-[11px] text-white">Asking: ₹{lot.expectedPricePerQ}/q</div>
              </div>
            </div>

            {/* Visit Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Preferred Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Time Window</label>
                <select
                  value={visitTimeSlot}
                  onChange={(e) => setVisitTimeSlot(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option>Morning (08:00 AM - 11:00 AM)</option>
                  <option>Mid-Day (11:00 AM - 02:00 PM)</option>
                  <option>Afternoon (02:00 PM - 05:00 PM)</option>
                  <option>Evening Harvest (05:00 PM - 07:30 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Visit Objective / Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="BULK_FARMGATE_PURCHASE">Direct Farmgate Loading & Buy</option>
                  <option value="COMMERCIAL_GRADING">Physical Quality Grading & Brix Check</option>
                  <option value="SAMPLE_TESTING">Pre-Harvest Quality Sample Collection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Merchant Contact Phone</label>
                <input
                  type="text"
                  value={merchantPhone}
                  onChange={(e) => setMerchantPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Merchant Instructions & Vehicle Details</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. bringing weighing scale, transport truck type, settlement terms..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            {/* Guaranteed Protections */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Direct-from-Farm Trade Protocol</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Upon on-farm quality sign-off, digital weight tickets and payment escrow can be authorized directly via the app.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white">
                Cancel
              </button>

              <button
                onClick={handleSubmitVisit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black font-mono shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirm & Dispatch Farm Visit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
