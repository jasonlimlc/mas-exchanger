import React, { useState, useEffect } from 'react';
import { Currency } from '../types/currency';
import { SGD_CURRENCY } from '../data/currencies';
import {
  convertCurrency,
  getBankRateComparisons,
  saveCalcHistory,
  getCalcHistory,
  CalculationHistoryItem,
} from '../services/exchangeRateService';
import {
  ArrowLeftRight,
  TrendingUp,
  History,
  RotateCcw,
  Check,
  Building2,
  Wallet,
  CreditCard,
  Percent,
} from 'lucide-react';

interface CalculatorProps {
  currencies: Currency[];
  initialFromCode?: string;
  initialToCode?: string;
  onOpenCurrencyDetail?: (currency: Currency) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies,
  initialFromCode = 'SGD',
  initialToCode = 'MYR',
  onOpenCurrencyDetail,
}) => {
  // All selectable currencies including SGD base
  const allCurrencies = [SGD_CURRENCY, ...currencies.filter((c) => c.code !== 'SGD')];

  const [fromCode, setFromCode] = useState<string>(initialFromCode);
  const [toCode, setToCode] = useState<string>(initialToCode);
  const [amountStr, setAmountStr] = useState<string>('1000');
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync if initial props change
  useEffect(() => {
    if (initialFromCode) setFromCode(initialFromCode);
    if (initialToCode) setToCode(initialToCode);
  }, [initialFromCode, initialToCode]);

  useEffect(() => {
    setHistory(getCalcHistory());
  }, []);

  const fromCurrency = allCurrencies.find((c) => c.code === fromCode) || SGD_CURRENCY;
  const toCurrency = allCurrencies.find((c) => c.code === toCode) || currencies[0] || SGD_CURRENCY;

  const numericAmount = parseFloat(amountStr) || 0;
  const { convertedAmount, directRate } = convertCurrency(numericAmount, fromCurrency, toCurrency);

  // Inverse rate
  const inverseRate = directRate > 0 ? 1 / directRate : 0;

  // Bank comparisons
  const comparisons = getBankRateComparisons(numericAmount, fromCurrency, toCurrency);

  const handleSwap = () => {
    const prevFrom = fromCode;
    const prevTo = toCode;
    setFromCode(prevTo);
    setToCode(prevFrom);
  };

  const handleQuickPreset = (preset: number) => {
    setAmountStr(preset.toString());
  };

  const handleSaveToHistory = () => {
    if (numericAmount <= 0) return;
    const item: CalculationHistoryItem = {
      id: `${Date.now()}_${Math.random()}`,
      fromCode,
      toCode,
      fromAmount: numericAmount,
      toAmount: convertedAmount,
      rate: directRate,
      timestamp: Date.now(),
    };
    const updated = [item, ...history.filter((h) => !(h.fromCode === fromCode && h.toCode === toCode && h.fromAmount === numericAmount))].slice(0, 10);
    setHistory(updated);
    saveCalcHistory(updated);
  };

  const handleRestoreHistory = (item: CalculationHistoryItem) => {
    setFromCode(item.fromCode);
    setToCode(item.toCode);
    setAmountStr(item.fromAmount.toString());
  };

  const handleCopyResult = () => {
    const text = `${numericAmount.toLocaleString()} ${fromCode} = ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Travel wallet denomination table (e.g. 10, 50, 100, 500, 1000)
  const denominations = [10, 50, 100, 500, 1000];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Singapore Currency Calculator
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Direct SGD Benchmark Conversion</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Foreign Exchange</span>
            <span aria-hidden="true">·</span>
            <span>No Hidden Margins</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>{showHistory ? 'Hide History' : `History (${history.length})`}</span>
            </button>
          )}
          <button
            onClick={() => {
              setFromCode('SGD');
              setToCode('MYR');
              setAmountStr('1000');
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Reset to default SGD / MYR"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* History Drawer if toggled */}
      {showHistory && history.length > 0 && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">Recent Conversions</span>
            <button
              onClick={() => {
                setHistory([]);
                saveCalcHistory([]);
              }}
              className="text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRestoreHistory(item)}
                className="flex items-center justify-between p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-xs"
              >
                <div className="font-medium text-slate-800 tabular-nums">
                  {item.fromAmount.toLocaleString()} {item.fromCode} → {item.toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {item.toCode}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  1 {item.fromCode} = {item.rate.toFixed(4)} {item.toCode}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Calculator Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* From Currency Block */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              You Pay
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all bg-white">
              <input
                type="number"
                min="0"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                onBlur={handleSaveToHistory}
                className="w-full px-4 py-3.5 text-xl font-bold text-slate-900 tabular-nums focus:outline-none"
                placeholder="0.00"
              />
              <div className="border-l border-slate-200 bg-slate-50 shrink-0">
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="px-3 py-3.5 bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer pr-8"
                >
                  {allCurrencies.map((c) => (
                    <option key={`from_${c.code}`} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-slate-500 truncate flex items-center justify-between">
              <span>{fromCurrency.name}</span>
              <span className="font-mono text-slate-400">{fromCurrency.symbol}</span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className="w-11 h-11 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-transform active:scale-95 shadow-sm"
              title="Swap currencies"
              type="button"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* To Currency Block */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              You Receive (Mid-Market)
            </label>
            <div className="flex items-center border border-slate-200 bg-slate-50/70 rounded-xl overflow-hidden">
              <div className="w-full px-4 py-3.5 text-xl font-bold text-slate-900 tabular-nums truncate">
                {convertedAmount.toLocaleString('en-SG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: toCurrency.rateToSgd > 1000 ? 0 : 2,
                })}
              </div>
              <div className="border-l border-slate-200 bg-slate-50 shrink-0">
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="px-3 py-3.5 bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer pr-8"
                >
                  {allCurrencies.map((c) => (
                    <option key={`to_${c.code}`} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-slate-500 truncate flex items-center justify-between">
              <span>{toCurrency.name}</span>
              <span className="font-mono text-slate-400">{toCurrency.symbol}</span>
            </div>
          </div>
        </div>

        {/* Quick Presets for Singapore users */}
        {fromCode === 'SGD' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-medium">Quick SGD:</span>
            {[50, 100, 500, 1000, 2500, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => handleQuickPreset(preset)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  numericAmount === preset
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>
        )}

        {/* Conversion Rate summary bar */}
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-slate-900 tabular-nums">
              1 {fromCurrency.code} = {directRate > 1000 ? directRate.toFixed(0) : directRate.toFixed(4)} {toCurrency.code}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              Inverse: 1 {toCurrency.code} = {inverseRate > 1000 ? inverseRate.toFixed(0) : inverseRate.toFixed(6)} {fromCurrency.code}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResult}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <span>Copy Summary</span>
              )}
            </button>
            {onOpenCurrencyDetail && toCurrency.code !== 'SGD' && (
              <button
                onClick={() => onOpenCurrencyDetail(toCurrency)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>30-Day Trends</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Singapore Bank & Money Changer Comparison */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Singapore Channel Rate & Spread Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimated foreign currency received for {numericAmount.toLocaleString()} {fromCode} across common Singapore options
            </p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Estimated counter rates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {comparisons.map((c) => {
            const isMidMarket = c.type === 'mid-market';
            return (
              <div
                key={c.type}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isMidMarket
                    ? 'border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-200'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {c.type === 'mid-market' && <Percent className="w-4 h-4 text-emerald-600" />}
                    {c.type === 'money-changer' && <Wallet className="w-4 h-4 text-blue-600" />}
                    {c.type === 'multi-currency-card' && <CreditCard className="w-4 h-4 text-violet-600" />}
                    {c.type === 'retail-bank' && <Building2 className="w-4 h-4 text-amber-600" />}
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {c.name}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-lg font-bold text-slate-900 tabular-nums">
                      {c.estimatedReceived.toLocaleString('en-SG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: toCurrency.rateToSgd > 1000 ? 0 : 2,
                      })}{' '}
                      <span className="text-xs font-normal text-slate-600">{toCurrency.code}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      {isMidMarket ? (
                        <span className="text-emerald-700 font-medium">0.00% Spread (MAS Baseline)</span>
                      ) : (
                        <span>
                          ~{c.spreadPercent}% Spread · Cost ~{c.spreadCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  {c.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Denominations Pocket Cheat Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Travel Wallet Quick Reference ({fromCode} → {toCode})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Convenient note equivalents for shopping, dining, and transit abroad
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {denominations.map((denom) => {
            const { convertedAmount: denomConverted } = convertCurrency(denom, fromCurrency, toCurrency);
            return (
              <div
                key={denom}
                onClick={() => setAmountStr(denom.toString())}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors text-center group"
              >
                <div className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                  {fromCurrency.symbol}{denom.toLocaleString()} {fromCode}
                </div>
                <div className="text-base font-bold text-slate-900 tabular-nums mt-1">
                  {denomConverted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: toCurrency.rateToSgd > 1000 ? 0 : 2,
                  })}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {toCode}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
