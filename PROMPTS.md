# SingaRate - Project Conversation & Prompt History

This document contains the prompt history, requirements, and engineering implementations for the **SingaRate** Singapore Real-Time SGD Exchange Rate Tool and MAS API Gateway integration.

---

## Prompt 1: Core Application & Frontend

### User Prompt
> 1. build a singapore-based exchange rate tool that provides real-time currency conversions for the SGD against global currencies.
> 2. build just the front end for now, i will add the backend integration using MAS API keys later. use a clean UI with search, favorites, and simple calculator

### Implementation Summary
- **Architecture & Design**:
  - Implemented with React 19, TypeScript, and Tailwind CSS following the frontend design constitution (no generic AI slop, single-elevation depth, `font-variant-numeric: tabular-nums` with `JetBrains Mono` and `Plus Jakarta Sans`).
  - Top Bar Contract adhering to single-element brand mark, concise single-line nav links, and primary action.
- **Key Corridors**:
  - Real-time SGD exchange rates for key Singapore travel and trading corridors: **SGD/MYR**, **SGD/JPY**, **SGD/USD**, **SGD/THB**, **SGD/EUR**, **SGD/IDR**.
  - Documented the 1967 Currency Interchangeability Agreement between MAS and Brunei Darussalam Central Bank (BDCB) establishing 1:1 parity between BND and SGD.
- **Interactive Features**:
  - **Live Search & Filter**: Real-time filtering by currency name, ISO code, or country.
  - **Favorites System**: One-click star toggling with browser `localStorage` persistence.
  - **Quotation Toggle**: Direct unit rate (`1 SGD = Foreign`), Inverse rate (`1 Foreign = SGD`), and MAS Official Quotation (displaying JPY, IDR, KRW, TWD, THB per 100 foreign units).
  - **Singapore FX Calculator**: Direct conversion, amount presets ($50, $100, $500, $1,000, $2,500, $5,000 SGD), swap button, calculation history, and channel spread comparisons (Mid-market baseline vs. Raffles Place / Arcade money changers vs. Multi-currency cards vs. Local retail banks).
  - **Travel Wallet Cheat Sheet**: Quick reference conversion matrix for common note denominations (10, 50, 100, 500, 1,000).
  - **Multi-Currency Matrix**: Convert a single SGD budget into all favorite currencies simultaneously.
  - **30-Day Rate Trend Chart Modal**: Interactive SVG trendline with daily hover tooltips and 24h high/low metrics.

---

## Prompt 2: Git Repository Initialization & Initial Push

### User Prompt
> git push ghp_************************************@https://github.com/jasonlimlc/mas-exchanger.git

### Implementation Summary
- Initialized Git repository on branch `main`.
- Added `.gitignore` to prevent tracking of `node_modules/`, `dist/`, `.env*`, and cache folders.
- Staged and committed initial frontend code (`Initial commit: SingaRate - Singapore Real-Time SGD Exchange Rates & FX Calculator`).
- Pushed branch `main` to `https://github.com/jasonlimlc/mas-exchanger.git`.
- Sanitized remote URL configuration to prevent storage of the personal access token in plain text.

---

## Prompt 3: Serverless MAS API Connection & Backend Integration

### User Prompt
> 1. Add a serverless API connection that pulls live data from MAS API catalogue using the following endpoint:
> 
> GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
> # KeyId: <MAS_KEY_ID>
> 
> 2. Store this in /api folder at the project root level not the src folder
> 3. Include a /health.ts and /exchangerates.ts within the same subfolder
> 4. Do not hardcode an API key, I will manually include them

### Implementation Summary
- **Directory Structure**:
  - Placed handlers inside `/api/` at the project root level (decoupled from `/src/`).
- **`/api/health.ts`**:
  - Verifies service availability, system uptime, ISO timestamp, environment, and checks whether `MAS_KEY_ID` is set without exposing credentials.
- **`/api/exchangerates.ts`**:
  - Connects to the MAS APIMG Gateway:
    `GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14`
  - Passes the `KeyId` header as required by the MAS APIMG gateway.
  - Supports dynamic date querying via `?end_of_day=YYYY-MM-DD` (defaults to `2026-10-14`).
  - **Zero hardcoded credentials**: Reads from `process.env.MAS_KEY_ID` (or `MAS_API_KEY_ID`) or accepts request-level `KeyId` header.
- **Full-Stack Runtime**:
  - Configured `server.ts` with Express mounted on port 3000 to serve `/api/health` and `/api/exchangerates` with Vite middleware in development and static asset serving in production.
  - Updated `package.json` scripts (`"dev": "tsx server.ts"`, `"start": "node server.ts"`).
  - Documented `MAS_KEY_ID` in `.env.example`.
- **Frontend Live Probes**:
  - Integrated `src/services/exchangeRateService.ts` to call `/api/exchangerates` while maintaining calibrated fallbacks if key is not yet configured.
  - Added interactive testing probes in `src/components/MasApiModal.tsx` for probing `/api/health` and `/api/exchangerates` in real-time.
- **Committed and Pushed**:
  - Changes committed and pushed to `main` at `https://github.com/jasonlimlc/mas-exchanger.git`.

---

## API Endpoints Reference

### 1. Health Check
- **Route**: `GET /api/health`
- **Headers**: None required
- **Sample Response**:
```json
{
  "status": "ok",
  "service": "singarate-mas-api",
  "timestamp": "2026-10-16T03:58:45.236Z",
  "uptime": 2.23,
  "environment": "development",
  "masKeyConfigured": false,
  "version": "1.0.0"
}
```

### 2. MAS Daily Exchange Rates Proxy
- **Route**: `GET /api/exchangerates?end_of_day=YYYY-MM-DD`
- **Headers**:
  - `KeyId: <MAS_KEY_ID>` (Optional if `MAS_KEY_ID` is defined in server environment)
- **Upstream Target**:
  - `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily`
- **Missing Key Response (HTTP 401)**:
```json
{
  "success": false,
  "apiKeyConfigured": false,
  "message": "MAS_KEY_ID environment variable is not configured. Please configure MAS_KEY_ID in your environment or provide a KeyId header.",
  "requestedEndOfDay": "2026-10-14",
  "upstreamEndpoint": "https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily",
  "instruction": "Add MAS_KEY_ID=\"<your_key_id>\" to your server environment or .env file."
}
```
