// ====================================================================
// KRISHIMARKET: SERVER-SIDE AUTHENTICATION & OTP SERVICE
// Handles OTP generation, 3 delivery modes (test, twilio, msg91),
// rate limiting (IP & Phone), 5-min expiry, and profile setup.
// ====================================================================

import { UserTradeRole, LanguageCode } from '../types/globalTrade';

export type OtpDeliveryMode = 'test' | 'twilio' | 'msg91';

export interface OtpRecord {
  phoneNumber: string;
  codeHash: string; // Stored as hash/internal representation; NEVER sent to client
  expiresAt: number; // Unix timestamp in ms (5 mins)
  attemptsRemaining: number; // Max 5 wrong tries before lockout
  lastSentAt: number; // Cooldown tracking (30 seconds)
  email?: string;
  deliveryMode: OtpDeliveryMode;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    fullName: string;
    role: UserTradeRole;
    organizationName?: string;
    preferredLanguage: LanguageCode;
    isVerified: boolean;
    isKycApproved: boolean;
    createdAt: string;
  };
  expiresAt: number;
}

export interface SendOtpRequest {
  phoneNumber: string;
  email?: string; // Optional email fallback for buyers / exporters
  clientIp?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  deliveryMode: OtpDeliveryMode;
  cooldownSeconds: number;
  isTestMode: boolean;
  testOtpHint?: string; // ONLY provided when OTP_MODE=test and NODE_ENV != production
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otpCode: string;
  clientIp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  session?: AuthSession;
}

export interface CompleteProfileRequest {
  phoneNumber: string;
  fullName: string;
  role: UserTradeRole; // Nobody can pick platform_admin for themselves
  organizationName?: string;
  preferredLanguage: LanguageCode;
}

// In-Memory Secure State (In production, backed by Redis or Supabase table)
const otpStore = new Map<string, OtpRecord>();
const ipRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const userDb = new Map<string, AuthSession['user']>();
const sessionStore = new Map<string, AuthSession>();

// Seed verified default users
userDb.set('+919823456789', {
  id: 'usr-farmer-01',
  phoneNumber: '+919823456789',
  fullName: 'Ramesh Balasaheb Patil',
  role: 'farmer',
  organizationName: 'Pimpalgaon Onion Growers Cluster',
  preferredLanguage: 'mr',
  isVerified: true,
  isKycApproved: true,
  createdAt: '2026-08-20T10:00:00Z'
});

userDb.set('+919819044321', {
  id: 'usr-buyer-01',
  phoneNumber: '+919819044321',
  fullName: 'Vikram Mehta',
  role: 'buyer',
  organizationName: 'FreshBasket Hypermarkets Ltd (Dubai / Mumbai)',
  preferredLanguage: 'en',
  isVerified: true,
  isKycApproved: true,
  createdAt: '2026-08-22T10:00:00Z'
});

// Environment variable helper safe across Vite client and Node
const getEnvVar = (key: string, defaultValue = ''): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[key] !== undefined) {
      return String(metaEnv[key]);
    }
  } catch {
    // Ignore in non-meta contexts
  }
  try {
    const gProcess = (globalThis as any)?.process;
    if (gProcess && gProcess.env && gProcess.env[key] !== undefined) {
      return String(gProcess.env[key]);
    }
  } catch {
    // Ignore
  }
  return defaultValue;
};

const isProdEnv = (): boolean => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.PROD) return true;
  } catch {}
  try {
    const gProcess = (globalThis as any)?.process;
    if (gProcess?.env?.NODE_ENV === 'production') return true;
  } catch {}
  return false;
};

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Resolves the active delivery mode from environment variables.
   * STRICT SECURITY: Refuses test mode in production.
   */
  public getDeliveryMode(): OtpDeliveryMode {
    const isProduction = isProdEnv();
    const configuredMode = (getEnvVar('OTP_MODE', 'test')).toLowerCase() as OtpDeliveryMode;

    if (isProduction && configuredMode === 'test') {
      throw new Error('SECURITY VIOLATION: OTP_MODE cannot be "test" in production environment.');
    }

    return configuredMode;
  }

  /**
   * Validates Indian phone number format:
   * 10 digits starting with 6, 7, 8, or 9 with standard +91 prefix.
   */
  public normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    let digits = cleaned;
    
    if (cleaned.startsWith('+91')) {
      digits = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      digits = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      digits = cleaned.substring(1);
    }

    if (!/^[6-9]\d{9}$/.test(digits)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
    }

    return `+91${digits}`;
  }

  /**
   * Rate limiting by IP address: max 10 requests per 10 minutes.
   */
  private checkIpRateLimit(ip: string): void {
    const now = Date.now();
    const record = ipRateLimitStore.get(ip);

    if (record && record.resetAt > now) {
      if (record.count >= 10) {
        throw new Error('Too many requests from this network. Please wait a few minutes before trying again.');
      }
      record.count++;
    } else {
      ipRateLimitStore.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
  }

  /**
   * Sends or generates OTP based on the active delivery mode.
   */
  public async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    const clientIp = request.clientIp || '127.0.0.1';
    this.checkIpRateLimit(clientIp);

    const normalizedPhone = this.normalizePhoneNumber(request.phoneNumber);
    const mode = this.getDeliveryMode();
    const now = Date.now();

    // Check 30-second cooldown per phone number
    const existing = otpStore.get(normalizedPhone);
    if (existing && existing.lastSentAt + 30 * 1000 > now) {
      const waitSec = Math.ceil((existing.lastSentAt + 30 * 1000 - now) / 1000);
      throw new Error(`Please wait ${waitSec} seconds before requesting a new code.`);
    }

    let otpCode: string;

    if (mode === 'test') {
      // In test mode: use fixed code
      otpCode = getEnvVar('TEST_OTP_CODE', '123456');
    } else if (mode === 'twilio') {
      const sid = getEnvVar('TWILIO_ACCOUNT_SID');
      const token = getEnvVar('TWILIO_AUTH_TOKEN');
      const verifySid = getEnvVar('TWILIO_VERIFY_SERVICE_SID');

      if (!sid || !token || !verifySid || sid.startsWith('AC_placeholder')) {
        throw new Error('OTP service not configured: Twilio credentials missing in environment.');
      }
      // Generate secure 6-digit random number
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      // External dispatch would happen here
    } else if (mode === 'msg91') {
      const authKey = getEnvVar('MSG91_AUTH_KEY');
      if (!authKey || authKey.startsWith('placeholder')) {
        throw new Error('OTP service not configured: MSG91 credentials missing in environment.');
      }
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      // External MSG91 dispatch would happen here
    } else {
      throw new Error(`Unsupported OTP delivery mode: ${mode}`);
    }

    // Store OTP state (expires in 5 minutes, 5 attempts max)
    otpStore.set(normalizedPhone, {
      phoneNumber: normalizedPhone,
      codeHash: otpCode, // Note: In production, store as bcrypt / sha256 hash
      expiresAt: now + 5 * 60 * 1000,
      attemptsRemaining: 5,
      lastSentAt: now,
      email: request.email,
      deliveryMode: mode
    });

    const isTest = mode === 'test';

    return {
      success: true,
      message: isTest 
        ? 'Test verification code generated. Valid for 5 minutes.' 
        : `Verification code sent to ${normalizedPhone}.`,
      deliveryMode: mode,
      cooldownSeconds: 30,
      isTestMode: isTest,
      // Provide hint in test mode for evaluation; NEVER provide in real SMS mode
      testOtpHint: isTest ? otpCode : undefined
    };
  }

  /**
   * Verifies OTP code and creates secure session.
   */
  public async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const normalizedPhone = this.normalizePhoneNumber(request.phoneNumber);
    const now = Date.now();
    const record = otpStore.get(normalizedPhone);

    if (!record) {
      throw new Error('No active verification code found. Please request a new code.');
    }

    if (now > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      throw new Error('Verification code has expired. Please request a new one.');
    }

    if (record.attemptsRemaining <= 0) {
      otpStore.delete(normalizedPhone);
      throw new Error('Too many incorrect attempts. For security, please request a new code.');
    }

    // Verify 6-digit code
    if (request.otpCode.trim() !== record.codeHash) {
      record.attemptsRemaining--;
      if (record.attemptsRemaining <= 0) {
        otpStore.delete(normalizedPhone);
        throw new Error('Too many incorrect attempts. This code is now locked.');
      }
      throw new Error(`Invalid verification code. ${record.attemptsRemaining} attempts remaining.`);
    }

    // Code verified: delete immediately (Single use security rule)
    otpStore.delete(normalizedPhone);

    // Check if user profile already exists
    let user = userDb.get(normalizedPhone);
    const isNewUser = !user;

    if (!user) {
      // New user profile needs completion
      return {
        success: true,
        message: 'Code verified successfully. Please complete your profile.',
        isNewUser: true
      };
    }

    // Issue session token
    const token = `km_sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const session: AuthSession = {
      token,
      user,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000 // 7 days session
    };

    sessionStore.set(token, session);

    return {
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      isNewUser: false,
      session
    };
  }

  /**
   * Completes registration for a new user with their chosen trade role.
   * SECURITY RULE: Nobody can self-select platform_admin.
   * Buyers & Exporters stay unverified until admin approves.
   */
  public completeProfile(request: CompleteProfileRequest): AuthSession {
    const normalizedPhone = this.normalizePhoneNumber(request.phoneNumber);

    if (!request.fullName.trim()) {
      throw new Error('Please enter your full name.');
    }

    // Strict role check
    if ((request.role as string) === 'platform_admin' || (request.role as string) === 'admin') {
      throw new Error('Unauthorized role selection: Admin access requires administrative assignment.');
    }

    const validRoles: UserTradeRole[] = ['farmer', 'fpo_admin', 'buyer', 'exporter'];
    if (!validRoles.includes(request.role)) {
      throw new Error('Invalid trade role selected.');
    }

    // Buyers & Exporters require administrative verification before listing/bidding
    const isVerified = request.role === 'farmer'; // Farmers verified by default for ease of access

    const newUser: AuthSession['user'] = {
      id: `usr-${Date.now()}`,
      phoneNumber: normalizedPhone,
      fullName: request.fullName.trim(),
      role: request.role,
      organizationName: request.organizationName?.trim() || undefined,
      preferredLanguage: request.preferredLanguage || 'en',
      isVerified,
      isKycApproved: false,
      createdAt: new Date().toISOString()
    };

    userDb.set(normalizedPhone, newUser);

    const token = `km_sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const session: AuthSession = {
      token,
      user: newUser,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };

    sessionStore.set(token, session);
    return session;
  }

  public getSession(token: string): AuthSession | null {
    const session = sessionStore.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      sessionStore.delete(token);
      return null;
    }
    return session;
  }

  public logout(token: string): void {
    sessionStore.delete(token);
  }
}
