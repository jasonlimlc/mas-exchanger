import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { SGD_CURRENCY } from '../data/currencies';
import { getBankRateComparisons } from '../services/exchangeRateService';
import {
  X,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Calendar,
  Building,
} from 'lucide-react';

interface CurrencyDetailModalProps {
  currency: Currency | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (code: string) => void;
  onOpenCalculator: (fromCode: string, toCode: string) => void;
}

export const CurrencyDetailModal: React.FC<CurrencyDetailModalProps> = ({
  currency,
  isFavorite,
  onClose,
  onToggleFavorite,
  onOpenCalculator,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; rate: number } | null>(null);

  if (!currency) return null;

  const isPositive = currency.change24h >= 0;
  const history = currency.history30d || [];

  // SVG chart dimensions
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 20;
  const paddingY = 20;

  const rates = history.map((h) => h.rate);
  const minRate = Math.min(...rates, currency.low24h);
  const maxRate = Math.max(...rates, currency.high24h);
  const rateRange = maxRate - minRate || 0.001;

  const points = history.map((item, index) => {
    const x = paddingX + (index / (history.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((item.rate - minRate) / rateRange) * (chartHeight - paddingY * 2);
    return { x, y, item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Bank comparisons for 1,000 SGD
  const sampleAmount = 1000;
  const comparisons = getBankRateComparisons(sampleAmount, SGD_CURRENCY, currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none" role="img" aria-label={currency.country}>
              {currency.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  SGD / {currency.code}
                </h3>
                <button
                  onClick={() => onToggleFavorite(currency.code)}
                  className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                  title="Toggle Favorite"
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              </div>
              <div className="text-xs text-slate-500">
                {currency.name} · {currency.country}
              </div>
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
          {/* Main Key Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">1 SGD Rate</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
                {currency.symbol} {currency.rateToSgd > 1000 ? currency.rateToSgd.toLocaleString() : currency.rateToSgd.toFixed(4)}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">1 {currency.code} in SGD</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
                S$ {currency.inverseRate.toFixed(4)}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">24h Net Change</div>
              <div
                className={`text-base font-bold font-mono mt-0.5 tabular-nums inline-flex items-center ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {isPositive ? '+' : ''}{currency.change24h.toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">MAS Quoting</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {currency.masQuotationUnit === 100 ? 'Per 100 Units' : 'Per 1 Unit'}
              </div>
            </div>
          </div>

          {/* 30-Day Rate Trend Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">
                  30-Day Historical Trend (SGD → {currency.code})
                </span>
              </div>
              <div className="text-xs font-mono text-slate-600">
                {hoveredPoint ? (
                  <span className="font-semibold text-slate-900">
                    {hoveredPoint.date}: {currency.symbol} {hoveredPoint.rate}
                  </span>
                ) : (
                  <span>Hover points for daily rates</span>
                )}
              </div>
            </div>

            <div className="relative bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 overflow-visible"
              >
                {/* Reference Grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight / 2}
                  x2={chartWidth - paddingX}
                  y2={chartHeight / 2}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />

                {/* Trend line */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  className={isPositive ? 'stroke-emerald-600' : 'stroke-rose-600'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.date === p.item.date ? 5 : 2.5}
                    className={`transition-all cursor-pointer ${
                      hoveredPoint?.date === p.item.date
                        ? 'fill-slate-900 stroke-white stroke-2'
                        : isPositive
                        ? 'fill-emerald-600'
                        : 'fill-rose-600'
                    }`}
                    onMouseEnter={() => setHoveredPoint(p.item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-1 font-mono">
                <span>{history[0]?.date}</span>
                <span>{history[Math.floor(history.length / 2)]?.date}</span>
                <span>{history[history.length - 1]?.date} (Today)</span>
              </div>
            </div>
          </div>

          {/* MAS Official Metadata Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Building className="w-4 h-4 text-slate-600" />
              <span>MAS Regulatory & Benchmark Quotation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">MAS Series Identifier:</span>{' '}
                <span className="font-mono text-slate-800">{currency.masSeriesCode}</span>
              </div>
              <div>
                <span className="text-slate-400">Official Quoting Base:</span>{' '}
                <span className="text-slate-800">
                  {currency.masQuotationUnit === 100
                    ? `Per 100 units (S$ ${(100 / currency.rateToSgd).toFixed(4)} / 100 ${currency.code})`
                    : `Per 1 unit (S$ ${currency.inverseRate.toFixed(4)} / 1 ${currency.code})`}
                </span>
              </div>
              <div>
                <span className="text-slate-400">24-Hour Range:</span>{' '}
                <span className="font-mono text-slate-800">
                  {currency.low24h} – {currency.high24h} {currency.code}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Official End-of-Day Publication:</span>{' '}
                <span className="text-slate-800">17:00 SGT (Mon-Fri)</span>
              </div>
            </div>
          </div>

          {/* S$1,000 Exchange Scenario */}
          <div>
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              S$1,000 Exchange Breakdown Across Singapore Channels
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {comparisons.map((c) => (
                <div key={c.type} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                  <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    {c.estimatedReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
                    <span className="text-[10px] font-normal text-slate-500">{currency.code}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {c.spreadPercent === 0 ? '0% spread' : `~${c.spreadPercent}% spread`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(currency.code)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>{isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCalculator('SGD', currency.code);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open in Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
