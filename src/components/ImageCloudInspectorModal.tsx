import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Cloud, 
  History, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { CloudImageRecord, CloudImageService } from '../services/cloudImageService';
import { LanguageCode } from '../types';

interface ImageCloudInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageRecord: CloudImageRecord;
  language?: LanguageCode;
  onTriggerChangeImage?: () => void;
  onRequestRetake?: () => void;
  canEditImage?: boolean;
  canRetakePhoto?: boolean;
}

export const ImageCloudInspectorModal: React.FC<ImageCloudInspectorModalProps> = ({
  isOpen,
  onClose,
  imageRecord,
  language = 'en',
  onTriggerChangeImage,
  onRequestRetake,
  canEditImage = true,
  canRetakePhoto
}) => {
  const allowEdit = canRetakePhoto !== undefined ? canRetakePhoto : canEditImage;
  const triggerRetake = onRequestRetake || onTriggerChangeImage;
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(imageRecord.cloudUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(1, prev - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  const q = imageRecord.qualityAssessment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
      
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                  Verified Crop Produce Photograph
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  {imageRecord.storageType === 'CLOUDINARY_CDN' ? 'CDN Synced' : 'Cloud Vault Permanent'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Asset ID: {imageRecord.id} • Lot: {imageRecord.lotCode || 'Direct Scan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allowEdit && triggerRetake && (
              <button
                onClick={triggerRetake}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                title="Retake or change this photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change / Retake Photo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Two Columns on large screens */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Image Canvas with Zoom & Overlay */}
          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[320px] select-none">
            
            <div className="relative overflow-hidden rounded-2xl w-full h-full flex items-center justify-center max-h-[460px]">
              <img
                src={imageRecord.cloudUrl}
                alt={imageRecord.commodity}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-w-full max-h-[420px] object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
              />

              {/* Real Crop Framing / AI Quality Measurement Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <div className="w-40 h-40 border border-emerald-400/40 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Watermark Tag */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white font-mono border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>KM Provenance Verifiable Hash</span>
              </div>
            </div>

            {/* Floating Zoom Controls Bar */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-white shadow-lg">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-white"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>

          </div>

          {/* Right Column: Metadata, AI Computer Vision Scan & Cloud Links */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Commodity & Lot Specs */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Commodity & Variety
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  {imageRecord.commodity}
                </h4>
                {imageRecord.variety && (
                  <p className="text-xs text-slate-500">{imageRecord.variety}</p>
                )}
              </div>

              {/* Geotag & Time Stamps */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{imageRecord.farmLocation}</span>
                </div>
                {imageRecord.coordinates && (
                  <div className="text-[11px] text-slate-400 font-mono pl-6">
                    GPS: {imageRecord.coordinates.lat}° N, {imageRecord.coordinates.lng}° E
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Captured: <strong>{imageRecord.capturedAt}</strong></span>
                </div>
              </div>

              {/* AI Quality Computer Vision Scores */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Computer Vision Scan</span>
                  </div>
                  <span className="text-xs font-black font-mono bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {q.aiGrade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Uniformity</span>
                    <strong className="text-emerald-600 font-mono text-sm">{q.colorUniformityPct}%</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Size</span>
                    <strong className="text-slate-800 dark:text-slate-100 font-mono text-sm">{q.averageDiameterMm} mm</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Defects</span>
                    <strong className="text-emerald-600 font-mono text-sm">{q.visibleDefectsPct}%</strong>
                  </div>
                </div>

                {q.assessmentNotes && q.assessmentNotes.length > 0 && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                    {q.assessmentNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Version & History Section */}
              {imageRecord.historicalVersions && imageRecord.historicalVersions.length > 0 && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Photo Version History (Version {imageRecord.version})</span>
                  </button>

                  {showHistory && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      {imageRecord.historicalVersions.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Version {h.version} ({h.capturedAt})</span>
                          <span className="font-semibold text-slate-400">{h.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Cloud Sharing & Copy Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Cloud Image Link Copied!' : 'Copy Permanent Cloud Image Link'}</span>
              </button>

              <div className="text-[10px] text-center text-slate-400">
                Both farmer and merchants can access this verifiable photo anytime across all devices.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
