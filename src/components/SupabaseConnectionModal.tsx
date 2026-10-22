import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Globe, 
  Terminal, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { supabaseManager, DEFAULT_SUPABASE_PUBLISHABLE_KEY, SupabaseConnectionStatus } from '../services/supabaseClient';
import { LanguageCode } from '../types';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
  onConnected?: () => void;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  onConnected
}) => {
  const [url, setUrl] = useState<string>('');
  const [key, setKey] = useState<string>(DEFAULT_SUPABASE_PUBLISHABLE_KEY);
  const [testing, setTesting] = useState<boolean>(false);
  const [status, setStatus] = useState<SupabaseConnectionStatus>(supabaseManager.getStatus());
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'schema' | 'guide'>('settings');

  useEffect(() => {
    if (isOpen) {
      const creds = supabaseManager.getCredentials();
      setUrl(creds.url);
      setKey(creds.key || DEFAULT_SUPABASE_PUBLISHABLE_KEY);
      setStatus(supabaseManager.getStatus());

      // If URL already present, auto-test in background
      if (creds.url) {
        handleTest(creds.url, creds.key);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (testUrl = url, testKey = key) => {
    setTesting(true);
    try {
      const res = await supabaseManager.testConnection(testUrl, testKey);
      setStatus(res);
      if (res.status === 'connected' && onConnected) {
        onConnected();
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setTesting(true);
    try {
      supabaseManager.setCredentials(url, key);
      const res = await supabaseManager.testConnection(url, key);
      setStatus(res);
      if (res.status === 'connected') {
        if (onConnected) onConnected();
        setTimeout(() => onClose(), 1200);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const SAMPLE_SQL_SCHEMA = `-- KrishiMarket Core Tables for Supabase
CREATE TABLE IF NOT EXISTS crop_lots (
    id TEXT PRIMARY KEY,
    lot_code TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    village TEXT,
    district TEXT,
    state TEXT,
    farm_address TEXT,
    commodity TEXT NOT NULL,
    variety TEXT,
    quantity_quintals NUMERIC,
    expected_price_per_q NUMERIC,
    expected_harvest_date TEXT,
    photos TEXT[],
    ai_preliminary_grade TEXT,
    verified_grade TEXT,
    status TEXT DEFAULT 'active',
    passport_events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_offers (
    id TEXT PRIMARY KEY,
    lot_id TEXT REFERENCES crop_lots(id) ON DELETE CASCADE,
    lot_code TEXT,
    buyer_name TEXT,
    buyer_company TEXT,
    buyer_type TEXT,
    buyer_trust_score NUMERIC,
    offer_price_per_q NUMERIC,
    quantity_requested_q NUMERIC,
    transport_paid_by TEXT,
    status TEXT DEFAULT 'pending',
    valid_until TEXT,
    terms_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_quotations (
    id TEXT PRIMARY KEY,
    title TEXT,
    commodity TEXT,
    variety TEXT,
    origin_mandi TEXT,
    destination_country TEXT,
    destination_port TEXT,
    quantity_kg NUMERIC,
    target_unit_price NUMERIC,
    target_currency TEXT,
    incoterm TEXT,
    farmer_fpo_name TEXT,
    farmer_phone TEXT,
    status TEXT DEFAULT 'pending',
    calculated_net_inr NUMERIC,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SAMPLE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  SUPABASE DATABASE CONNECTION
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your physical agricultural inventory, bids & farmer passports to Supabase.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Connection Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Where to find URL</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SQL Schema (Copy)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Connection Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            status.status === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : status.status === 'needs_url'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
          }`}>
            {status.status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : status.status === 'needs_url' ? (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider font-mono">
                  {status.status === 'connected' 
                    ? '🟢 SUPABASE DATABASE CONNECTED & ACTIVE' 
                    : status.status === 'needs_url'
                    ? '🟡 PUBLISHABLE KEY READY — ENTER PROJECT URL'
                    : '🔴 CONNECTION PENDING / VERIFICATION FAILED'}
                </span>
                {status.lastChecked && (
                  <span className="text-[10px] font-mono opacity-70">Checked: {status.lastChecked}</span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {status.status === 'connected'
                  ? `Live database sync enabled. Project Ref: ${status.projectRef || 'Configured'}. Lots, bids, and farm visits persist to PostgreSQL.`
                  : status.status === 'needs_url'
                  ? 'Your Publishable API Key is loaded. Please enter your Supabase Project URL (e.g. https://your-project.supabase.co) below to complete connection.'
                  : status.errorMessage || 'Please ensure your Supabase project URL is correct and starts with https://.'}
              </p>
            </div>
          </div>

          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Publishable Key Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-500" />
                    <span>SUPABASE PUBLISHABLE KEY</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Configured Key
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Using your client key: <code className="text-emerald-600 dark:text-emerald-400 font-mono">sb_publishable_jv_qDGe9OjvwPRxpDT7l8g_-8_laixj</code>
                </p>
              </div>

              {/* Supabase Project URL Field */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>SUPABASE PROJECT URL</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>Found in your Supabase Dashboard under <strong>Project Settings → API → Project URL</strong>.</span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Offline-First Safety Notice */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Resilient Two-Tier Architecture:</span>
                </div>
                If your device loses internet connectivity or while the Supabase tables are being provisioned, KrishiMarket automatically stores all crop lot photos, bids, and QR payment transactions in local vault storage and syncs as soon as connection is live.
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs font-mono text-slate-700 dark:text-slate-300">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                How to Find Your Project URL in 30 Seconds:
              </h3>
              <ol className="space-y-3 list-decimal list-inside leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <li>
                  Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold underline">supabase.com/dashboard</a> and open your project.
                </li>
                <li>
                  In the left sidebar, click the gear icon <strong>Project Settings</strong> (प्रकल्प सेटिंग्ज).
                </li>
                <li>
                  Click on the <strong>API</strong> tab.
                </li>
                <li>
                  Copy the <strong>Project URL</strong> (looks like <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400">https://xxxx.supabase.co</code>).
                </li>
                <li>
                  Paste it into the <strong>Supabase Project URL</strong> box in the Connection Settings tab and click <strong>Test & Save</strong>!
                </li>
              </ol>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                💡 <strong>Tip:</strong> Your publishable key <code className="font-bold">sb_publishable_jv_qDGe9OjvwPRxpDT7l8g_-8_laixj</code> is already saved and configured in your environment!
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">PostgreSQL Tables DDL Script:</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL for Supabase'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 text-xs overflow-x-auto border border-slate-800 max-h-64">
                  {SAMPLE_SQL_SCHEMA}
                </pre>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                To create these tables in Supabase: Open Supabase Dashboard → <strong>SQL Editor</strong> → click <strong>New Query</strong> → paste this SQL and click <strong>Run</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleTest()}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-mono font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-mono text-xs text-slate-600 dark:text-slate-400 font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={testing || !url}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
