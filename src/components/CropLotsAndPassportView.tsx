import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Eye, 
  Truck, 
  DollarSign, 
  AlertCircle,
  Camera,
  ChevronRight,
  UserCheck,
  Navigation,
  Phone,
  MapPin
} from 'lucide-react';
import { CropLot, Commodity, LanguageCode, FarmVisitAppointment } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { translations } from '../i18n/translations';

interface CropLotsAndPassportViewProps {
  cropLots: CropLot[];
  commodities: Commodity[];
  language: LanguageCode;
  onAddLot: (newLot: CropLot) => void;
  onSelectLotForPassport?: (lot: CropLot) => void;
  appointments?: FarmVisitAppointment[];
}

export const CropLotsAndPassportView: React.FC<CropLotsAndPassportViewProps> = ({
  cropLots,
  commodities,
  language,
  onAddLot,
  appointments = []
}) => {
  const t = translations[language];

  const [selectedLot, setSelectedLot] = useState<CropLot>(cropLots[0]);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);

  // Relevant appointments for selected lot
  const lotAppointments = appointments.filter(a => a.lotId === selectedLot.id);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>MY CROP INVENTORY & DIGITAL CROP PASSPORTS</span>
          </h2>
          <p className="text-xs text-slate-400">
            Capture photos of your harvest with AI preliminary computer vision & maintain verifiable provenance passports.
          </p>
        </div>

        <button
          onClick={() => setShowCameraModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs font-mono shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Camera className="w-4 h-4" />
          <span>SNAP & UPLOAD CROP PHOTO</span>
        </button>
      </div>

      {/* Main Grid: Crop Lots List (Left) and Digital Passport View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lots List Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider px-1 flex items-center justify-between">
            <span>ACTIVE CROP LOTS ({cropLots.length})</span>
            <span className="text-[10px] text-emerald-400">Live Inventory</span>
          </div>

          <div className="space-y-3">
            {cropLots.map((lot) => {
              const isSelected = selectedLot.id === lot.id;
              return (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                        {lot.lotCode}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{lot.commodity}</h3>
                      <div className="text-xs text-slate-400">{lot.variety}</div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded uppercase bg-slate-900 border border-slate-800 text-slate-300">
                      {lot.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quantity:</span>
                      <span className="font-bold text-slate-200">{lot.quantityQuintals} Quintals</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expected Price:</span>
                      <span className="font-bold text-emerald-400">₹{lot.expectedPricePerQ}/q</span>
                    </div>
                  </div>

                  {lot.aiPreliminaryGrade && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        AI Prelim Grade:
                      </span>
                      <span className="font-mono font-bold text-emerald-300">{lot.aiPreliminaryGrade}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Crop Passport (Right Column) */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            {/* Passport Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    DIGITAL CROP PASSPORT
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    Verifiable ID
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white font-mono tracking-tight">
                  {selectedLot.lotCode}
                </h2>
                <p className="text-xs text-slate-400">
                  Farmer: <strong className="text-slate-200">{selectedLot.farmerName}</strong> ({selectedLot.farmerPhone}) • {selectedLot.village}, {selectedLot.district}, {selectedLot.state}
                </p>
                {selectedLot.farmAddress && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>Farm Location: {selectedLot.farmAddress}</span>
                  </p>
                )}
              </div>

              {/* QR Code Simulation Badge */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <QrCode className="w-10 h-10 text-emerald-400" />
                <div className="text-[10px] font-mono text-slate-400">
                  <div>QR PASSPORT</div>
                  <div className="text-emerald-400 font-bold">VERIFIED HASH</div>
                  <div>Traceable Lot</div>
                </div>
              </div>
            </div>

            {/* Produce Specs & Photos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Crop Commodity</span>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedLot.commodity}</div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Variety</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedLot.variety}</div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Quantity</span>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{selectedLot.quantityQuintals} Quintals</div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Expected Harvest</span>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">{selectedLot.expectedHarvestDate}</div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">AI Prelim Grade</span>
                  <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5">{selectedLot.aiPreliminaryGrade}</div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Verified Final Grade</span>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">{selectedLot.verifiedGrade}</div>
                </div>
              </div>

              {/* Photo Preview */}
              <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950 aspect-video md:aspect-auto">
                <img
                  src={selectedLot.photos[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'}
                  alt={selectedLot.commodity}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-emerald-400 border border-slate-800">
                  Photo Proof
                </span>
              </div>
            </div>

            {/* AI Preliminary Visual Assessment Card */}
            {selectedLot.aiAssessment && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>{t.aiVisualAssessment}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Scan Confidence: {selectedLot.aiAssessment.confidenceScore}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{t.colorUniformity}</span>
                    <span className="font-bold text-emerald-400">{selectedLot.aiAssessment.colorUniformityPct}%</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{t.maturityScore}</span>
                    <span className="font-bold text-emerald-400">{selectedLot.aiAssessment.maturityIndexPct}%</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{t.visibleDefects}</span>
                    <span className="font-bold text-slate-300">{selectedLot.aiAssessment.visibleDefectsPct}%</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  {selectedLot.aiAssessment.assessmentNotes.map((n, i) => (
                    <p key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{n}</span>
                    </p>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80 font-mono">
                  * {selectedLot.aiAssessment.disclaimer}
                </p>
              </div>
            )}

            {/* Merchant Farm Visit Appointments Section */}
            {lotAppointments.length > 0 && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    <span>Scheduled Merchant Farm Visits ({lotAppointments.length})</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {lotAppointments.map((appt) => (
                    <div key={appt.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{appt.merchantCompany} ({appt.merchantName})</div>
                        <div className="text-[11px] text-slate-400">Date: {appt.visitDate} • {appt.visitTimeSlot}</div>
                      </div>
                      <a href={`tel:${appt.merchantPhone}`} className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                        Call Merchant
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traceable Lifecycle Timeline */}
            <div>
              <h3 className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider mb-3">
                {t.provenanceTimeline} (Immutable Audit Log)
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 pl-8">
                {selectedLot.passportEvents.map((evt) => (
                  <div key={evt.id} className="relative group">
                    <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-slate-900 border border-emerald-500/60 flex items-center justify-center text-xs text-emerald-400 font-mono shadow">
                      ✓
                    </div>

                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex flex-wrap items-center justify-between text-xs">
                        <span className="font-bold text-white">{evt.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300">{evt.description}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                        <span>Actor: <strong className="text-slate-400">{evt.actor}</strong></span>
                        {evt.verifiedHash && <span>Hash: {evt.verifiedHash}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Camera Capture & Upload Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        commodities={commodities}
        language={language}
        onLotCreated={(lot) => {
          onAddLot(lot);
          setSelectedLot(lot);
        }}
      />
    </div>
  );
};
