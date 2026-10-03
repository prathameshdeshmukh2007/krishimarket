import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Sliders, 
  Layers, 
  ShieldCheck,
  X,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { Commodity, CropLot, LanguageCode } from '../types';
import { performCropPhotoAiScan } from '../services/aiEngine';
import { translations } from '../i18n/translations';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  language: LanguageCode;
  onLotCreated: (newLot: CropLot) => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Fresh Red Tomatoes (Vine Harvest)',
    crop: 'Tomato',
    variety: 'Hybrid Shivam (Grade A+)',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    location: 'Pimpalgaon Baswant, Nashik',
    defaultPrice: 2550
  },
  {
    name: 'Thompson Seedless Grapes (Vineyard Export)',
    crop: 'Grapes (Thompson / Sonaka)',
    variety: 'Thompson Seedless Table Grapes',
    url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80',
    location: 'Dindori, Nashik',
    defaultPrice: 8400
  },
  {
    name: 'Garwa Red Onion (Cured Stock)',
    crop: 'Onion',
    variety: 'Nashik Garwa Red Onion',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    location: 'Lasalgaon, Nashik',
    defaultPrice: 2750
  },
  {
    name: 'Green Polyhouse Capsicum',
    crop: 'Capsicum (Shimla Mirch)',
    variety: 'Indra Polyhouse Green Capsicum',
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80',
    location: 'Baramati, Pune',
    defaultPrice: 3900
  }
];

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  commodities,
  language,
  onLotCreated
}) => {
  const t = translations[language];

  // Camera State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string>(PRESET_SAMPLE_PHOTOS[0].url);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Form Fields
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [variety, setVariety] = useState<string>('Hybrid Shivam');
  const [quantity, setQuantity] = useState<number>(75);
  const [district, setDistrict] = useState<string>('Nashik');
  const [village, setVillage] = useState<string>('Pimpalgaon Baswant');
  const [farmAddress, setFarmAddress] = useState<string>('Survey No. 42, Pimpalgaon-Vani Road, Nashik, Maharashtra');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>('2026-08-30');
  const [expectedPrice, setExpectedPrice] = useState<number>(2550);
  const [farmerPhone, setFarmerPhone] = useState<string>('+91 98234 56789');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = async () => {
    setCameraError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera not supported by browser. Please choose an uploaded photo or preset sample.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access unavailable. Using high-resolution photo picker/presets.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture frame from video
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
        runAiQualityScan(selectedCrop, dataUrl);
      }
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        stopCamera();
        runAiQualityScan(selectedCrop, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setCapturedImage(preset.url);
    setSelectedCrop(preset.crop);
    setVariety(preset.variety);
    setExpectedPrice(preset.defaultPrice);
    const parts = preset.location.split(', ');
    setVillage(parts[0] || 'Pimpalgaon');
    setDistrict(parts[1] || 'Nashik');
    stopCamera();
    runAiQualityScan(preset.crop, preset.url);
  };

  const runAiQualityScan = (crop: string, imgUrl: string) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const assessment = performCropPhotoAiScan(crop, imgUrl);
      setScanResult(assessment);
      setIsScanning(false);
    }, 1000);
  };

  // Run initial scan on mount
  useEffect(() => {
    if (isOpen) {
      runAiQualityScan(selectedCrop, capturedImage);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePublishLot = () => {
    const lotCode = `AGRI-2026-NASH-${Math.floor(1000 + Math.random() * 9000)}`;

    const assessment = scanResult || performCropPhotoAiScan(selectedCrop, capturedImage);

    const newLot: CropLot = {
      id: `lot-${Date.now()}`,
      lotCode,
      farmerId: 'f-current-user',
      farmerName: 'Prathamesh (Verified Farmer)',
      farmerPhone,
      state: 'Maharashtra',
      district,
      village,
      farmAddress,
      farmCoordinates: { lat: 19.9975, lng: 73.7898 },
      commodity: selectedCrop,
      variety,
      quantityQuintals: quantity,
      expectedHarvestDate,
      status: 'active',
      expectedPricePerQ: expectedPrice,
      minAcceptablePricePerQ: expectedPrice - 120,
      storageAvailable: true,
      storageCostPerDayPerQ: 4.0,
      verifiedGrade: 'Ungraded',
      aiPreliminaryGrade: assessment.recommendedGrade,
      aiAssessment: assessment,
      photos: [capturedImage],
      offersCount: 0,
      createdAt: 'Just now',
      passportEvents: [
        {
          id: `ev-${Date.now()}-1`,
          title: 'Direct Photo Upload & Lot Registered',
          description: `Farmer uploaded crop photograph and registered ${quantity} Quintals of ${selectedCrop} (${variety}) at ${village}, ${district}.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          actor: 'Farmer (Direct Camera Upload)',
          category: 'CREATION',
          status: 'COMPLETED',
          verifiedHash: '0x' + Math.random().toString(16).substring(2, 10)
        },
        {
          id: `ev-${Date.now()}-2`,
          title: 'AI Preliminary Quality Verification',
          description: `Scanned: ${assessment.colorUniformityPct}% color uniformity, ${assessment.maturityIndexPct}% maturity score, suggested ${assessment.recommendedGrade}.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          actor: 'AI Vision Engine',
          category: 'AI_SCAN',
          status: 'COMPLETED',
          verifiedHash: '0x' + Math.random().toString(16).substring(2, 10)
        }
      ]
    };

    onLotCreated(newLot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl p-6 rounded-2xl border border-emerald-500/50 bg-slate-950 space-y-6 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>CAPTURE & UPLOAD CROP PHOTO</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Live AI Scan
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Snap or upload photos of your physical harvest to instantly list for merchants and buyers.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera Viewfinder / Photo Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] flex items-center justify-center group shadow-inner">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder overlay grid */}
                  <div className="absolute inset-4 border border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded self-start">
                      <span>SCAN TARGET: {selectedCrop.toUpperCase()}</span>
                    </div>
                    <div className="text-center text-[11px] font-mono text-emerald-300 bg-slate-950/70 py-1 rounded">
                      Align produce inside frame & click Snap
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured produce"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
                      <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider animate-pulse">
                        Scanning Color Uniformity & Ripeness...
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-emerald-400">
                    Active Photo Proof
                  </div>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Control Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cameraActive ? (
                <button
                  onClick={takeSnapshot}
                  className="col-span-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo Now</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 font-bold font-mono text-xs flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              )}

              {/* Direct File Picker */}
              <label className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => runAiQualityScan(selectedCrop, capturedImage)}
                className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan</span>
              </button>
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                Or pick a verified harvest photograph sample:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectPreset(preset)}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors text-xs flex items-center gap-2"
                  >
                    <img src={preset.url} alt={preset.crop} className="w-8 h-8 rounded object-cover shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-200 truncate">{preset.crop}</div>
                      <div className="text-[10px] text-slate-400 truncate">{preset.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis & Lot Metadata */}
          <div className="lg:col-span-6 space-y-4">
            {/* AI Preliminary Assessment Card */}
            {scanResult && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI PRELIMINARY COMPUTER VISION ASSESSMENT</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Grade: {scanResult.recommendedGrade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Uniformity</div>
                    <div className="font-bold text-emerald-400">{scanResult.colorUniformityPct}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Maturity</div>
                    <div className="font-bold text-emerald-400">{scanResult.maturityIndexPct}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Defects</div>
                    <div className="font-bold text-slate-300">{scanResult.visibleDefectsPct}%</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  {scanResult.assessmentNotes.slice(0, 2).map((note: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800 font-mono">
                  * Physical on-farm inspection required for final commercial grading.
                </div>
              </div>
            )}

            {/* Farm Produce Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Commodity</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    runAiQualityScan(e.target.value, capturedImage);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-emerald-500"
                >
                  {commodities.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Quantity (Quintals / 100kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Asking Rate (₹/Quintal)</label>
                <input
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Expected Harvest Date</label>
                <input
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Farmer Phone</label>
                <input
                  type="text"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-xs">Farm Location Address (For Merchant Visits)</label>
              <input
                type="text"
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="Farm Survey No., Village, Taluka, District"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            {/* Publish CTA */}
            <div className="pt-2">
              <button
                onClick={handlePublishLot}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black font-mono text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>PUBLISH LOT TO MERCHANTS & BUYERS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
