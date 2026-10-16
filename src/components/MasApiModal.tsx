import React, { useState, useEffect } from 'react';
import { MasApiConfig } from '../types/currency';
import {
  X,
  Code2,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Activity,
  Server,
  Play,
} from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MasApiConfig;
  onSaveConfig: (config: MasApiConfig) => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status: string; masKeyConfigured: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Query health endpoint on modal open
      fetch('/api/health')
        .then((r) => r.json())
        .then((data) => setHealthStatus(data))
        .catch(() => setHealthStatus(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const masCatalogueUrl =
    'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14';

  const sampleCurl = `curl -X GET "${masCatalogueUrl}" \\
  -H "Accept: application/json" \\
  -H "KeyId: ${apiKey || '<YOUR_MAS_KEY_ID>'}"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleTestEndpoint = async (endpoint: '/api/health' | '/api/exchangerates') => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (apiKey) headers['KeyId'] = apiKey;

      const res = await fetch(`${endpoint}${endpoint === '/api/exchangerates' ? '?end_of_day=2026-10-14' : ''}`, {
        headers,
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setTestResult(`Error calling ${endpoint}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiKey,
      useLiveSimulation: !apiKey,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Code2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                MAS Serverless API Connection
              </h3>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) API Catalogue Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Serverless Route Architecture */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Server className="w-4 h-4 text-slate-700" />
                <span>Installed Serverless Handlers (in /api)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Root /api</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-900">/api/health.ts</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${healthStatus?.status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {healthStatus?.status === 'ok' ? 'Online' : 'Ready'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Health & environment check
                </div>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-900">/api/exchangerates.ts</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${healthStatus?.masKeyConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {healthStatus?.masKeyConfigured ? 'Key Set' : 'Awaiting Key'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Live MAS catalogue proxy
                </div>
              </div>
            </div>
          </div>

          {/* Upstream MAS Catalogue Spec */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Upstream Target Endpoint (MAS APIMG Gateway)
              </span>
              <a
                href="https://eservices.mas.gov.sg/statistics/api/apilist.aspx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline"
              >
                <span>MAS Catalogue</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-xl break-all">
              <span className="text-emerald-400 font-bold">GET</span> {masCatalogueUrl}
              <div className="text-slate-400 mt-1">
                Header: <span className="text-amber-300">KeyId:</span> &lt;MAS_KEY_ID&gt;
              </div>
            </div>
          </div>

          {/* MAS KeyId Input (No hardcoding) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              KeyId (Enter manually or configure MAS_KEY_ID in .env)
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all bg-white">
              <span className="pl-3.5 text-slate-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste MAS KeyId when ready (e.g. ghp_... or MAS UUID)..."
                className="w-full px-3 py-2.5 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Not hardcoded. Stored in environment variable <code className="font-mono text-slate-700">MAS_KEY_ID</code> or provided per request.
            </p>
          </div>

          {/* Interactive Probes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-800">
              Test Serverless Endpoints
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestEndpoint('/api/health')}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                <span>Probe /api/health</span>
              </button>
              <button
                onClick={() => handleTestEndpoint('/api/exchangerates')}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-slate-600" />
                <span>Probe /api/exchangerates</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 ml-auto transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied cURL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <pre className="p-3 bg-slate-950 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto max-h-40 border border-slate-800">
                <code>{testResult}</code>
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Serverless Handlers in /api Root Folder</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              {savedSuccess ? 'Saved!' : 'Save KeyId'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
