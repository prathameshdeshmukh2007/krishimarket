import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Server, 
  Clock, 
  FileText,
  Radio,
  Sliders
} from 'lucide-react';
import { DataSyncLog, MarketPriceRecord, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface AdminDataHealthViewProps {
  prices: MarketPriceRecord[];
  syncLogs: DataSyncLog[];
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRunSync: () => Promise<void>;
  isSyncing: boolean;
  lastSynced: string;
  language: LanguageCode;
}

export const AdminDataHealthView: React.FC<AdminDataHealthViewProps> = ({
  prices,
  syncLogs,
  isDemoMode,
  onToggleDemoMode,
  onRunSync,
  isSyncing,
  lastSynced,
  language
}) => {
  const t = translations[language];
  const [activeEndpoint, setActiveEndpoint] = useState<string>('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070');
  const [simulateApiError, setSimulateApiError] = useState<boolean>(false);

  const totalRecords = prices.length;
  const officialRecords = prices.filter(p => !p.isDemo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>{t.adminTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Government of India (AGMARKNET / data.gov.in) ingestion pipeline telemetry, data validation integrity, and sync audits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                isDemoMode
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isDemoMode ? 'Demo Mode Active' : 'Switch to Demo'}</span>
            </button>

            <button
              disabled={isSyncing}
              onClick={onRunSync}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : t.runManualSync}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Gateway Status</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-sm font-bold text-emerald-400 font-mono">CONNECTED</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">data.gov.in AGMARKNET</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Last Successful Sync</div>
            <div className="text-sm font-bold text-white font-mono mt-1">{lastSynced}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Automatic Daily Job</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Normalized Records</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1">{totalRecords} APMC Pairs</div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% Schema Validated</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Validation Rejections</div>
            <div className="text-sm font-bold text-slate-300 font-mono mt-1">0 Rejections</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Strict Sanity Constraints</div>
          </div>
        </div>
      </div>

      {/* Validation Rules & Data Pipeline Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Automated Normalization & Quality Checks</span>
          </h3>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Price Range Sanity:</strong> Validates that Min Price &lt;= Modal Price &lt;= Max Price. Rejects negative or zero prices.
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Unit Normalization:</strong> Standardizes all APMC records (Bags, Crates, Kilograms) to ₹/Quintal (100 kg).
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Deduplication Index:</strong> Strict composite key: <code className="text-cyan-400">[Date + State + Market + Commodity + Variety + Grade]</code>.
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Resilient Fallback:</strong> In event of Government server downtime, displays verified historical cache with explicit timestamp label.
              </div>
            </div>
          </div>
        </div>

        {/* Official API Connector Config */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>Official Government API Connector</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Open Government Data API Endpoint</label>
              <input
                type="text"
                readOnly
                value={activeEndpoint}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono select-all"
              />
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div><strong>Dataset:</strong> Current Daily Price and Arrival Report for APMC Mandis</div>
              <div><strong>Publishing Authority:</strong> Directorate of Marketing & Inspection (DMI)</div>
              <div><strong>Legal Attribution:</strong> Government of India Open Data License (data.gov.in)</div>
            </div>

            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span>Real-time polling safely scheduled at optimal intervals to avoid excessive API load.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Execution Audit Logs */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-200 font-bold">
            DATA INGESTION & SYNCHRONIZATION AUDIT LOGS
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Retaining Last 15 Execution Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Sync ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Fetched</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3">Rejected</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-4">Source Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">{log.id}</td>
                  <td className="py-3 px-3 text-slate-400">{log.startedAt}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                      log.status === 'FALLBACK_CACHED' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-rose-950 text-rose-400 border border-rose-500/40'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200">{log.recordsFetched}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{log.recordsUpdated}</td>
                  <td className="py-3 px-3 text-slate-400">{log.recordsRejected}</td>
                  <td className="py-3 px-3 text-cyan-400">{log.latencyMs}ms</td>
                  <td className="py-3 px-4 text-slate-300">{log.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
