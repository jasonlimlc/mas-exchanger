import type { Request, Response } from 'express';

const MAS_CATALOGUE_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export interface ExchangeRatesApiResponse {
  success: boolean;
  source: 'mas-apimg-gw' | 'fallback';
  apiKeyConfigured: boolean;
  requestedEndOfDay?: string;
  data?: unknown;
  count?: number;
  message?: string;
  statusCode?: number;
  error?: string;
}

/**
 * Serverless API handler for Monetary Authority of Singapore (MAS) Daily Exchange Rates
 * Target: GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=YYYY-MM-DD
 * Header: KeyId: <MAS_KEY_ID>
 * 
 * Path: /api/exchangerates
 */
export default async function handler(req: Request, res: Response) {
  // CORS headers for serverless execution
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET to fetch exchange rates.',
    });
  }

  // Retrieve MAS KeyId from environment variables or client request header (no hardcoded keys)
  const envKey = process.env.MAS_KEY_ID || process.env.MAS_API_KEY_ID || process.env.KeyId;
  const headerKey = (req.headers['keyid'] || req.headers['x-api-key']) as string | undefined;
  const masKeyId = envKey || headerKey;

  // Determine requested end_of_day date
  // Allows query parameter ?end_of_day=YYYY-MM-DD, defaults to 2026-10-14 if unspecified
  const requestedDate = (req.query.end_of_day as string) || (req.query.date as string) || '2026-10-14';

  if (!masKeyId || masKeyId.trim().length === 0) {
    return res.status(401).json({
      success: false,
      apiKeyConfigured: false,
      message:
        'MAS_KEY_ID environment variable is not configured. Please configure MAS_KEY_ID in your environment or provide a KeyId header.',
      requestedEndOfDay: requestedDate,
      upstreamEndpoint: MAS_CATALOGUE_ENDPOINT,
      instruction:
        'Add MAS_KEY_ID="<your_key_id>" to your server environment or .env file.',
    });
  }

  try {
    // Build target upstream URL with query parameters
    const targetUrl = new URL(MAS_CATALOGUE_ENDPOINT);
    if (requestedDate) {
      targetUrl.searchParams.set('end_of_day', requestedDate);
    }

    // Forward any optional parameters (limit, sort, offset)
    for (const [key, val] of Object.entries(req.query)) {
      if (key !== 'end_of_day' && key !== 'date' && typeof val === 'string') {
        targetUrl.searchParams.set(key, val);
      }
    }

    // Request MAS API Gateway
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'SingaRate-MAS-Client/1.0',
      'KeyId': masKeyId.trim(),
    };

    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
    });

    const responseText = await upstreamResponse.text();

    let responseData: unknown = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        success: false,
        source: 'mas-apimg-gw',
        apiKeyConfigured: true,
        statusCode: upstreamResponse.status,
        message: `MAS API Gateway responded with HTTP status ${upstreamResponse.status}`,
        error: responseData,
        requestedUrl: targetUrl.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      source: 'mas-apimg-gw',
      apiKeyConfigured: true,
      requestedEndOfDay: requestedDate,
      data: responseData,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown network failure while querying MAS API';
    return res.status(502).json({
      success: false,
      source: 'mas-apimg-gw',
      apiKeyConfigured: true,
      message: 'Failed to communicate with MAS API catalogue upstream',
      error: errorMsg,
    });
  }
}
