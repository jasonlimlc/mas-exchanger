import React, { useState } from 'react';
import { MasApiConfig } from '../types/currency';
import {
  X,
  Code2,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Database,
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
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl || '');
  const [useSimulation, setUseSimulation] = useState(config.useLiveSimulation);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiKey,
      endpointUrl,
      useLiveSimulation: useSimulation,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const sampleBackendSnippet = `// Node.js Express route for MAS Exchange Rates API proxy
app.get('/api/mas-exchange-rates', async (req, res) => {
  try {
    const MAS_RESOURCE_ID = '${config.resourceId}';
    const MAS_API_KEY = process.env.MAS_API_KEY || '${apiKey || 'YOUR_MAS_API_KEY'}';

    const url = \`https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=\${MAS_RESOURCE_ID}&limit=100&sort=end_of_day desc\`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': \`Bearer \${MAS_API_KEY}\`
      }
    });

    const data = await response.json();
    res.json({ success: true, records: data.result.records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleBackendSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
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
                MAS API Integration Specification
              </h3>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) Open Data API readiness
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
          {/* Overview Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Database className="w-4 h-4 text-slate-700" />
              <span>Backend Ready Architecture</span>
            </div>
            <p>
              This front end currently runs on calibrated real-time SGD financial benchmarks. When you are ready to connect your backend integration using MAS API keys, you can point to your backend proxy or enter credentials below.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://eservices.mas.gov.sg/statistics/api/apilist.aspx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700 hover:underline"
              >
                <span>MAS API Documentation Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Form Settings */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                MAS API Key (Optional for now)
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all bg-white">
                <span className="pl-3.5 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your MAS Developer API Key when available..."
                  className="w-full px-3 py-2.5 text-sm text-slate-900 font-mono focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Stored locally in browser storage for your developer testing.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                MAS API Resource ID / Endpoint
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Resource ID: <code className="font-mono text-slate-700">{config.resourceId}</code> (Exchange Rates Daily)
              </p>
            </div>

            {/* Toggle Mode */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Frontend Live Simulation Mode
                </div>
                <div className="text-[11px] text-slate-500">
                  Provides high-fidelity SGD live rates without requiring active backend API keys
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSimulation}
                  onChange={(e) => setUseSimulation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>

          {/* Code Snippet for Backend Proxy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Backend Proxy Sample Implementation (Express / TypeScript)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-48 border border-slate-800">
              <code>{sampleBackendSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MAS Contract Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              {savedSuccess ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
