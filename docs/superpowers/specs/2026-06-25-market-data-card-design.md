# MarketDataCard Component — Design Spec

**Date:** 2026-06-25
**Ticket:** WEB-2847
**Stack:** Next.js 13+ (Pages Router) · TypeScript · CSS Modules · React

---

## Overview

Build a reusable `MarketDataCard` React component that displays real-time market data for a single trading instrument. The component consumes data from a Next.js API route (`/api/market-data/quote`) that proxies two Finnhub endpoints and one market status endpoint. The component renders in two layout modes — `compact` and `full` — controlled by a single `layout` prop.

Deliverables:
- `MarketDataCard` component (TypeScript, CSS Modules)
- Next.js API route at `/api/market-data/quote`
- Demo page (`pages/index.tsx`) showing both layout variants and both market states
- README with setup instructions and decision log

---

## Project Structure

```
/
├── pages/
│   ├── index.tsx                        # Demo page
│   └── api/
│       └── market-data/
│           └── quote.ts                 # Server-side Finnhub proxy
├── components/
│   └── MarketDataCard/
│       ├── MarketDataCard.tsx           # Main component
│       ├── MarketDataCard.module.css    # CSS Modules
│       └── index.ts                     # Barrel export
├── types/
│   └── market.ts                        # MarketQuote + MarketDataCardProps interfaces
├── lib/
│   └── formatters.ts                    # formatAbbreviated() utility
├── styles/
│   ├── tokens.css                       # CSS custom properties (design tokens)
│   └── globals.css                      # Global resets, imports tokens.css
├── .env.local.example                   # Key template (committed)
└── README.md
```

---

## TypeScript Interfaces

Defined in `types/market.ts`. `volume` is added beyond the brief's spec to satisfy AC #4 (see Decision Log).

```ts
interface MarketQuote {
  symbol: string;
  companyName: string;
  exchange: string;
  price: number;
  priceChange: number | null;
  percentChange: number | null;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  marketCap: number;
  volume: number;
  isMarketOpen: boolean;
}

interface MarketDataCardProps {
  data: MarketQuote;
  layout: 'compact' | 'full';
  isLoading?: boolean;
}
```

---

## API Route

**File:** `pages/api/market-data/quote.ts`
**Endpoint:** `GET /api/market-data/quote?symbol=AAPL`

### Behavior

- Validates that `symbol` query param is present; returns `400` if missing.
- Fires three Finnhub requests in parallel via `Promise.all`:
  1. `GET /api/v1/quote?symbol={SYMBOL}&token={KEY}` — price data
  2. `GET /api/v1/stock/profile2?symbol={SYMBOL}&token={KEY}` — company name, exchange, marketCap
  3. `GET /api/v1/stock/market-status?exchange=US&token={KEY}` — actual market open/closed state
- Returns `500` with a sanitized error message if any Finnhub call fails.
- API key lives in `FINNHUB_KEY` env var (no `NEXT_PUBLIC_` prefix — never sent to the browser).

### Normalization

| Raw Finnhub field | Normalized field | Notes |
|---|---|---|
| `c` | `price` | Current price |
| `d` | `priceChange` | Set to `null` if `!isMarketOpen` |
| `dp` | `percentChange` | Set to `null` if `!isMarketOpen` |
| `h` | `dayHigh` | |
| `l` | `dayLow` | |
| `pc` | `prevClose` | |
| `v` | `volume` | Raw integer — formatted in component |
| `profile.marketCapitalization * 1_000_000` | `marketCap` | Finnhub returns value in millions |
| `marketStatus.isOpen` | `isMarketOpen` | From dedicated Finnhub status endpoint |
| `profile.name` | `companyName` | |
| `profile.exchange` | `exchange` | |

### Normalized Response Shape

```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc",
  "exchange": "NASDAQ NMS - GLOBAL MARKET",
  "price": 189.43,
  "priceChange": 2.17,
  "percentChange": 1.16,
  "dayHigh": 191.05,
  "dayLow": 187.34,
  "prevClose": 187.26,
  "marketCap": 2940000000000,
  "volume": 48239014,
  "isMarketOpen": true
}
```

> `volume` is not in the brief's normalized payload example but is added here — see Decision Log #1.
```

---

## Component Design

**File:** `components/MarketDataCard/MarketDataCard.tsx`

### Rendering Branches

#### 1. Loading State (`isLoading={true}`)

Renders a pulsing skeleton — gray placeholder blocks shaped to mirror the card's real content structure (header block, price block, stats block for `full` layout). Implemented with a CSS `@keyframes` opacity animation — no JS timers, no third-party dependency, no blank white flash.

#### 2. Compact Layout (`layout="compact"`)

```
┌──────────────────────────────────────────┐
│ AAPL  [NASDAQ NMS]         [OPEN/CLOSED] │
│ Apple Inc                                │
├──────────────────────────────────────────┤
│ $189.43          ▲ +2.17 (+1.16%)        │
└──────────────────────────────────────────┘
```

- Stats row (Day High, Day Low, Prev Close, Market Cap, Volume) is **hidden**.
- On mobile (`<768px`): stacks to full width.

#### 3. Full Layout (`layout="full"`)

```
┌──────────────────────────────────────────────────────────┐
│ AAPL  [NASDAQ NMS]                         [OPEN/CLOSED] │
│ Apple Inc                                                │
├──────────────────────────────────────────────────────────┤
│ $189.43                      ▲ +2.17 (+1.16%)           │
├──────────────────────────────────────────────────────────┤
│ Day High     Day Low     Prev Close                      │
│ $191.05      $187.34     $187.26                         │
│                                                          │
│ Market Cap   Volume                                      │
│ $2.94T       48.2M                                       │
└──────────────────────────────────────────────────────────┘
```

- Stats grid: 3-col desktop → 2-col tablet → 1-col mobile.
- Stats row background: `var(--color-surface-gray)`.

### Price Change Display Logic

| Condition | Display | Color |
|---|---|---|
| `priceChange === null` | `—` (em dash) | `var(--color-neutral)` |
| `priceChange > 0` | `▲ +2.17 (+1.16%)` | `var(--color-positive-green)` |
| `priceChange < 0` | `▼ -2.17 (-1.16%)` | `var(--color-negative-red)` |

### Badges

- **Exchange badge:** blue pill (`var(--color-primary-blue)` bg, white text, 11px, 4px border-radius). Shows `exchange` value.
- **Market status badge:** `OPEN` (green bg) or `CLOSED` (gray bg), white text, based on `isMarketOpen`.

---

## Design Tokens

Defined in `styles/tokens.css`, imported once in `pages/_app.tsx`. Used via `var()` in all CSS Modules.

```css
:root {
  --color-primary-blue: #0051A5;
  --color-positive-green: #00AA78;
  --color-negative-red: #DC2626;
  --color-neutral: #6B7280;
  --color-card-bg: #FFFFFF;
  --color-surface-gray: #F7F8FA;
  --color-text-primary: #1A1A2E;
  --color-text-muted: #6B7280;
  --color-border: #DDDDDD;
}
```

---

## Formatters

**File:** `lib/formatters.ts`

`formatAbbreviated(value: number, prefix?: string): string`

| Input | Output |
|---|---|
| `2940000000000`, `'$'` | `$2.94T` |
| `48239014` | `48.2M` |
| `1500000`, `'$'` | `$1.5M` |

Handles T (trillion), B (billion), M (million), K (thousand) thresholds.

---

## Demo Page

**File:** `pages/index.tsx`

- On mount, `useEffect` fetches `/api/market-data/quote?symbol=AAPL`.
- While fetching: renders two `MarketDataCard` components with `isLoading={true}`.
- On resolve: renders:
  - One `compact` card with live data (`isMarketOpen` reflects actual status).
  - One `full` card with the same data but `isMarketOpen: false`, `priceChange: null`, `percentChange: null` — so the closed/null state is always visible regardless of actual market hours.

---

## Decision Log

This section maps directly to the README's "Decisions not explicitly specced" section.

| # | Decision | Alternative Considered | Rationale |
|---|---|---|---|
| 1 | `volume` added to `MarketQuote` interface and API route | Omit it | AC #4 explicitly requires volume formatted as abbreviated number (e.g. 48.2M). The field exists on Finnhub's `/quote` response (`v`) but was omitted from the brief's interface — adding it satisfies the acceptance criterion. |
| 2 | Finnhub market status endpoint (Option A) for `isMarketOpen` | Time-based ET check (Option B) | Time-based check does not account for US market holidays (Christmas, Thanksgiving, MLK Day, etc.) — the market would incorrectly show as OPEN on those days. The Finnhub status endpoint adds one parallel call at no extra latency cost and returns the correct value. |
| 3 | Client-side `useEffect` fetch in demo page (Approach 1) | `getServerSideProps` (Approach 2) | The `isLoading?: boolean` prop in `MarketDataCardProps` implies a client-side loading model. Using `getServerSideProps` would mean the loading state never fires naturally on page load — the prop exists but is never exercised. Approach 1 demonstrates AC #5 authentically. |
| 4 | Pulsing skeleton for loading state | Spinner | The card has known structure — skeleton preserves layout shape and reduces perceived load time better than a spinner. Financial data products consistently use skeleton loaders for data-dense cards. |
| 5 | CSS custom properties for design tokens | Inline styles or repeated hex values | Allows token reuse across CSS Modules without importing — same mental model as Tailwind design tokens. Single source of truth. |
| 6 | Demo closed state derived from live data | Separate API call with different symbol | Simpler, avoids a second network round-trip, and guarantees the closed state is always visible regardless of actual market hours. |

---

## AI Tool Usage Log

*(To be completed in README — record what was prompted, what was kept, what was changed.)*

---

## Acceptance Criteria Checklist

- [ ] 1. All fields from API payload flow through typed props — no hardcoded content
- [ ] 2. Both `compact` and `full` layout modes render via single `layout` prop
- [ ] 3. Price change shows green (positive), red (negative), or `—` (null)
- [ ] 4. Volume and market cap display as formatted abbreviated numbers
- [ ] 5. Loading state implemented — no blank white flash — approach documented
- [ ] 6. Fully typed TypeScript — no `any`, no errors
- [ ] 7. Responsive — compact stacks on mobile `<768px`
- [ ] 8. No console errors on load or interaction
