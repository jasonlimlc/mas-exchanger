export type CurrencyCategory = 'all' | 'favorites' | 'asean' | 'majors' | 'asia-pacific' | 'americas' | 'europe' | 'middle-east';

export interface CurrencyHistoryPoint {
  date: string;
  rate: number;
}

export interface Currency {
  code: string;
  name: string;
  country: string;
  flag: string;
  symbol: string;
  // Units of Foreign Currency per 1 SGD (e.g. 1 SGD = 3.32 MYR, 1 SGD = 114.50 JPY)
  rateToSgd: number;
  // Inverse: Units of SGD per 1 Foreign Currency (e.g. 1 USD = 1.3325 SGD)
  inverseRate: number;
  change24h: number; // percentage change, e.g. +0.35 or -0.18
  high24h: number;
  low24h: number;
  sparkline7d: number[];
  history30d: CurrencyHistoryPoint[];
  // MAS official quotation convention: some currencies are officially quoted per 100 units
  masQuotationUnit: 1 | 100;
  category: CurrencyCategory;
  isFavorite?: boolean;
  masSeriesCode: string;
  lastUpdated: string;
}

export interface BankRateComparison {
  name: string;
  spreadPercent: number;
  type: 'mid-market' | 'money-changer' | 'multi-currency-card' | 'retail-bank';
  description: string;
  estimatedReceived: number;
  spreadCost: number;
}

export interface MasApiConfig {
  apiKey: string;
  useLiveSimulation: boolean;
  resourceId: string;
  endpointUrl: string;
}
