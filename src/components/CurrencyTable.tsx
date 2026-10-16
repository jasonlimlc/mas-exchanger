import React, { useState, useMemo } from 'react';
import { Currency, CurrencyCategory } from '../types/currency';
import {
  Search,
  Star,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Calculator as CalcIcon,
  X,
  Info,
} from 'lucide-react';

interface CurrencyTableProps {
  currencies: Currency[];
  favoriteCodes: string[];
  onToggleFavorite: (code: string) => void;
  onSelectCurrency: (currency: Currency) => void;
  onOpenCalculatorWithPair: (fromCode: string, toCode: string) => void;
}

type SortField = 'code' | 'name' | 'rate' | 'change';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'direct' | 'inverse' | 'mas';

export const CurrencyTable: React.FC<CurrencyTableProps> = ({
  currencies,
  favoriteCodes,
  onToggleFavorite,
  onSelectCurrency,
  onOpenCalculatorWithPair,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CurrencyCategory>('all');
  const [sortField, setSortField] = useState<SortField>('rate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('direct');

  // Filtered and sorted currencies
  const filteredCurrencies = useMemo(() => {
    let list = currencies.map((c) => ({
      ...c,
      isFavorite: favoriteCodes.includes(c.code),
    }));

    // Category filter
    if (selectedCategory === 'favorites') {
      list = list.filter((c) => c.isFavorite);
    } else if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'code':
          valA = a.code;
          valB = b.code;
          break;
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'rate':
          valA = a.rateToSgd;
          valB = b.rateToSgd;
          break;
        case 'change':
          valA = a.change24h;
          valB = b.change24h;
          break;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return list;
  }, [currencies, favoriteCodes, selectedCategory, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const categories: { id: CurrencyCategory; label: string }[] = [
    { id: 'all', label: 'All Currencies' },
    { id: 'favorites', label: `⭐ Favorites (${favoriteCodes.length})` },
    { id: 'asean', label: 'ASEAN & Neighbors' },
    { id: 'majors', label: 'G10 Majors' },
    { id: 'asia-pacific', label: 'Asia-Pacific' },
    { id: 'europe', label: 'Europe' },
    { id: 'americas', label: 'Americas' },
    { id: 'middle-east', label: 'Middle East' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search currency, code, or country (e.g. MYR, Ringgit, Japan)..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle (Direct vs Inverse vs MAS standard) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 shrink-0">
          <button
            onClick={() => setViewMode('direct')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'direct'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            1 SGD = Foreign
          </button>
          <button
            onClick={() => setViewMode('inverse')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'inverse'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            1 Foreign = SGD
          </button>
          <button
            onClick={() => setViewMode('mas')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
              viewMode === 'mas'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <span>MAS Official</span>
            <Info className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Category Pills / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Brunei Currency Interchangeability Note if relevant */}
      {(selectedCategory === 'all' || selectedCategory === 'asean') && !searchQuery && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <span className="text-base leading-none">🇧🇳</span>
          <div>
            <span className="font-semibold">Currency Interchangeability Agreement:</span> Under the 1967 tripartite pact between MAS and Brunei Darussalam Central Bank (BDCB), the Brunei Dollar (BND) and Singapore Dollar (SGD) are accepted at par (1:1) without exchange fees.
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 tracking-wide">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Favorite</span>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider text-[11px]"
                  >
                    <span>Currency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('rate')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider text-[11px] ml-auto"
                  >
                    <span>
                      {viewMode === 'direct'
                        ? '1 SGD ='
                        : viewMode === 'inverse'
                        ? '1 Unit in SGD'
                        : 'MAS Quote (Per 1 or 100)'}
                    </span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">
                  <span className="uppercase tracking-wider text-[11px]">
                    {viewMode === 'direct' ? '1 Foreign in SGD' : '1 SGD in Foreign'}
                  </span>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('change')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider text-[11px] ml-auto"
                  >
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center hidden md:table-cell">
                  <span className="uppercase tracking-wider text-[11px]">7-Day Trend</span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="uppercase tracking-wider text-[11px]">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-800">No currencies found</p>
                      <p className="text-xs text-slate-500">
                        No currencies match &quot;{searchQuery}&quot;. Try searching for another country or code.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700 underline"
                      >
                        Reset search & filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCurrencies.map((c) => {
                  const isPositive = c.change24h >= 0;

                  // MAS Quote calculation:
                  // If masQuotationUnit === 100, MAS quotes in S$ per 100 foreign units:
                  // e.g. 100 JPY in SGD = (100 / rateToSgd)
                  let displayRate = '';
                  let secondaryRate = '';

                  if (viewMode === 'direct') {
                    displayRate = `${c.symbol} ${
                      c.rateToSgd > 1000
                        ? c.rateToSgd.toLocaleString('en-SG', { maximumFractionDigits: 0 })
                        : c.rateToSgd.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                    }`;
                    secondaryRate = `S$ ${c.inverseRate.toFixed(4)}`;
                  } else if (viewMode === 'inverse') {
                    displayRate = `S$ ${c.inverseRate.toFixed(4)}`;
                    secondaryRate = `${c.symbol} ${
                      c.rateToSgd > 1000 ? c.rateToSgd.toFixed(0) : c.rateToSgd.toFixed(2)
                    }`;
                  } else {
                    // MAS official quote
                    if (c.masQuotationUnit === 100) {
                      const hundredInSgd = (100 / c.rateToSgd).toFixed(4);
                      displayRate = `S$ ${hundredInSgd} / 100 ${c.code}`;
                      secondaryRate = `1 SGD = ${c.rateToSgd.toFixed(2)} ${c.code}`;
                    } else {
                      displayRate = `S$ ${c.inverseRate.toFixed(4)} / 1 ${c.code}`;
                      secondaryRate = `1 SGD = ${c.rateToSgd.toFixed(4)} ${c.code}`;
                    }
                  }

                  // Sparkline points
                  const sparkMin = Math.min(...c.sparkline7d);
                  const sparkMax = Math.max(...c.sparkline7d);
                  const range = sparkMax - sparkMin || 1;
                  const sparkPoints = c.sparkline7d
                    .map((val, idx) => {
                      const x = (idx / (c.sparkline7d.length - 1)) * 64;
                      const y = 20 - ((val - sparkMin) / range) * 16;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <tr
                      key={c.code}
                      onClick={() => onSelectCurrency(c)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Favorite Button */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(c.code);
                        }}
                      >
                        <button
                          type="button"
                          className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                          title={c.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              c.isFavorite
                                ? 'fill-amber-400 text-amber-500'
                                : 'hover:fill-amber-200'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Currency Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none" role="img" aria-label={c.country}>
                            {c.flag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 tracking-tight">
                                {c.code}
                              </span>
                              {c.masQuotationUnit === 100 && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  [MAS 100U]
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-xs">
                              {c.name} · {c.country}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Primary Rate */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          {displayRate}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono sm:hidden">
                          {secondaryRate}
                        </div>
                      </td>

                      {/* Secondary Rate (Desktop) */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-500 tabular-nums hidden sm:table-cell">
                        {secondaryRate}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center text-xs font-semibold tabular-nums ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                          )}
                          {isPositive ? '+' : ''}
                          {c.change24h.toFixed(2)}%
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <svg className="w-16 h-5 stroke-2 fill-none overflow-visible" viewBox="0 0 64 20">
                            <polyline
                              points={sparkPoints}
                              className={isPositive ? 'stroke-emerald-600' : 'stroke-rose-600'}
                            />
                          </svg>
                        </div>
                      </td>

                      {/* Convert Button */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenCalculatorWithPair('SGD', c.code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                          title={`Calculate SGD to ${c.code}`}
                        >
                          <CalcIcon className="w-3 h-3 text-slate-500" />
                          <span className="hidden sm:inline">Calc</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
