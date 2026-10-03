import React, { useState } from 'react';
import { Copy, Check, QrCode, ShieldCheck, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface QrCodeDisplayProps {
  transactionId: string;
  amount: number;
  farmerName: string;
  buyerName?: string;
  lotCode?: string;
  language: LanguageCode;
  size?: number;
}

// Generate a deterministic 25x25 QR matrix from transaction ID & amount
function generateQrMatrix(seedStr: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to place 7x7 Finder Pattern with 1px separator
  const placeFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isBorder || isInner;
      }
    }
  };

  // Top-left finder
  placeFinder(0, 0);
  // Top-right finder
  placeFinder(0, size - 7);
  // Bottom-left finder
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern around (size - 9, size - 9)
  const alignR = size - 7;
  const alignC = size - 7;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[alignR + r][alignC + c] = isBorder || isCenter;
    }
  }

  // Hash seed string to populate data modules
  let hash = 5381;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) + hash) + seedStr.charCodeAt(i);
  }

  // Fill data cells (avoiding finder patterns)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finders & separators
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlign = r >= size - 9 && r <= size - 5 && c >= size - 9 && c <= size - 5;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlign) {
        const bit = ((hash ^ (r * 31 + c * 17)) >>> ((r + c) % 16)) & 1;
        matrix[r][c] = bit === 1;
      }
    }
  }

  return matrix;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  transactionId,
  amount,
  farmerName,
  buyerName = 'Verified Merchant',
  lotCode = 'KM-LOT',
  language,
  size = 240
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  // Safe QR payload string (No banking credentials, no PIN, no OTP)
  const upiPayload = `upi://pay?pa=farmer.${encodeURIComponent(
    farmerName.toLowerCase().replace(/\s+/g, '.')
  )}@okaxis&pn=${encodeURIComponent(farmerName)}&am=${amount}&tr=${encodeURIComponent(
    transactionId
  )}&tn=${encodeURIComponent(`KrishiMarket Crop Settlement ${lotCode}`)}`;

  const matrix = generateQrMatrix(`${transactionId}-${amount}-${lotCode}`);
  const moduleSize = size / matrix.length;

  const handleCopyUpi = () => {
    try {
      const upiId = `farmer.${farmerName.toLowerCase().replace(/\s+/g, '.')}@okaxis`;
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      
      {/* High-Contrast Large QR Container */}
      <div 
        className="relative bg-white p-4 sm:p-5 rounded-3xl border-4 border-emerald-500 shadow-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.01]"
        style={{ width: size + 40, minHeight: size + 40 }}
      >
        {/* Crisp Scalable SVG QR Code */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-xl overflow-hidden block select-none"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * moduleSize}
                  y={r * moduleSize}
                  width={moduleSize + 0.3}
                  height={moduleSize + 0.3}
                  fill="#09131f"
                  rx={0.3}
                />
              ) : null
            )
          )}
        </svg>

        {/* Center Brand Badge with KrishiMarket Produce Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-xl">
            🌾
          </div>
        </div>

        {/* QR Scan Target Hint */}
        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            {transactionId}
          </span>
        </div>
      </div>

      {/* Safe UPI / Merchant Details Card */}
      <div className="w-full max-w-sm p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs">
        <div className="truncate">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            UPI ID ({farmerName.split(' ')[0]})
          </div>
          <div className="font-mono font-bold text-slate-900 dark:text-white truncate">
            {`farmer.${farmerName.toLowerCase().replace(/\s+/g, '.')}@okaxis`}
          </div>
        </div>

        <button
          onClick={handleCopyUpi}
          type="button"
          className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? t.copiedText : t.copyUpiId}</span>
        </button>
      </div>

      {/* Security & Non-Sensitive Data Assurance */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Safe QR: Does NOT request UPI PIN or banking passwords.</span>
      </div>
    </div>
  );
};
