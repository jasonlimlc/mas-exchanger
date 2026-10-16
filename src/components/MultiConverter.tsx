import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { SGD_CURRENCY } from '../data/currencies';
import { convertCurrency } from '../services/exchangeRateService';
import { Coins, Star, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';

interface MultiConverterProps {
  currencies: Currency[];
  favoriteCodes: string[];
  onToggleFavorite: (code: string) => void;
  onOpenCalculatorWithPair: (fromCode: string, toCode: string) => void;
  onSelectCurrency: (currency: Currency) => void;
}

export const MultiConverter: React.FC<MultiConverterProps> = ({
  currencies,
  favoriteCodes,
  onToggleFavorite,
  onOpenCalculatorWithPair,
  onSelectCurrency,
}) => {
  const [sgAmountStr, setSgAmountStr] = useState<string>('1000');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(true);

  const numericSgd = parseFloat(sgAmountStr) || 0;

  // Currencies to display
  const targetCurrencies = currencies.filter((c) => {
    if (c.code === 'SGD') return false;
    if (filterFavoritesOnly) {
      return favoriteCodes.includes(c.code);
    }
    return true;
  });

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000, 10000];

  return (
    <div className="w-full space-y-6">
      {/* Header and Input Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                SGD Multi-Currency Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enter any Singapore Dollar amount to simultaneously calculate equivalent values across all your saved currencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                filterFavoritesOnly
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{filterFavoritesOnly ? `Showing Favorites (${targetCurrencies.length})` : 'Showing All'}</span>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="mt-5 max-w-md">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
            Singapore Dollar Base Amount
          </label>
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all bg-white">
            <span className="pl-4 font-bold text-slate-500 text-lg">S$</span>
            <input
              type="number"
              min="1"
              step="any"
              value={sgAmountStr}
              onChange={(e) => setSgAmountStr(e.target.value)}
              className="w-full px-3 py-3 text-2xl font-bold text-slate-900 tabular-nums focus:outline-none"
              placeholder="1000"
            />
            <span className="pr-4 text-xs font-bold text-slate-500">SGD</span>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="mt-4 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setSgAmountStr(amt.toString())}
              className={`px-3 py-1 rounded-md transition-colors ${
                numericSgd === amt
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              S${amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Converted Currencies */}
      {targetCurrencies.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No favorite currencies selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Star currencies in the Live Rates table to add them here, or toggle &quot;Showing All&quot; above.
          </p>
          <button
            onClick={() => setFilterFavoritesOnly(false)}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Show All Currencies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {targetCurrencies.map((c) => {
            const isFav = favoriteCodes.includes(c.code);
            const { convertedAmount, directRate } = convertCurrency(numericSgd, SGD_CURRENCY, c);
            const isPositive = c.change24h >= 0;

            return (
              <div
                key={c.code}
                onClick={() => onSelectCurrency(c)}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none" role="img" aria-label={c.country}>
                        {c.flag}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{c.code}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{c.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleFavorite(c.code)}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Converted Output */}
                  <div className="mt-4">
                    <div className="text-xs text-slate-400 font-medium">Equivalent Value:</div>
                    <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight mt-0.5">
                      <span className="text-base font-normal text-slate-500 mr-1">{c.symbol}</span>
                      {convertedAmount.toLocaleString('en-SG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: c.rateToSgd > 1000 ? 0 : 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 tabular-nums font-mono text-[11px]">
                    1 SGD = {directRate > 1000 ? directRate.toFixed(0) : directRate.toFixed(4)} {c.code}
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`inline-flex items-center text-[11px] font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {c.change24h.toFixed(2)}%
                    </span>

                    <button
                      onClick={() => onOpenCalculatorWithPair('SGD', c.code)}
                      className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                      title="Open in Calculator"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
