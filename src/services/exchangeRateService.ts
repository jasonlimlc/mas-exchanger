import { BankRateComparison, Currency, MasApiConfig } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

const FAVORITES_STORAGE_KEY = 'singarate_favorites';
const MAS_CONFIG_STORAGE_KEY = 'singarate_mas_config';
const CALC_HISTORY_STORAGE_KEY = 'singarate_calc_history';

// Official MAS API resource endpoint metadata
export const MAS_API_RESOURCE_ID = '95932927-c8bc-4e7a-b44e-e6d70cc6e40f';
export const MAS_API_BASE_URL = 'https://eservices.mas.gov.sg/api/action/datastore/search.json';

export interface CalculationHistoryItem {
  id: string;
  fromCode: string;
  toCode: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: number;
}

export function getSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  // Default favorites for Singapore users
  return ['MYR', 'USD', 'JPY', 'THB', 'EUR', 'GBP', 'AUD', 'IDR', 'CNY', 'KRW'];
}

export function saveFavorites(favs: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
}

export function getMasConfig(): MasApiConfig {
  try {
    const raw = localStorage.getItem(MAS_CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    apiKey: '',
    useLiveSimulation: true,
    resourceId: MAS_API_RESOURCE_ID,
    endpointUrl: `${MAS_API_BASE_URL}?resource_id=${MAS_API_RESOURCE_ID}&limit=100`,
  };
}

export function saveMasConfig(config: MasApiConfig): void {
  try {
    localStorage.setItem(MAS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function getCalcHistory(): CalculationHistoryItem[] {
  try {
    const raw = localStorage.getItem(CALC_HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveCalcHistory(history: CalculationHistoryItem[]): void {
  try {
    localStorage.setItem(CALC_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
  } catch {
    // ignore
  }
}

/**
 * Cross-currency conversion calculation
 * RateToSgd represents: Foreign units for 1 SGD.
 * Example:
 * 1 SGD = 3.3245 MYR
 * 1 SGD = 0.7512 USD
 * To convert 100 USD to MYR: (100 / 0.7512) * 3.3245 = 442.56 MYR
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): { convertedAmount: number; directRate: number } {
  if (isNaN(amount) || amount <= 0) {
    return { convertedAmount: 0, directRate: 0 };
  }

  if (fromCurrency.code === toCurrency.code) {
    return { convertedAmount: amount, directRate: 1 };
  }

  // Convert From -> SGD amount
  const amountInSgd = fromCurrency.code === 'SGD'
    ? amount
    : amount / fromCurrency.rateToSgd;

  // Convert SGD amount -> To
  const finalAmount = toCurrency.code === 'SGD'
    ? amountInSgd
    : amountInSgd * toCurrency.rateToSgd;

  // Direct rate: 1 From = X To
  const directRate = finalAmount / amount;

  return {
    convertedAmount: finalAmount,
    directRate,
  };
}

/**
 * Calculate bank vs money changer retail spreads
 * Common Singapore market standards:
 * - Mid-market rate: Official benchmark (MAS / Interbank)
 * - Singapore Money Changers (The Arcade, Raffles Place, People's Park): ~0.8% spread
 * - Multi-Currency Cards (YouTrip, Revolut, Trust): ~1.2% - 1.5% spread
 * - Singapore Local Banks (DBS, OCBC, UOB FX spread): ~2.4% - 2.8% spread
 */
export function getBankRateComparisons(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): BankRateComparison[] {
  const { convertedAmount: midMarketConverted } = convertCurrency(amount, fromCurrency, toCurrency);

  return [
    {
      name: 'MAS Benchmark / Mid-Market',
      spreadPercent: 0,
      type: 'mid-market',
      description: 'Official interbank baseline (0% markup)',
      estimatedReceived: midMarketConverted,
      spreadCost: 0,
    },
    {
      name: 'Raffles Place Money Changers',
      spreadPercent: 0.8,
      type: 'money-changer',
      description: 'Typical physical cash spread at The Arcade / Lucky Plaza (~0.8%)',
      estimatedReceived: midMarketConverted * (1 - 0.008),
      spreadCost: midMarketConverted * 0.008,
    },
    {
      name: 'Multi-Currency Card (YouTrip / Trust)',
      spreadPercent: 1.25,
      type: 'multi-currency-card',
      description: 'Digital travel debit card rate (~1.25% network FX margin)',
      estimatedReceived: midMarketConverted * (1 - 0.0125),
      spreadCost: midMarketConverted * 0.0125,
    },
    {
      name: 'Local SG Retail Bank (DBS / OCBC / UOB)',
      spreadPercent: 2.65,
      type: 'retail-bank',
      description: 'Standard retail counter / debit exchange spread (~2.65%)',
      estimatedReceived: midMarketConverted * (1 - 0.0265),
      spreadCost: midMarketConverted * 0.0265,
    },
  ];
}

/**
 * MAS API Request simulation / real fetch helper
 * When user configures backend or API keys, this can connect directly
 */
/**
 * Query the serverless health endpoint
 */
export async function checkHealthApi(): Promise<{
  status: string;
  masKeyConfigured: boolean;
  uptime: number;
  environment: string;
}> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return {
    status: 'unavailable',
    masKeyConfigured: false,
    uptime: 0,
    environment: 'development',
  };
}

/**
 * Fetch live data from the serverless /api/exchangerates endpoint
 * (queries the MAS APIMG catalogue upstream)
 */
export async function fetchMasExchangeRates(config?: MasApiConfig): Promise<{
  success: boolean;
  currencies: Currency[];
  lastUpdated: string;
  source: 'mas-live' | 'simulation';
  apiKeyConfigured?: boolean;
  error?: string;
}> {
  const activeConfig = config || getMasConfig();

  try {
    // Query our serverless backend route
    const backendHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (activeConfig.apiKey && activeConfig.apiKey.trim().length > 0) {
      backendHeaders['KeyId'] = activeConfig.apiKey.trim();
    }

    const response = await fetch('/api/exchangerates?end_of_day=2026-10-14', {
      headers: backendHeaders,
    });

    const result = await response.json().catch(() => null);

    if (response.ok && result && result.success && result.data) {
      // MAS Catalogue returned live records
      const rawRecords = Array.isArray(result.data?.result?.records)
        ? result.data.result.records
        : Array.isArray(result.data?.records)
        ? result.data.records
        : Array.isArray(result.data)
        ? result.data
        : [result.data];

      const latestRecord = rawRecords[0] || {};

      // Map MAS catalogue fields to our currencies
      // Standard MAS fields: usd_sgd, sgd_myr, sgd_jpy_100, sgd_thb_100, etc.
      const updatedCurrencies = INITIAL_CURRENCIES.map((c) => {
        let liveRate = c.rateToSgd;
        const code = c.code.toLowerCase();

        // Check common MAS field formats
        if (latestRecord[`sgd_${code}`] !== undefined) {
          liveRate = parseFloat(latestRecord[`sgd_${code}`]) || liveRate;
        } else if (latestRecord[`sgd_${code}_100`] !== undefined) {
          // per 100 units -> convert to per unit
          liveRate = (parseFloat(latestRecord[`sgd_${code}_100`]) / 100) || liveRate;
        } else if (latestRecord[`${code}_sgd`] !== undefined) {
          // inverse: X foreign = Y SGD -> 1 SGD = 1 / Y foreign
          const inv = parseFloat(latestRecord[`${code}_sgd`]);
          if (inv > 0) liveRate = Number((1 / inv).toFixed(4));
        }

        return {
          ...c,
          rateToSgd: liveRate,
          inverseRate: Number((1 / liveRate).toFixed(6)),
          lastUpdated: `MAS Live: ${result.requestedEndOfDay || '14 Oct 2026'}`,
        };
      });

      return {
        success: true,
        currencies: updatedCurrencies,
        lastUpdated: `MAS Live (${result.requestedEndOfDay || '14 Oct 2026'})`,
        source: 'mas-live',
        apiKeyConfigured: true,
      };
    }

    // If key not configured yet or upstream returned status
    const apiKeyConfigured = result?.apiKeyConfigured === true;
    const errorMsg = result?.message || `Endpoint returned status ${response.status}`;

    // Gracefully jitter rates to reflect simulated live ticks while preserving UI completeness
    const simulated = INITIAL_CURRENCIES.map((c) => {
      const jitter = (Math.random() - 0.48) * 0.0008 * c.rateToSgd;
      const newRate = Number((c.rateToSgd + jitter).toFixed(c.rateToSgd > 50 ? 2 : 4));
      return {
        ...c,
        rateToSgd: newRate,
        inverseRate: Number((1 / newRate).toFixed(6)),
      };
    });

    const now = new Date();
    const formatted = `${now.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} SGT`;

    return {
      success: true,
      currencies: simulated,
      lastUpdated: formatted,
      source: 'simulation',
      apiKeyConfigured,
      error: apiKeyConfigured ? errorMsg : 'MAS_KEY_ID awaiting manual configuration in environment',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network failure calling /api/exchangerates';
    return {
      success: true,
      currencies: INITIAL_CURRENCIES,
      lastUpdated: '15 Oct 2026, 17:00 SGT',
      source: 'simulation',
      apiKeyConfigured: false,
      error: msg,
    };
  }
}
