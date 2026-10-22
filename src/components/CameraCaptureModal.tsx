import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  X,
  Cloud,
  Check,
  SwitchCamera,
  Layers,
  Scale
} from 'lucide-react';
import { Commodity, CropLot, LanguageCode, AIAssessment } from '../types';
import { performCropPhotoAiScan } from '../services/aiEngine';
import { CloudImageService } from '../services/cloudImageService';
import { AiChatService } from '../services/aiChatService';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  language: LanguageCode;
  onLotCreated: (newLot: CropLot) => void;
  targetLotToUpdate?: CropLot | null;
  targetLot?: CropLot | null;
  onLotPhotoUpdated?: (updatedLot: CropLot) => void;
  onPhotoUpdated?: (updatedLot: CropLot) => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Nashik Garwa Red Onion (Export Lot)',
    crop: 'Onion',
    variety: 'Nashik Garwa Red Onion (45-55mm Export Grade)',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=1200&auto=format&fit=crop&q=90',
    location: 'Pimpalgaon Baswant, Nashik',
    defaultPrice: 2750
  },
  {
    name: 'Fresh Red Tomatoes (Vine Harvest)',
    crop: 'Tomato',
    variety: 'Hybrid Shivam (Grade A+)',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&auto=format&fit=crop&q=90',
    location: 'Pimpalgaon Baswant, Nashik',
    defaultPrice: 2550
  },
  {
    name: 'Thompson Seedless Grapes (Vineyard Export)',
    crop: 'Grapes (Thompson / Sonaka)',
    variety: 'Thompson Seedless Table Grapes',
    url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1200&auto=format&fit=crop&q=90',
    location: 'Dindori, Nashik',
    defaultPrice: 8400
  },
  {
    name: 'Green Polyhouse Capsicum',
    crop: 'Capsicum (Shimla Mirch)',
    variety: 'Indra Polyhouse Green Capsicum',
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=1200&auto=format&fit=crop&q=90',
    location: 'Baramati, Pune',
    defaultPrice: 3900
  }
];

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  commodities,
  language,
  onLotCreated,
  targetLotToUpdate,
  targetLot,
  onLotPhotoUpdated,
  onPhotoUpdated
}) => {
  const activeLotToUpdate = targetLot || targetLotToUpdate;
  const isUpdateMode = Boolean(activeLotToUpdate);
  const notifyUpdated = onPhotoUpdated || onLotPhotoUpdated;
  const cloudService = CloudImageService.getInstance();

  // Camera State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string>(
    activeLotToUpdate?.photos[0] || PRESET_SAMPLE_PHOTOS[0].url
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<AIAssessment | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);

  // Form Fields
  const [selectedCrop, setSelectedCrop] = useState<string>(activeLotToUpdate?.commodity || 'Onion');
  const [variety, setVariety] = useState<string>(activeLotToUpdate?.variety || 'Nashik Garwa Red Onion');
  const [quantity, setQuantity] = useState<number>(activeLotToUpdate?.quantityQuintals || 75);
  const [district, setDistrict] = useState<string>(activeLotToUpdate?.district || 'Nashik');
  const [village, setVillage] = useState<string>(activeLotToUpdate?.village || 'Pimpalgaon Baswant');
  const [farmAddress, setFarmAddress] = useState<string>(
    activeLotToUpdate?.farmAddress || 'Survey No. 42, Pimpalgaon-Vani Road, Nashik, Maharashtra'
  );
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>(
    activeLotToUpdate?.expectedHarvestDate || new Date().toISOString().split('T')[0]
  );
  const [expectedPrice, setExpectedPrice] = useState<number>(activeLotToUpdate?.expectedPricePerQ || 2750);
  const [farmerPhone, setFarmerPhone] = useState<string>(activeLotToUpdate?.farmerPhone || '+91 98234 56789');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when activeLotToUpdate changes
  useEffect(() => {
    if (activeLotToUpdate) {
      setSelectedCrop(activeLotToUpdate.commodity);
      setVariety(activeLotToUpdate.variety);
      setQuantity(activeLotToUpdate.quantityQuintals);
      setDistrict(activeLotToUpdate.district);
      setVillage(activeLotToUpdate.village);
      setFarmAddress(activeLotToUpdate.farmAddress || '');
      setExpectedPrice(activeLotToUpdate.expectedPricePerQ);
      setFarmerPhone(activeLotToUpdate.farmerPhone);
      if (activeLotToUpdate.photos[0]) {
        setCapturedImage(activeLotToUpdate.photos[0]);
      }
    }
  }, [activeLotToUpdate]);

  // Start Camera with selected facing mode
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    stopCamera();
    setCameraActive(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: mode }, 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play warning:', playErr);
          }
        }
      } else {
        setCameraError('Camera API is not supported in this browser. Please use "Device Camera" below or upload a photo.');
        setCameraActive(false);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setCameraError(isDenied 
        ? 'Camera permission denied. Please allow camera permissions in browser, or click "Device Camera" below.'
        : `Camera could not be opened (${err.message || 'Device in use'}). Use "Device Camera" or upload a file.`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  // Capture frame from video
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setCapturedImage(dataUrl);
        stopCamera();
        runAiQualityScan(selectedCrop, dataUrl);
      }
    }
  };

  // File Upload Handler (also used by direct native camera capture)
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

  // Run Real Multimodal AI Quality Scan using Google Gemini Vision API
  const runAiQualityScan = async (crop: string, imgUrl: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const aiService = AiChatService.getInstance();
      const assessment = await aiService.analyzeCropImageWithGemini(imgUrl, crop, language);
      setScanResult(assessment);
    } catch (err) {
      console.warn('AI Vision scan failed, falling back to local agronomist engine:', err);
      const fallback = performCropPhotoAiScan(crop, imgUrl);
      setScanResult(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAiQualityScan(selectedCrop, capturedImage);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Save / Update Handler
  const handleConfirmSave = async () => {
    setIsSavingCloud(true);
    try {
      const assessment = scanResult || performCropPhotoAiScan(selectedCrop, capturedImage);

      // Case A: Update existing lot photo
      if (isUpdateMode && activeLotToUpdate) {
        await cloudService.updateLotImage(
          activeLotToUpdate.id,
          capturedImage,
          'Farmer uploaded updated produce photograph'
        );

        const updatedLot: CropLot = {
          ...activeLotToUpdate,
          photos: [capturedImage, ...activeLotToUpdate.photos.filter(p => p !== capturedImage)],
          aiPreliminaryGrade: assessment.recommendedGrade,
          aiAssessment: assessment
        };

        if (notifyUpdated) {
          notifyUpdated(updatedLot);
        }
        onClose();
        return;
      }

      // Case B: Create new lot with persistent Cloud Storage
      const lotCode = `AGRI-2026-NASH-${Math.floor(1000 + Math.random() * 9000)}`;
      const cloudRecord = await cloudService.uploadToCloud({
        imageDataUrl: capturedImage,
        commodity: selectedCrop,
        variety,
        lotCode,
        farmLocation: `${village}, ${district}, Maharashtra`,
        uploaderName: 'Prathamesh (Verified Farmer)'
      });

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
        farmCoordinates: { lat: 20.1719, lng: 73.9856 },
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
        photos: [cloudRecord.cloudUrl],
        offersCount: 0,
        createdAt: 'Just now',
        passportEvents: [
          {
            id: `ev-${Date.now()}-1`,
            title: 'Verified Photo Uploaded to Cloud Vault',
            description: `Farmer photographed ${quantity} Quintals of ${selectedCrop} (${variety}). Permanent cloud record #${cloudRecord.id} generated with GPS stamp.`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            actor: 'Farmer (Direct Snap & Shot)',
            category: 'CREATION',
            status: 'COMPLETED',
            verifiedHash: '0x' + Math.random().toString(16).substring(2, 10)
          }
        ]
      };

      onLotCreated(newLot);
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Error uploading to cloud'}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans text-slate-100">
      <div className="w-full max-w-4xl p-6 rounded-3xl border border-emerald-500/50 bg-slate-950 space-y-6 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  {isUpdateMode ? `Change / Update Lot Photo (${activeLotToUpdate?.lotCode})` : 'Accurate Crop Snap & Cloud Vault'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Cloud Persistent
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real high-resolution image capture. Both farmers and merchants can inspect the verified clicked photo anytime.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Camera Viewfinder / Preview */}
          <div className="lg:col-span-6 space-y-3">
            
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] flex items-center justify-center shadow-inner">
              {/* Live Video Element — always mounted so videoRef.current is never null */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {/* Viewfinder Overlay when Camera is Active */}
              {cameraActive && (
                <>
                  <div className="absolute inset-4 border border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/85 px-2 py-0.5 rounded self-start">
                      <span>ALIGN {selectedCrop.toUpperCase()} BULB / FRUIT</span>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 border-2 border-emerald-400/60 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      </div>
                    </div>

                    <div className="text-center text-[11px] font-mono text-emerald-300 bg-slate-950/85 py-1 rounded">
                      45–55mm Export Calibration Guide
                    </div>
                  </div>

                  {/* Switch Front/Back Camera */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-white border border-slate-700 hover:bg-slate-800"
                    title="Switch Camera (Front/Rear)"
                  >
                    <SwitchCamera className="w-4 h-4 text-emerald-400" />
                  </button>

                  {/* Cancel Live Camera */}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="absolute top-3 left-3 px-2 py-1 rounded-xl bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800 flex items-center gap-1 text-[11px] font-mono"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}

              {/* Image Preview when Camera is Inactive */}
              {!cameraActive && (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured produce"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                      <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
                      <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider animate-pulse">
                        Analyzing Produce with Google Gemini Multimodal Vision API...
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono">
                        Diagnosing diameter, color uniformity, diseases & treatment dosages
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Verified Produce Image</span>
                  </div>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Native Device Camera Input (opens phone camera directly) */}
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Action Bar: Snap, Retake & File Upload */}
            <div className="space-y-2">
              {cameraActive ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    <Camera className="w-4 h-4" />
                    <span>CLICK PHOTO NOW</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Camera</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Option 1: Live Webcam / Browser Camera */}
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="py-2.5 px-2 rounded-xl bg-emerald-950/70 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300 font-bold font-mono text-[11px] flex items-center justify-center gap-1.5 shadow"
                    title="Open live browser camera feed"
                  >
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                    <span>Live Camera</span>
                  </button>

                  {/* Option 2: Direct Phone Camera */}
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 font-bold font-mono text-[11px] flex items-center justify-center gap-1.5 shadow"
                    title="Directly trigger device camera app"
                  >
                    <Camera className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span>Phone Camera</span>
                  </button>

                  {/* Option 3: Upload from Gallery / Disk */}
                  <label className="py-2.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold font-mono text-[11px] flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Option 4: AI Rescan */}
                  <button
                    type="button"
                    onClick={() => runAiQualityScan(selectedCrop, capturedImage)}
                    className="py-2.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>Rescan AI</span>
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                Or select high-resolution benchmark harvest photo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors text-xs flex items-center gap-2"
                  >
                    <img src={preset.url} alt={preset.crop} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-200 truncate">{preset.crop}</div>
                      <div className="text-[10px] text-slate-400 truncate">{preset.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Analysis & Publishing Form */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* AI Computer Vision & Agronomist Diagnostic Score Card */}
            {scanResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>AI COMPUTER VISION QUALITY SCORE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                      {scanResult.providerUsed === 'live_gemini_vision' ? '⚡ Google Gemini Vision' : 'AI Agronomist Engine'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-black shadow">
                      {scanResult.recommendedGrade}
                    </span>
                  </div>
                </div>

                {/* 4-Metric Physical Profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Color Uniformity</div>
                    <div className="font-bold text-emerald-400">{scanResult.colorUniformityPct}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Maturity Score</div>
                    <div className="font-bold text-emerald-400">{scanResult.maturityIndexPct}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Visible Defects</div>
                    <div className="font-bold text-amber-400">{scanResult.visibleDefectsPct}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Avg Diameter</div>
                    <div className="font-bold text-cyan-300 truncate">{scanResult.averageDiameterMm || '45-55 mm'}</div>
                  </div>
                </div>

                {/* Pathology & Disease Diagnosis */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>DIAGNOSIS & HEALTH STATUS:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pl-5">
                    {scanResult.diseaseDiagnosis || 'Healthy crop lot with clean skin integrity and no visible pathogen marks.'}
                  </p>
                </div>

                {/* Recommended Curative & Preventive Dosages */}
                {scanResult.treatmentRecommendation && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>RECOMMENDED TREATMENT & SPRAY DOSAGES:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pl-5">
                      {scanResult.treatmentRecommendation}
                    </p>
                  </div>
                )}

                {/* Proper Agronomist Evaluation & Strategy */}
                {scanResult.properInfo && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-300">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>PROPER INFO & COMMERCIAL STRATEGY:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pl-5">
                      {scanResult.properInfo}
                    </p>
                  </div>
                )}

                {/* Visual Observations Notes */}
                {scanResult.assessmentNotes && scanResult.assessmentNotes.length > 0 && (
                  <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Key Observations:
                    </div>
                    {scanResult.assessmentNotes.slice(0, 3).map((note: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Form Fields (Editable for New Lot, or Confirmation for Updated Photo) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Commodity</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    runAiQualityScan(e.target.value, capturedImage);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-emerald-500"
                >
                  {commodities.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Variety / Grade Spec</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Quantity (Quintals / 100kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Asking Price (₹/Quintal)</label>
                <input
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-xs">Farm / Packhouse Location</label>
              <input
                type="text"
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="Survey No., Village, Taluka, District"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            {/* Cloud Storage Notice */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Image will be permanently stored with geotag and timestamp for merchant viewing anytime.
              </span>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleConfirmSave}
              disabled={isSavingCloud}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black font-heading text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSavingCloud 
                  ? 'Saving to Cloud Vault...' 
                  : isUpdateMode 
                  ? 'UPDATE PHOTO & SYNC CLOUD' 
                  : 'PUBLISH LOT WITH VERIFIED PHOTO'}
              </span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
