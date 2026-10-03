import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Send,
  UserCheck,
  Building,
  Award,
  AlertCircle,
  Navigation,
  Phone,
  Truck,
  ArrowRight,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CropLot, BuyerOffer, FarmVisitAppointment, LanguageCode } from '../types';
import { INITIAL_BUYER_OFFERS } from '../data/initialData';
import { FarmVisitsModal } from './FarmVisitsModal';
import { DirectBuyModal } from './DirectBuyModal';
import { translations } from '../i18n/translations';

interface BuyerMarketplaceViewProps {
  cropLots: CropLot[];
  language: LanguageCode;
  onViewPassport: (lot: CropLot) => void;
  onOpenLiveCamera?: () => void;
  appointments: FarmVisitAppointment[];
  onAddAppointment: (appointment: FarmVisitAppointment) => void;
  onUpdateLotStatus: (lotId: string, status: any) => void;
}

export const BuyerMarketplaceView: React.FC<BuyerMarketplaceViewProps> = ({
  cropLots,
  language,
  onViewPassport,
  onOpenLiveCamera,
  appointments,
  onAddAppointment,
  onUpdateLotStatus
}) => {
  const t = translations[language];

  const [activeMarketTab, setActiveMarketTab] = useState<'lots' | 'visits'>('lots');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('All');
  const [offers, setOffers] = useState<BuyerOffer[]>(INITIAL_BUYER_OFFERS);

  // Modals State
  const [lotForVisit, setLotForVisit] = useState<CropLot | null>(null);
  const [lotForBuy, setLotForBuy] = useState<CropLot | null>(null);
  const [lotForOffer, setLotForOffer] = useState<CropLot | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(2550);
  const [offerQty, setOfferQty] = useState<number>(50);
  const [transportTerm, setTransportTerm] = useState<'BUYER' | 'FARMER'>('BUYER');

  const filteredLots = cropLots.filter(lot => {
    const matchesSearch = lot.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.lotCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = selectedCropFilter === 'All' || lot.commodity.toLowerCase().includes(selectedCropFilter.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const handlePlaceOffer = () => {
    if (!lotForOffer) return;

    const newOffer: BuyerOffer = {
      id: `off-${Date.now()}`,
      lotId: lotForOffer.id,
      lotCode: lotForOffer.lotCode,
      buyerId: 'b-current-user',
      buyerName: 'Vikram Mehta (Merchant)',
      buyerCompany: 'Metro Agri Logistics & Foods Ltd',
      buyerType: 'Retail Chain',
      buyerTrustScore: 96.5,
      buyerCompletedTrades: 122,
      offerPricePerQ: offerPrice,
      quantityRequestedQ: offerQty,
      transportPaidBy: transportTerm,
      estimatedTransportCostPerQ: transportTerm === 'BUYER' ? 0 : 35,
      estimatedHandlingCostPerQ: 25,
      estimatedNetRealisationPerQ: offerPrice - (transportTerm === 'BUYER' ? 25 : 60),
      status: 'pending',
      validUntil: '2026-08-30 18:00',
      createdAt: 'Just now',
      termsNotes: 'Farmgate loading included. Direct escrow settlement upon delivery.'
    };

    setOffers([newOffer, ...offers]);
    setLotForOffer(null);

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  const handleDirectBuyConfirmed = (lotId: string, offer: BuyerOffer) => {
    setOffers([offer, ...offers]);
    onUpdateLotStatus(lotId, 'accepted');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>B2B PHYSICAL PRODUCE & MERCHANT VISITS MARKETPLACE</span>
            </h2>
            <p className="text-xs text-slate-400">
              Buy verified physical crop lots directly, schedule farm visits with route maps, or bid with escrow protections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLiveCamera && (
              <button
                onClick={onOpenLiveCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap & Upload Crop</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow Protected</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Available Lots vs Active Farm Visits) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveMarketTab('lots')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${
                activeMarketTab === 'lots'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available Produce Lots ({filteredLots.length})
            </button>

            <button
              onClick={() => setActiveMarketTab('visits')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold flex items-center gap-1.5 ${
                activeMarketTab === 'visits'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Scheduled Farm Visits ({appointments.length})</span>
            </button>
          </div>

          {activeMarketTab === 'lots' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by crop, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Crops</option>
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Grapes">Grapes</option>
                <option value="Mango">Mango</option>
                <option value="Capsicum">Capsicum</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab View: Produce Lots */}
      {activeMarketTab === 'lots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLots.map((lot) => {
            const lotOffers = offers.filter(o => o.lotId === lot.id);

            return (
              <div 
                key={lot.id}
                className="glass-panel rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={lot.photos[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'}
                      alt={lot.commodity}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/85 border border-slate-700 text-[10px] font-mono text-emerald-400 font-bold">
                      {lot.lotCode}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                      {lot.aiPreliminaryGrade}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">{lot.quantityQuintals} Quintals</span>
                      <span className="text-emerald-400 font-black">₹{lot.expectedPricePerQ}/q</span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{lot.commodity}</h3>
                      <p className="text-xs text-slate-400">{lot.variety}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{lot.farmAddress || `${lot.village}, ${lot.district}, Maharashtra`}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Farmer: <strong className="text-slate-200">{lot.farmerName}</strong></span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lot.farmerPhone}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Harvest: <strong className="text-slate-200">{lot.expectedHarvestDate}</strong></span>
                      </div>
                    </div>

                    {/* AI Scan Mini Badges */}
                    {lot.aiAssessment && (
                      <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono grid grid-cols-2 gap-1 text-slate-300">
                        <div>Uniformity: <strong className="text-emerald-400">{lot.aiAssessment.colorUniformityPct}%</strong></div>
                        <div>Maturity: <strong className="text-emerald-400">{lot.aiAssessment.maturityIndexPct}%</strong></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Grid (Buy Now, Visit Farm, Bid) */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLotForBuy(lot)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black font-mono text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>

                    <button
                      onClick={() => setLotForVisit(lot)}
                      className="py-2 px-3 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 font-bold font-mono text-xs flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Visit Farm</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setLotForOffer(lot);
                        setOfferPrice(lot.expectedPricePerQ);
                        setOfferQty(lot.quantityQuintals);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-semibold text-center"
                    >
                      Make Bid
                    </button>

                    <button
                      onClick={() => onViewPassport(lot)}
                      className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-[11px] text-center"
                    >
                      View Passport
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Tab View: Scheduled Farm Visits & Appointments */}
      {activeMarketTab === 'visits' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-200 font-bold">
              SCHEDULED MERCHANT FARM VISITS & IN-PERSON INSPECTIONS
            </span>
            <span className="text-xs font-mono text-emerald-400">
              Total Active Appointments: {appointments.length}
            </span>
          </div>

          <div className="space-y-3">
            {appointments.map((appt) => (
              <div 
                key={appt.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{appt.commodity}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px]">
                      Lot: {appt.lotCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] uppercase font-bold">
                      {appt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Date: <strong className="text-white">{appt.visitDate}</strong> ({appt.visitTimeSlot})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">Farm: {appt.farmLocation}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Farmer: <strong className="text-slate-200">{appt.farmerName}</strong> ({appt.farmerPhone})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Merchant: <strong className="text-slate-200">{appt.merchantCompany}</strong></span>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                      <strong>Merchant Notes:</strong> {appt.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${appt.farmerPhone}`}
                    className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Farmer</span>
                  </a>

                  <button
                    onClick={() => alert(`GPS Navigation launched for ${appt.farmLocation}`)}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GPS Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <FarmVisitsModal
        isOpen={!!lotForVisit}
        onClose={() => setLotForVisit(null)}
        lot={lotForVisit}
        onVisitScheduled={onAddAppointment}
      />

      <DirectBuyModal
        isOpen={!!lotForBuy}
        onClose={() => setLotForBuy(null)}
        lot={lotForBuy}
        onBuyConfirmed={handleDirectBuyConfirmed}
      />

      {/* Make Offer Modal */}
      {lotForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">Place Physical Crop Offer</h3>
                <p className="text-xs text-slate-400">Lot: {lotForOffer.lotCode} ({lotForOffer.commodity})</p>
              </div>
              <button onClick={() => setLotForOffer(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Offer Rate (₹ / Quintal)</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Quantity Required (Quintals)</label>
                <input
                  type="number"
                  max={lotForOffer.quantityQuintals}
                  value={offerQty}
                  onChange={(e) => setOfferQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Transport Freight Terms</label>
                <select
                  value={transportTerm}
                  onChange={(e) => setTransportTerm(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="BUYER">Buyer Pays Freight (Farmgate Pickup)</option>
                  <option value="FARMER">Farmer Delivers to Mandi / Factory</option>
                </select>
              </div>

              {/* Realisation preview */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Lot Value:</span>
                  <span>₹{(offerPrice * offerQty).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Estimated Net to Farmer:</span>
                  <span>₹{(offerPrice - 25)}/quintal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button onClick={() => setLotForOffer(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button
                onClick={handlePlaceOffer}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow-md"
              >
                Submit Formal Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
