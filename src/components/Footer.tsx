import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenMasModal: () => void;
  onSelectTab: (tab: 'rates' | 'calculator' | 'matrix') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMasModal, onSelectTab }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
                S$
              </div>
              <span className="font-bold text-slate-900 text-base">SingaRate</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Singapore-based foreign exchange rate platform providing real-time SGD conversions against global currencies, MAS daily benchmark rates, and retail bank spread insights.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>Monetary Authority of Singapore (MAS) Data Standard</span>
              <span aria-hidden="true">·</span>
              <span>17:00 SGT End-of-Day Quotes</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              FX Tools
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onSelectTab('rates')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Live SGD Exchange Rates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Singapore FX Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('matrix')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Multi-Currency Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMasModal}
                  className="hover:text-slate-900 transition-colors"
                >
                  MAS Developer API Spec
                </button>
              </li>
            </ul>
          </div>

          {/* Data Governance & Disclaimers */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Governance & Sources
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <a
                  href="https://eservices.mas.gov.sg/statistics/api/apilist.aspx"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                >
                  <span>MAS Open Data</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">
                  Brunei Dollar (BND) 1:1 Interchangeability (1967 Pact)
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  Indicative benchmark rates for reference only
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>SingaRate · Singapore FX Intelligence</span>
          </div>
          <div>All rates quoted in Singapore Dollar (SGD) mid-market indicative benchmarks</div>
        </div>
      </div>
    </footer>
  );
};
