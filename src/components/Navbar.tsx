import React from 'react';
import { ArrowLeftRight, Code2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'rates' | 'calculator' | 'matrix';
  onSelectTab: (tab: 'rates' | 'calculator' | 'matrix') => void;
  onOpenMasModal: () => void;
  onOpenQuickConvert: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMasModal,
  onOpenQuickConvert,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('rates');
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                S$
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SingaRate
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation Links (Single-line, concise) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('rates')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'rates'
                  ? 'border-rose-600 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Live SGD Rates
            </button>
            <button
              onClick={() => onSelectTab('calculator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'calculator'
                  ? 'border-rose-600 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              FX Calculator
            </button>
            <button
              onClick={() => onSelectTab('matrix')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'matrix'
                  ? 'border-rose-600 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Multi-Convert Matrix
            </button>
            <button
              onClick={onOpenMasModal}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 text-slate-500"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>MAS API Specs</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuickConvert}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Convert SGD</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('rates')}
            className={`py-1.5 px-3 rounded-md transition-colors ${
              activeTab === 'rates' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Live Rates
          </button>
          <button
            onClick={() => onSelectTab('calculator')}
            className={`py-1.5 px-3 rounded-md transition-colors ${
              activeTab === 'calculator' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => onSelectTab('matrix')}
            className={`py-1.5 px-3 rounded-md transition-colors ${
              activeTab === 'matrix' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Matrix
          </button>
          <button
            onClick={onOpenMasModal}
            className="py-1.5 px-3 text-slate-500 hover:text-slate-900"
          >
            MAS API
          </button>
        </div>
      </div>
    </header>
  );
};
