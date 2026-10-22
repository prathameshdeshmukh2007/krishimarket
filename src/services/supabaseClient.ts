// ====================================================================
// KRISHIMARKET: SUPABASE POSTGRESQL CLIENT & CONNECTION MANAGER
// Connects frontend to Supabase using the Publishable Key:
// sb_publishable_jv_qDGe9OjvwPRxpDT7l8g_-8_laixj
// Supports dynamic URL configuration, health testing, and localStorage persistence.
// ====================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const STORAGE_KEY_SUPABASE_URL = 'km_supabase_url_v1';
export const STORAGE_KEY_SUPABASE_KEY = 'km_supabase_key_v1';

// The verified publishable key provided by the user
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jv_qDGe9OjvwPRxpDT7l8g_-8_laixj';

export interface SupabaseConnectionStatus {
  url: string;
  key: string;
  isConfigured: boolean;
  status: 'connected' | 'needs_url' | 'connecting' | 'error' | 'offline_fallback';
  projectRef?: string;
  errorMessage?: string;
  lastChecked?: string;
}

class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient | null = null;
  private currentUrl: string = '';
  private currentKey: string = '';

  private constructor() {
    this.initClient();
  }

  public static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  /**
   * Resolves Supabase credentials from localStorage or Vite environment variables.
   */
  public getCredentials(): { url: string; key: string } {
    let url = '';
    let key = DEFAULT_SUPABASE_PUBLISHABLE_KEY;

    if (typeof localStorage !== 'undefined') {
      try {
        const storedUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL);
        const storedKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY);
        if (storedUrl) url = storedUrl.trim();
        if (storedKey) key = storedKey.trim();
      } catch (e) {
        console.warn('Could not read Supabase credentials from localStorage:', e);
      }
    }

    // Fallback to Vite environment variables if not set in localStorage
    if (!url && typeof import.meta !== 'undefined' && import.meta.env) {
      url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    }
    if (!key && typeof import.meta !== 'undefined' && import.meta.env) {
      key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
    }

    if (!key) {
      key = DEFAULT_SUPABASE_PUBLISHABLE_KEY;
    }

    return { url, key };
  }

  /**
   * Initializes or refreshes the Supabase JS client.
   */
  public initClient(): SupabaseClient | null {
    const { url, key } = this.getCredentials();

    if (!url || !url.startsWith('http')) {
      this.client = null;
      this.currentUrl = url;
      this.currentKey = key;
      return null;
    }

    // Only recreate if credentials changed or client is uninitialized
    if (!this.client || this.currentUrl !== url || this.currentKey !== key) {
      try {
        this.client = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        this.currentUrl = url;
        this.currentKey = key;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    }

    return this.client;
  }

  /**
   * Returns the active Supabase client (or null if URL is not yet configured).
   */
  public getClient(): SupabaseClient | null {
    if (!this.client) {
      return this.initClient();
    }
    return this.client;
  }

  /**
   * Saves updated Supabase credentials to localStorage and re-inits the client.
   */
  public setCredentials(url: string, key?: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        if (url) {
          localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
        } else {
          localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
        }

        const validKey = (key || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();
        localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, validKey);
      } catch (e) {
        console.warn('Error saving Supabase config to localStorage:', e);
      }
    }
    this.client = null;
    this.initClient();
  }

  /**
   * Extracts the Project Ref from a URL like https://xyz.supabase.co
   */
  public extractProjectRef(url: string): string | undefined {
    try {
      const parsed = new URL(url);
      const hostParts = parsed.hostname.split('.');
      if (hostParts.length >= 3 && hostParts[1] === 'supabase') {
        return hostParts[0];
      }
    } catch {}
    return undefined;
  }

  /**
   * Pings Supabase to verify connection health.
   */
  public async testConnection(customUrl?: string, customKey?: string): Promise<SupabaseConnectionStatus> {
    const url = (customUrl !== undefined ? customUrl : this.getCredentials().url).trim();
    const key = (customKey !== undefined ? customKey : this.getCredentials().key).trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

    if (!url) {
      return {
        url: '',
        key,
        isConfigured: false,
        status: 'needs_url',
        errorMessage: 'Supabase Project URL is required (e.g. https://<project-ref>.supabase.co).'
      };
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return {
        url,
        key,
        isConfigured: false,
        status: 'error',
        errorMessage: 'Invalid URL. Must begin with https:// (e.g. https://your-project.supabase.co).'
      };
    }

    const projectRef = this.extractProjectRef(url);

    try {
      // Test REST health endpoint or simple query
      const testClient = createClient(url, key);
      const { data, error } = await testClient.from('commodities').select('count', { count: 'exact', head: true });

      // Even if the table doesn't exist yet (404/PGRST204), an HTTP response means the Supabase gateway is REACHABLE!
      if (error && error.code === 'PGRST204') {
        return {
          url,
          key,
          isConfigured: true,
          status: 'connected',
          projectRef,
          errorMessage: 'Connected to Supabase! (Tables pending: apply db_schema.sql in Supabase SQL editor)',
          lastChecked: new Date().toLocaleTimeString()
        };
      }

      if (error && error.message && !error.message.includes('fetch')) {
        // Gateway reached but returned Supabase API response (e.g., table not created yet or RLS policy)
        return {
          url,
          key,
          isConfigured: true,
          status: 'connected',
          projectRef,
          errorMessage: error.message.includes('relation') 
            ? 'Connected to Supabase! Apply schema to create tables.' 
            : undefined,
          lastChecked: new Date().toLocaleTimeString()
        };
      }

      return {
        url,
        key,
        isConfigured: true,
        status: 'connected',
        projectRef,
        lastChecked: new Date().toLocaleTimeString()
      };
    } catch (err: any) {
      return {
        url,
        key,
        isConfigured: false,
        status: 'error',
        projectRef,
        errorMessage: err?.message || 'Could not reach Supabase endpoint. Please verify URL and internet connection.',
        lastChecked: new Date().toLocaleTimeString()
      };
    }
  }

  /**
   * Retrieves current connection status snapshot.
   */
  public getStatus(): SupabaseConnectionStatus {
    const { url, key } = this.getCredentials();
    const isConfigured = Boolean(url && url.startsWith('http'));
    return {
      url,
      key,
      isConfigured,
      status: isConfigured ? 'connected' : 'needs_url',
      projectRef: this.extractProjectRef(url)
    };
  }
}

export const supabaseManager = SupabaseManager.getInstance();
export const getSupabaseClient = () => supabaseManager.getClient();
