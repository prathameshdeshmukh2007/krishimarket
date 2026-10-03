import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  Sprout, 
  Droplets, 
  CheckCircle2, 
  X, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { FarmerProfile, LanguageCode, SoilType, WaterAvailabilityType } from '../types';
import { translations } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLoginSuccess: (profile: FarmerProfile) => void;
  currentProfile: FarmerProfile | null;
}

const SAMPLE_PROFILES: FarmerProfile[] = [
  {
    id: 'f-ramesh-patil',
    name: 'Ramesh Balasaheb Patil',
    phoneNumber: '9823456789',
    village: 'Pimpalgaon Baswant',
    district: 'Nashik, Maharashtra',
    state: 'Maharashtra',
    landSizeAcres: 4.5,
    soilType: 'Black Cotton',
    waterSource: 'Abundant (Canal/River)',
    preferredLanguage: 'mr',
    isVerified: true,
    avatarIcon: '👨‍🌾'
  },
  {
    id: 'f-suresh-shinde',
    name: 'Suresh Tukaram Shinde',
    phoneNumber: '9422088123',
    village: 'Dindori',
    district: 'Nashik, Maharashtra',
    state: 'Maharashtra',
    landSizeAcres: 6.0,
    soilType: 'Red Loamy',
    waterSource: 'Medium (Borewell/Well)',
    preferredLanguage: 'mr',
    isVerified: true,
    avatarIcon: '🚜'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  currentProfile
}) => {
  const t = translations[language];
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [phone, setPhone] = useState('9823456789');
  const [password, setPassword] = useState('1234');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Nashik, Maharashtra');
  const [landSize, setLandSize] = useState('4.0');
  const [soilType, setSoilType] = useState<SoilType>('Black Cotton');
  const [waterSource, setWaterSource] = useState<WaterAvailabilityType>('Abundant (Canal/River)');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (phone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया वैध १०-अंकी मोबाईल नंबर टाका.' : language === 'hi' ? 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage(language === 'mr' ? 'पिन किमान ४ अंकांचा असावा.' : language === 'hi' ? 'पिन कम से कम 4 अंकों का होना चाहिए।' : 'PIN must be at least 4 digits.');
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMessage(language === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा.' : language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your name.');
        return;
      }

      const newProfile: FarmerProfile = {
        id: `f-${Date.now()}`,
        name: name.trim(),
        phoneNumber: phone,
        village: village.trim() || 'Village Hub',
        district: district.trim() || 'Nashik, Maharashtra',
        state: 'Maharashtra',
        landSizeAcres: parseFloat(landSize) || 3.0,
        soilType,
        waterSource,
        preferredLanguage: language,
        isVerified: true,
        avatarIcon: '👨‍🌾'
      };

      try {
        localStorage.setItem('amip_current_farmer', JSON.stringify(newProfile));
      } catch (err) {
        console.warn(err);
      }

      setSuccessMessage(t.authSuccessRegister);
      setTimeout(() => {
        onLoginSuccess(newProfile);
        onClose();
      }, 700);
    } else {
      // Login mode: check existing or sample
      const matched = SAMPLE_PROFILES.find(p => p.phoneNumber === phone) || {
        id: `f-${phone.slice(-4)}`,
        name: name || 'Ramesh Balasaheb Patil',
        phoneNumber: phone,
        village: village || 'Pimpalgaon Baswant',
        district: district || 'Nashik, Maharashtra',
        state: 'Maharashtra',
        landSizeAcres: parseFloat(landSize) || 4.5,
        soilType: soilType || 'Black Cotton',
        waterSource: waterSource || 'Abundant (Canal/River)',
        preferredLanguage: language,
        isVerified: true,
        avatarIcon: '👨‍🌾'
      };

      try {
        localStorage.setItem('amip_current_farmer', JSON.stringify(matched));
      } catch (err) {
        console.warn(err);
      }

      setSuccessMessage(t.authSuccessLogin);
      setTimeout(() => {
        onLoginSuccess(matched);
        onClose();
      }, 700);
    }
  };

  const handleQuickDemo = (profile: FarmerProfile) => {
    setPhone(profile.phoneNumber);
    setPassword('1234');
    onLoginSuccess(profile);
    try {
      localStorage.setItem('amip_current_farmer', JSON.stringify(profile));
    } catch (err) {
      console.warn(err);
    }
    setSuccessMessage(t.authSuccessLogin);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
              👨‍🌾
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">
                {isRegisterMode ? t.authTitleRegister : t.authTitleLogin}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {t.farmerAppTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Demo Switcher */}
          {!isRegisterMode && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Test Farmer Profiles (1-Click Login):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROFILES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickDemo(p)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-left hover:scale-[1.02] transition-transform text-xs"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <span>{p.avatarIcon}</span>
                      <span>{p.name.split(' ')[0]} ({p.village})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.landSizeAcres} Acres • {p.soilType} Soil
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.authMobileLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={t.authMobilePlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* If Register: Additional Farmer Details */}
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.authNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.authNamePlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.authVillageLabel}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder={t.authVillagePlaceholder}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.authLandSizeLabel}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.authSoilTypeLabel}
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value as SoilType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Black Cotton">Black Cotton Soil (काळी माती)</option>
                      <option value="Red Loamy">Red Loamy Soil (तांबडी माती)</option>
                      <option value="Sandy Loam">Sandy Loam Soil (रेताड माती)</option>
                      <option value="Clay">Clay Soil (चिकण माती)</option>
                      <option value="Alluvial">Alluvial Soil (गाळाची माती)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.authWaterSourceLabel}
                    </label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value as WaterAvailabilityType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Abundant (Canal/River)">Abundant (Canal / River / Ample Well)</option>
                      <option value="Medium (Borewell/Well)">Medium (Borewell / Seasonal Well)</option>
                      <option value="Low (Rainfed/Drip Only)">Low (Rainfed / Drip-only)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* PIN / Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.authPasswordLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.authPasswordPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>{isRegisterMode ? t.authSubmitRegister : t.authSubmitLogin}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isRegisterMode ? t.authSwitchToLogin : t.authSwitchToRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
