import React from 'react';
import { Currency } from '../types/currency';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface CorridorHighlightsProps {
  currencies: Currency[];
  onSelectCurrency: (currency: Currency) => void;
  onOpenCalculatorWithPair: (fromCode: string, toCode: string) => void;
}

export const CorridorHighlights: React.FC<CorridorHighlightsProps> = ({
  currencies,
  onSelectCurrency,
  onOpenCalculatorWithPair,
}) => {
  // Select top Singapore corridors
  const corridorCodes = ['MYR', 'JPY', 'USD', 'THB', 'EUR', 'IDR'];
  const corridorCurrencies = corridorCodes
    .map((code) => currencies.find((c) => c.code === code))
    .filter((c): c is Currency => Boolean(c));

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Key Singapore FX Corridors
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Official Mid-Market Benchmark</span>
            <span aria-hidden="true">·</span>
            <span>Refreshed Daily at 17:00 SGT</span>
            <span aria-hidden="true">·</span>
            <span>MAS Quoting Conventions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {corridorCurrencies.map((c) => {
          const isPositive = c.change24h >= 0;
          
          // Generate mini SVG sparkline
          const sparklineMin = Math.min(...c.sparkline7d);
          const sparklineMax = Math.max(...c.sparkline7d);
          const range = sparklineMax - sparklineMin || 1;
          const points = c.sparkline7d
            .map((val, idx) => {
              const x = (idx / (c.sparkline7d.length - 1)) * 60;
              const y = 24 - ((val - sparklineMin) / range) * 18;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <div
              key={c.code}
              onClick={() => onSelectCurrency(c)}
              className="group p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none" role="img" aria-label={c.country}>
                      {c.flag}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      SGD/{c.code}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center text-xs font-semibold tabular-nums ${
                      isPositive ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {c.change24h.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-1">
                  <div className="text-lg font-bold text-slate-900 tabular-nums tracking-tight">
                    {c.rateToSgd > 1000
                      ? c.rateToSgd.toLocaleString('en-SG', { maximumFractionDigits: 0 })
                      : c.rateToSgd.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    1 SGD = {c.symbol} {c.rateToSgd > 1000 ? c.rateToSgd.toFixed(0) : c.rateToSgd.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Sparkline & Quick Convert */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <svg className="w-14 h-5 stroke-2 fill-none overflow-visible" viewBox="0 0 60 24">
                  <polyline
                    points={points}
                    className={isPositive ? 'stroke-emerald-600' : 'stroke-rose-600'}
                  />
                </svg>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCalculatorWithPair('SGD', c.code);
                  }}
                  className="text-[11px] font-medium text-slate-600 hover:text-rose-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                  title={`Convert SGD to ${c.code}`}
                >
                  <span>Calc</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
