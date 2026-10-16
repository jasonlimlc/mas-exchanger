import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptime: number;
  environment: string;
  masKeyConfigured: boolean;
  version: string;
}

/**
 * Serverless health check endpoint
 * Path: /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Support CORS for serverless deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const masKey = process.env.MAS_KEY_ID || process.env.MAS_API_KEY_ID || process.env.KeyId;
  const isKeyConfigured = Boolean(masKey && masKey.trim().length > 0);

  const payload: HealthResponse = {
    status: 'ok',
    service: 'singarate-mas-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    masKeyConfigured: isKeyConfigured,
    version: '1.0.0',
  };

  return res.status(200).json(payload);
}
