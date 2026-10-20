import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  HelpCircle, 
  Globe, 
  Sun, 
  Moon, 
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  PhoneCall,
  RefreshCw,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { FarmerProfile, LanguageCode, UserRole } from '../types';
import { AuthService, OtpDeliveryMode } from '../services/authService';
import { UserTradeRole } from '../types/globalTrade';

interface LoginWelcomeScreenProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoginSuccess: (profile: FarmerProfile, role: UserRole) => void;
}

const DEMO_FARMER: FarmerProfile = {
  id: 'f-ramesh-patil',
  name: 'Ramesh Balasaheb Patil',
  phoneNumber: '+919823456789',
  village: 'Pimpalgaon Baswant',
  district: 'Nashik',
  state: 'Maharashtra',
  landSizeAcres: 4.5,
  soilType: 'Black Cotton',
  waterSource: 'Abundant (Canal/River)',
  preferredLanguage: 'mr',
  isVerified: true,
  avatarIcon: '👨‍🌾'
};

const DEMO_BUYER: FarmerProfile = {
  id: 'b-vikram-mehta',
  name: 'Vikram Mehta (FreshBasket Hypermarkets)',
  phoneNumber: '+919819044321',
  village: 'Vashi Wholesale Hub',
  district: 'Navi Mumbai',
  state: 'Maharashtra',
  landSizeAcres: 0,
  soilType: 'Red Loamy',
  waterSource: 'Medium (Borewell/Well)',
  preferredLanguage: 'en',
  isVerified: true,
  avatarIcon: '🏢'
};

export const LoginWelcomeScreen: React.FC<LoginWelcomeScreenProps> = ({
  language,
  setLanguage,
  theme,
  onToggleTheme,
  onLoginSuccess
}) => {
  const authService = AuthService.getInstance();

  // Mode detection
  const [deliveryMode, setDeliveryMode] = useState<OtpDeliveryMode>('test');
  const [isTestMode, setIsTestMode] = useState(true);

  useEffect(() => {
    try {
      const mode = authService.getDeliveryMode();
      setDeliveryMode(mode);
      setIsTestMode(mode === 'test');
    } catch {
      setDeliveryMode('test');
      setIsTestMode(true);
    }
  }, []);

  // Login Flow State
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE_COMPLETION'>('PHONE');
  const [phone, setPhone] = useState('9823456789');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // New Profile Onboarding State
  const [newFullName, setNewFullName] = useState('');
  const [newTradeRole, setNewTradeRole] = useState<UserTradeRole>('farmer');
  const [newOrganization, setNewOrganization] = useState('');
  const [newDistrict, setNewDistrict] = useState('Nashik');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'buyer') {
      setPhone('9819044321');
    } else {
      setPhone('9823456789');
    }
    setErrorMsg('');
    setInfoMsg('');
    setStep('PHONE');
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (phone.replace(/\D/g, '').length !== 10) {
      setErrorMsg(
        language === 'mr' 
          ? 'कृपया १० अंकांचा वैध मोबाईल नंबर टाका.' 
          : language === 'hi' 
          ? 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' 
          : 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.sendOtp({ phoneNumber: phone });
      setCooldown(res.cooldownSeconds || 30);
      setStep('OTP');
      setOtpDigits(['', '', '', '', '', '']);
      setInfoMsg(res.message);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Box Key Handling
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया ६ अंकांचा पूर्ण ओटीपी टाका.'
          : language === 'hi'
          ? 'कृपया 6-अंकीय पूर्ण ओटीपी दर्ज करें।'
          : 'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.verifyOtp({
        phoneNumber: phone,
        otpCode: fullCode
      });

      if (res.isNewUser) {
        setStep('PROFILE_COMPLETION');
        setInfoMsg('Mobile verified! Please set up your name and account role.');
      } else if (res.session) {
        const u = res.session.user;
        const mappedRole: UserRole = u.role === 'buyer' ? 'buyer' : u.role === 'fpo_admin' ? 'fpo' : 'farmer';
        const profile: FarmerProfile = {
          id: u.id,
          name: u.fullName,
          phoneNumber: u.phoneNumber,
          village: 'Cluster Hub',
          district: 'Nashik',
          state: 'Maharashtra',
          landSizeAcres: u.role === 'farmer' ? 5.0 : 0,
          soilType: 'Black Cotton',
          waterSource: 'Abundant (Canal/River)',
          preferredLanguage: u.preferredLanguage,
          isVerified: u.isVerified,
          avatarIcon: u.role === 'farmer' ? '👨‍🌾' : u.role === 'buyer' ? '🏢' : '🌾'
        };
        onLoginSuccess(profile, mappedRole);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Complete New Profile
  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    try {
      const session = authService.completeProfile({
        phoneNumber: phone,
        fullName: newFullName.trim(),
        role: newTradeRole,
        organizationName: newOrganization.trim() || undefined,
        preferredLanguage: language
      });

      const u = session.user;
      const mappedRole: UserRole = u.role === 'buyer' ? 'buyer' : u.role === 'fpo_admin' ? 'fpo' : 'farmer';
      const profile: FarmerProfile = {
        id: u.id,
        name: u.fullName,
        phoneNumber: u.phoneNumber,
        village: 'Cluster Center',
        district: newDistrict,
        state: 'Maharashtra',
        landSizeAcres: u.role === 'farmer' ? 4.0 : 0,
        soilType: 'Black Cotton',
        waterSource: 'Medium (Borewell/Well)',
        preferredLanguage: language,
        isVerified: u.isVerified,
        avatarIcon: u.role === 'farmer' ? '👨‍🌾' : '🏢'
      };
      onLoginSuccess(profile, mappedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete profile.');
    }
  };

  const handleQuickDemoLogin = (role: 'farmer' | 'buyer') => {
    if (role === 'buyer') {
      onLoginSuccess(DEMO_BUYER, 'buyer');
    } else {
      onLoginSuccess(DEMO_FARMER, 'farmer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0d131f]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl shadow-md text-white">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight font-heading text-slate-900 dark:text-white">
                KRISHI<span className="text-emerald-600 dark:text-emerald-400">MARKET</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                GLOBAL & DOMESTIC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Smart Farming. Better Markets. Export Intelligence.
            </p>
          </div>
        </div>

        {/* Right Action Tools: Language, Theme & Help */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs"
              aria-label="Select Language"
            >
              <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">English</option>
              <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">हिन्दी</option>
              <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">मराठी</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        
        {/* LEFT COLUMN: BRAND HERO & 4 CORE BENEFIT PILLARS */}
        <div className="w-full lg:w-7/12 space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
              <span>🌾</span>
              <span>Official AGMARKNET Rates & Verified Global Trade</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading leading-tight">
              Smart Farming.<br />
              <span className="text-emerald-600 dark:text-emerald-400">Better Markets. Global Reach.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              {language === 'mr'
                ? 'स्थानिक मंडीपासून ते जागतिक निर्यातीपर्यंत (UAE, सौदी) सर्व व्यवहार आणि थेट शेतकरी नफा एकाच ठिकाणी.'
                : language === 'hi'
                ? 'स्थानीय मंडियों से लेकर वैश्विक निर्यात (UAE, खाड़ी देश) तक सीधा पारदर्शी व्यापार और प्रामाणिक भाव।'
                : 'From local APMC mandis to international export buyers (UAE, Gulf), trade directly with transparent net returns.'}
            </p>
          </div>

          {/* 4 CORE VALUE PILLARS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. WHAT TO GROW */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5 hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                🌱
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-heading">
                  {language === 'mr' ? 'काय पेरावे?' : language === 'hi' ? 'क्या बोएं?' : 'WHAT TO GROW'}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'AI पीक मार्गदर्शन व माती परीक्षण' : language === 'hi' ? 'AI फसल सलाह व मिट्टी अनुरूपता' : 'AI-based crop insights'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'माती व हवामानानुसार नफ्याचे पीक' : language === 'hi' ? 'मिट्टी व मौसम अनुसार अधिकतम मुनाफा' : 'Best crops for your soil & season'}
                </div>
              </div>
            </div>

            {/* 2. WHEN TO SELL */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5 hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0">
                📈
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider font-heading">
                  {language === 'mr' ? 'केव्हा विकावे?' : language === 'hi' ? 'कब बेचें?' : 'WHEN TO SELL'}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'मंडी भाव व तेजी-मंदी अंदाज' : language === 'hi' ? 'मंडी भाव व तेजी-मंदी रुझान' : 'Market trend insights'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'विक्री की साठवण? स्पष्ट निर्णय' : language === 'hi' ? 'बेचें या रखें? स्पष्ट निर्णय' : 'Sell, Store, or Monitor guidance'}
                </div>
              </div>
            </div>

            {/* 3. GLOBAL TRADE (UAE & BEYOND) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5 hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                🚢
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-heading">
                  {language === 'mr' ? 'ग्लोबल व्यापार' : language === 'hi' ? 'ग्लोबल व्यापार' : 'GLOBAL TRADE'}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'UAE/आखाती देशांना थेट कांदा निर्यात' : language === 'hi' ? 'UAE/खाड़ी देशों को सीधा प्याज निर्यात' : 'Direct Exports (FOB / CIF)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'सत्यापित खरेदीदार व निव्वळ नफा कॅल्क्युलेटर' : language === 'hi' ? 'सत्यापित खरीदार व शुद्ध मुनाफा कैलकुलेटर' : 'Verified buyers & Net Return Calculator'}
                </div>
              </div>
            </div>

            {/* 4. HOW TO DEAL */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5 hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                🤝
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider font-heading">
                  {language === 'mr' ? 'व्यवहार कसा करावा?' : language === 'hi' ? 'सौदा कैसे करें?' : 'HOW TO DEAL'}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'तपासणी, ऑफर्स व QR पेमेंट' : language === 'hi' ? 'सत्यापन, ऑफर्स व QR पेमेंट' : 'Verification + offers + payment'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'थेट बँक खात्यात सुरक्षित पैसे' : language === 'hi' ? 'सीधे खाते में सुरक्षित ट्रैकिंग' : 'Instant live deal progress'}
                </div>
              </div>
            </div>

          </div>

          {/* Simple Trust Statements */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Official AGMARKNET / Ministry of Agriculture data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Direct Linkage with Zero Hidden Middlemen</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SECURE PHONE OTP LOGIN CARD */}
        <div className="w-full lg:w-5/12 max-w-md">
          
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            
            {/* Mode Banner: Required strictly for Test Mode */}
            {isTestMode && (
              <div className="py-2 px-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>TEST LOGIN MODE</span>
                </span>
                <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                  OTP: 123456
                </span>
              </div>
            )}

            {/* Card Header & Role Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {step === 'PROFILE_COMPLETION'
                    ? (language === 'mr' ? 'प्रोफाइल पूर्ण करा' : language === 'hi' ? 'प्रोफाइल पूर्ण करें' : 'Complete Profile')
                    : (language === 'mr' ? 'लॉगिन करा' : language === 'hi' ? 'लॉगिन करें' : 'Farmer & Buyer Login')}
                </h2>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  OTP Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {step === 'PHONE' && (
                  language === 'mr' 
                    ? 'आपला १०-अंकी मोबाईल नंबर टाका आणि ओटीपी मिळवा' 
                    : language === 'hi' 
                    ? 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें और ओटीपी पाएं' 
                    : 'Enter your 10-digit mobile number to receive secure OTP'
                )}
                {step === 'OTP' && (
                  language === 'mr'
                    ? `+91 ${phone} वर पाठवलेला ६-अंकी कोड टाका`
                    : language === 'hi'
                    ? `+91 ${phone} पर भेजा गया 6-अंकीय कोड दर्ज करें`
                    : `Enter the 6-digit code sent to +91 ${phone}`
                )}
                {step === 'PROFILE_COMPLETION' && (
                  language === 'mr'
                    ? 'आपले नाव आणि व्यापार भूमिका निवडा'
                    : language === 'hi'
                    ? 'अपना नाम और व्यापार भूमिका चुनें'
                    : 'Enter your details to finalize your trade account'
                )}
              </p>

              {/* Role Selection Tabs (Only on Phone step) */}
              {step === 'PHONE' && (
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('farmer')}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👨‍🌾</span>
                    <span>{language === 'mr' ? 'शेतकरी' : language === 'hi' ? 'किसान' : 'Farmer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('buyer')}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'buyer'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🏢</span>
                    <span>{language === 'mr' ? 'खरेदीदार' : language === 'hi' ? 'खरीदार' : 'Buyer'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* STEP 1: PHONE NUMBER INPUT */}
            {step === 'PHONE' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{language === 'mr' ? 'मोबाईल नंबर' : language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
                    <span className="text-[11px] text-slate-400">10 Digits</span>
                  </label>
                  
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9823456789"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      autoFocus
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>{isSubmitting ? 'Sending Code...' : (language === 'mr' ? 'ओटीपी पाठवा' : language === 'hi' ? 'ओटीपी भेजें' : 'SEND OTP')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP BOXES */}
            {step === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {language === 'mr' ? '६-अंकी ओटीपी टाका' : language === 'hi' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setStep('PHONE'); setErrorMsg(''); setInfoMsg(''); }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handlePasteOtp}
                        className="w-full h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Valid for 5 mins</span>
                    {cooldown > 0 ? (
                      <span className="font-mono text-slate-400">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </div>

                {infoMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{infoMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || otpDigits.join('').length !== 6}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>{isSubmitting ? 'Verifying Code...' : (language === 'mr' ? 'ओटीपी पडताळा' : language === 'hi' ? 'ओटीपी सत्यापित करें' : 'VERIFY & LOGIN')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 3: NEW USER PROFILE COMPLETION */}
            {step === 'PROFILE_COMPLETION' && (
              <form onSubmit={handleCompleteProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name / नाव
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Ramesh Balasaheb Patil"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trade Role / भूमिका
                  </label>
                  <select
                    value={newTradeRole}
                    onChange={(e) => setNewTradeRole(e.target.value as UserTradeRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="farmer">Farmer (शेतकरी / किसान)</option>
                    <option value="fpo_admin">FPO / Farmer Producer Company</option>
                    <option value="buyer">Institutional Domestic Buyer (व्यापारी)</option>
                    <option value="exporter">International Exporter / Broker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Organization / Farm Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newOrganization}
                    onChange={(e) => setNewOrganization(e.target.value)}
                    placeholder="e.g. Patil Organic Farms or Fresh Agro FPO"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    District / जिल्हा
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="e.g. Nashik, Pune, Ahmednagar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>COMPLETE & ENTER PLATFORM</span>
                </button>
              </form>
            )}

            {/* Quick Demo 1-Click Access for Evaluation */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                1-Click Quick Demo Access
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('farmer')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>👨‍🌾</span>
                    <span>Farmer: Ramesh Patil (Nashik Onion)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-100 font-bold">
                    Demo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('buyer')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>Buyer: Vikram Mehta (FreshBasket)</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-200 font-bold">
                    Demo
                  </span>
                </button>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure • Rate-Limited OTP • Single-Use Security</span>
            </div>

          </div>

        </div>

      </main>

      {/* Help / Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  KrishiMarket Farmer Help & Support
                </h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>KrishiMarket</strong> is an AI-powered physical produce market-linkage platform connecting farmers directly to verified institutional buyers and APMC mandi rates.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Kisan Call Centre Toll-Free Helpline:</span>
                </div>
                <div className="text-sm font-black font-mono">1800-180-1551 (6:00 AM - 10:00 PM)</div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">How to use demo login:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                  <li>Click <strong>Farmer (Ramesh Patil)</strong> for the farmer dashboard & QR payment.</li>
                  <li>Click <strong>Buyer (Vikram Mehta)</strong> to test buyer offers & marketplace bidding.</li>
                  <li>In Test OTP mode, entering your number generates test code <strong>123456</strong>.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 KrishiMarket. All rights reserved. Built for Indian Farmers & Merchants.
      </footer>

    </div>
  );
};
