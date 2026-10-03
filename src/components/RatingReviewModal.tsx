import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { RatingReview, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface RatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  transactionId: string;
  lotCode: string;
  targetName: string;
  targetRole: 'merchant' | 'farmer';
  onReviewSubmitted: (review: RatingReview) => void;
}

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  isOpen,
  onClose,
  language,
  transactionId,
  lotCode,
  targetName,
  targetRole,
  onReviewSubmitted
}) => {
  const t = translations[language];
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: RatingReview = {
      id: `rev-${Date.now()}`,
      transactionId,
      lotCode,
      reviewerId: 'f-ramesh-patil',
      reviewerName: 'Ramesh Patil',
      reviewerRole: 'farmer',
      targetId: `m-${targetName.toLowerCase().replace(/\s+/g, '-')}`,
      targetName,
      rating,
      reviewText: reviewText.trim() || 'Prompt payment release and accurate electronic weighing. Highly recommended buyer.',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      isVerifiedTrade: true
    };

    setSubmitted(true);
    setTimeout(() => {
      onReviewSubmitted(newReview);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center text-xl">
              ⭐
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">
                {t.giveRatingTitle}
              </h3>
              <p className="text-xs text-slate-800 font-medium">
                {targetName} • Lot {lotCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-950/10 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Thank you for your rating!
              </h4>
              <p className="text-xs text-slate-500">
                Your review helps build transparency and trust across the farmer network.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Selector */}
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Select 5-Star Rating
                </span>
                
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(rating)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-heading">
                  {rating === 5 ? '★★★★★ Outstanding Service (5.0)' : `${rating}.0 Stars`}
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Written Feedback / Review
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t.reviewPlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified completed transaction badge will be attached to this review.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>{t.btnSubmitReview}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
