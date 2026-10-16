import React, { useState, useEffect } from 'react';
import { Currency, MasApiConfig } from './types/currency';
import { INITIAL_CURRENCIES } from './data/currencies';
import {
  getSavedFavorites,
  saveFavorites,
  getMasConfig,
  saveMasConfig,
  fetchMasExchangeRates,
} from './services/exchangeRateService';
import { Navbar } from './components/Navbar';
import { CorridorHighlights } from './components/CorridorHighlights';
import { CurrencyTable } from './components/CurrencyTable';
import { Calculator } from './components/Calculator';
import { MultiConverter } from './components/MultiConverter';
import { CurrencyDetailModal } from './components/CurrencyDetailModal';
import { MasApiModal } from './components/MasApiModal';
import { Footer } from './components/Footer';
import { RefreshCw, Clock, Building2, Sparkles } from 'lucide-react';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rates' | 'calculator' | 'matrix'>('rates');
  const [selectedCurrencyForDetail, setSelectedCurrencyForDetail] = useState<Currency | null>(null);
  const [calculatorPair, setCalculatorPair] = useState<{ from: string; to: string }>({
    from: 'SGD',
    to: 'MYR',
  });
  const [masModalOpen, setMasModalOpen] = useState(false);
  const [masConfig, setMasConfig] = useState<MasApiConfig>(getMasConfig());
  const [lastUpdated, setLastUpdated] = useState<string>('15 Oct 2026, 17:00 SGT');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize favorites on client
  useEffect(() => {
    setFavoriteCodes(getSavedFavorites());
  }, []);

  const handleToggleFavorite = (code: string) => {
    setFavoriteCodes((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      saveFavorites(next);
      return next;
    });
  };

  const handleOpenCalculatorWithPair = (fromCode: string, toCode: string) => {
    setCalculatorPair({ from: fromCode, to: toCode });
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchMasExchangeRates(masConfig);
      if (result.success) {
        setCurrencies(result.currencies);
        setLastUpdated(result.lastUpdated);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleSaveMasConfig = (newConfig: MasApiConfig) => {
    setMasConfig(newConfig);
    saveMasConfig(newConfig);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMasModal={() => setMasModalOpen(true)}
        onOpenQuickConvert={() => handleOpenCalculatorWithPair('SGD', 'MYR')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Header / Context Row */}
        <div className="mb-6 pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
              <span>Singapore Dollar (SGD) Global FX Central</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Singapore Real-Time Exchange Rates
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Real-time foreign exchange conversions, MAS benchmark end-of-day quotes, retail bank spread analysis, and travel calculator.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono tabular-nums">{lastUpdated}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                MAS Indicative Benchmark Quotes
              </div>
            </div>

            <button
              onClick={handleRefreshRates}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs disabled:opacity-50"
              title="Refresh live exchange rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh Rates'}</span>
            </button>
          </div>
        </div>

        {/* Key Corridors Strip (Always visible or on Rates tab) */}
        <CorridorHighlights
          currencies={currencies}
          onSelectCurrency={(c) => setSelectedCurrencyForDetail(c)}
          onOpenCalculatorWithPair={handleOpenCalculatorWithPair}
        />

        {/* Active Tab View */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <CurrencyTable
              currencies={currencies}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={handleToggleFavorite}
              onSelectCurrency={(c) => setSelectedCurrencyForDetail(c)}
              onOpenCalculatorWithPair={handleOpenCalculatorWithPair}
            />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <Calculator
              currencies={currencies}
              initialFromCode={calculatorPair.from}
              initialToCode={calculatorPair.to}
              onOpenCurrencyDetail={(c) => setSelectedCurrencyForDetail(c)}
            />
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <MultiConverter
              currencies={currencies}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={handleToggleFavorite}
              onOpenCalculatorWithPair={handleOpenCalculatorWithPair}
              onSelectCurrency={(c) => setSelectedCurrencyForDetail(c)}
            />
          </div>
        )}

        {/* MAS API Developer Banner */}
        <div className="mt-12 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  MAS Open Data API Integration Ready
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                  Developer Spec
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Front-end is fully decoupled and ready to connect your backend proxy using MAS API keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMasModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Configure MAS Connection
            </button>
          </div>
        </div>
      </main>

      {/* Currency Detail Modal */}
      <CurrencyDetailModal
        currency={selectedCurrencyForDetail}
        isFavorite={selectedCurrencyForDetail ? favoriteCodes.includes(selectedCurrencyForDetail.code) : false}
        onClose={() => setSelectedCurrencyForDetail(null)}
        onToggleFavorite={handleToggleFavorite}
        onOpenCalculator={handleOpenCalculatorWithPair}
      />

      {/* MAS API Specs Modal */}
      <MasApiModal
        isOpen={masModalOpen}
        onClose={() => setMasModalOpen(false)}
        config={masConfig}
        onSaveConfig={handleSaveMasConfig}
      />

      {/* Footer */}
      <Footer
        onOpenMasModal={() => setMasModalOpen(true)}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
