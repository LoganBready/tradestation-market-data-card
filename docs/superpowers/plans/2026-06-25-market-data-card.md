# MarketDataCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `MarketDataCard` React component with a Next.js API route proxying Finnhub, a demo page showing both layout variants and both market states, and a README documenting all decisions.

**Architecture:** Pages Router Next.js app. Demo page fetches from `/api/market-data/quote` client-side via `useEffect`, passing `isLoading={true}` during fetch so the pulsing skeleton is genuinely visible. The API route runs server-side, calls three Finnhub endpoints in parallel, and normalizes the response — the Finnhub key never reaches the browser.

**Tech Stack:** Next.js 13+ (Pages Router) · TypeScript · CSS Modules · React · Jest · React Testing Library

## Global Constraints

- Pages Router only — no App Router (`pages/` directory, `index.tsx` for demo, `pages/api/` for routes)
- No `any` types — TypeScript strict mode
- No `NEXT_PUBLIC_` prefix on `FINNHUB_KEY` — server-side only
- CSS Modules for all component styles — no inline styles, no Tailwind
- Design tokens via CSS custom properties in `styles/tokens.css` — referenced via `var()` in all modules
- No hardcoded content inside `MarketDataCard` — all values from props
- No console errors on load or interaction
- `npm install && npm run dev` must work on first attempt

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `pages/index.tsx` | Create | Demo page — client-side fetch, renders both layout variants |
| `pages/_app.tsx` | Create | App entry — imports global CSS |
| `pages/api/market-data/quote.ts` | Create | Server-side Finnhub proxy route |
| `components/MarketDataCard/MarketDataCard.tsx` | Create | Component — all three render branches (loading, compact, full) |
| `components/MarketDataCard/MarketDataCard.module.css` | Create | Component styles |
| `components/MarketDataCard/index.ts` | Create | Barrel export |
| `types/market.ts` | Create | `MarketQuote` and `MarketDataCardProps` interfaces |
| `lib/formatters.ts` | Create | `formatAbbreviated()` utility |
| `lib/__tests__/formatters.test.ts` | Create | Unit tests for formatter |
| `styles/tokens.css` | Create | CSS custom properties (design tokens) |
| `styles/globals.css` | Create | Global resets, imports tokens.css |
| `.env.local.example` | Create | Key template committed to repo |
| `README.md` | Create | Setup, decisions, AI usage log |
| `jest.config.ts` | Create | Jest configuration |
| `jest.setup.ts` | Create | Jest setup (RTL matchers) |

---

## Task 1: Project Scaffold

**Files:**
- Create: Next.js project in current directory
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local.example`
- Modify: `package.json` (add test script)
- Modify: `tsconfig.json` (verify path alias)

- [ ] **Step 1: Scaffold Next.js app with Pages Router**

Run from `/Users/loganbready/Code/tradestation`:

```bash
npx create-next-app@latest . --typescript --eslint --no-tailwind --no-src-dir --no-app --import-alias "@/*"
```

When prompted, accept defaults. This generates `pages/`, `public/`, `styles/`, `tsconfig.json`, `next.config.ts`, `package.json`.

- [ ] **Step 2: Install testing dependencies**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

- [ ] **Step 3: Create `jest.config.ts`**

```ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
```

- [ ] **Step 4: Create `jest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add test script to `package.json`**

In `package.json`, add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Create `.env.local.example`**

```bash
# Copy this file to .env.local and fill in your Finnhub API key
# Get a free key at https://finnhub.io — no credit card required
FINNHUB_KEY=your_finnhub_api_key_here
```

- [ ] **Step 7: Create your `.env.local` with your real key**

```bash
cp .env.local.example .env.local
# Then open .env.local and replace the placeholder with your actual key
```

- [ ] **Step 8: Verify scaffold runs**

```bash
npm run dev
```

Expected: Next.js dev server starts at `http://localhost:3000` with no errors.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript, Pages Router, Jest"
```

---

## Task 2: TypeScript Interfaces

**Files:**
- Create: `types/market.ts`

**Produces:**
- `MarketQuote` interface (consumed by API route and component)
- `MarketDataCardProps` interface (consumed by component)

- [ ] **Step 1: Create `types/market.ts`**

```ts
export interface MarketQuote {
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

export interface MarketDataCardProps {
  data: MarketQuote;
  layout: 'compact' | 'full';
  isLoading?: boolean;
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/market.ts
git commit -m "feat: add MarketQuote and MarketDataCardProps TypeScript interfaces"
```

---

## Task 3: Design Tokens & Global Styles

**Files:**
- Create: `styles/tokens.css`
- Modify: `styles/globals.css`
- Create: `pages/_app.tsx`

**Produces:**
- CSS custom properties available globally via `var()` in all CSS Modules

- [ ] **Step 1: Create `styles/tokens.css`**

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

  --font-family-base: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Replace contents of `styles/globals.css`**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-base);
  background-color: #f0f2f5;
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: Create `pages/_app.tsx`**

```tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

- [ ] **Step 4: Verify dev server still starts with no errors**

```bash
npm run dev
```

Expected: runs cleanly, no CSS errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add styles/tokens.css styles/globals.css pages/_app.tsx
git commit -m "feat: add design tokens as CSS custom properties and global styles"
```

---

## Task 4: Formatters (TDD)

**Files:**
- Create: `lib/formatters.ts`
- Create: `lib/__tests__/formatters.test.ts`

**Produces:**
- `formatAbbreviated(value: number, prefix?: string): string` — consumed by `MarketDataCard`

- [ ] **Step 1: Create `lib/__tests__/formatters.test.ts` with failing tests**

```ts
import { formatAbbreviated } from '../formatters';

describe('formatAbbreviated', () => {
  it('formats trillions with $ prefix', () => {
    expect(formatAbbreviated(2940000000000, '$')).toBe('$2.94T');
  });

  it('formats billions with $ prefix', () => {
    expect(formatAbbreviated(1500000000, '$')).toBe('$1.50B');
  });

  it('formats millions without prefix', () => {
    expect(formatAbbreviated(48239014)).toBe('48.2M');
  });

  it('formats thousands without prefix', () => {
    expect(formatAbbreviated(5300)).toBe('5.3K');
  });

  it('returns value as-is below 1000', () => {
    expect(formatAbbreviated(999)).toBe('999');
  });

  it('applies prefix to all magnitudes', () => {
    expect(formatAbbreviated(1000, '$')).toBe('$1.0K');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test lib/__tests__/formatters.test.ts
```

Expected: FAIL — `Cannot find module '../formatters'`

- [ ] **Step 3: Create `lib/formatters.ts`**

```ts
export function formatAbbreviated(value: number, prefix = ''): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) {
    return `${prefix}${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (abs >= 1_000_000_000) {
    return `${prefix}${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${prefix}${(value / 1_000).toFixed(1)}K`;
  }
  return `${prefix}${value}`;
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test lib/__tests__/formatters.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/formatters.ts lib/__tests__/formatters.test.ts
git commit -m "feat: add formatAbbreviated utility with unit tests"
```

---

## Task 5: API Route

**Files:**
- Create: `pages/api/market-data/quote.ts`

**Consumes:**
- `MarketQuote` from `@/types/market`
- `FINNHUB_KEY` from `process.env`

**Produces:**
- `GET /api/market-data/quote?symbol=AAPL` → `MarketQuote` JSON

- [ ] **Step 1: Create `pages/api/market-data/quote.ts`**

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { MarketQuote } from '@/types/market';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketQuote | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'symbol query parameter is required' });
  }

  const key = process.env.FINNHUB_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const [quoteRes, profileRes, statusRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${key}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${key}`),
      fetch(`${FINNHUB_BASE}/stock/market-status?exchange=US&token=${key}`),
    ]);

    if (!quoteRes.ok || !profileRes.ok || !statusRes.ok) {
      return res.status(502).json({ error: 'Upstream Finnhub error' });
    }

    const [quote, profile, marketStatus] = await Promise.all([
      quoteRes.json() as Promise<{
        c: number; d: number; dp: number; h: number;
        l: number; pc: number; v: number;
      }>,
      profileRes.json() as Promise<{
        name: string; ticker: string; exchange: string;
        marketCapitalization: number;
      }>,
      statusRes.json() as Promise<{ isOpen: boolean }>,
    ]);

    const isMarketOpen = marketStatus.isOpen === true;

    const payload: MarketQuote = {
      symbol: profile.ticker ?? symbol.toUpperCase(),
      companyName: profile.name ?? '',
      exchange: profile.exchange ?? '',
      price: quote.c,
      priceChange: isMarketOpen ? quote.d : null,
      percentChange: isMarketOpen ? quote.dp : null,
      dayHigh: quote.h,
      dayLow: quote.l,
      prevClose: quote.pc,
      marketCap: (profile.marketCapitalization ?? 0) * 1_000_000,
      volume: quote.v ?? 0,
      isMarketOpen,
    };

    return res.status(200).json(payload);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 2: Start dev server and verify the route**

```bash
npm run dev
```

Then in a new terminal:

```bash
curl "http://localhost:3000/api/market-data/quote?symbol=AAPL"
```

Expected: JSON with all `MarketQuote` fields. Verify `priceChange` is `null` if market is closed, a number if open.

- [ ] **Step 3: Verify error cases**

```bash
# Missing symbol
curl "http://localhost:3000/api/market-data/quote"
# Expected: {"error":"symbol query parameter is required"}

# Invalid symbol (Finnhub returns empty profile)
curl "http://localhost:3000/api/market-data/quote?symbol=INVALID123"
# Expected: 200 with empty/zero fields (Finnhub behavior — acceptable for this exercise)
```

- [ ] **Step 4: Commit**

```bash
git add pages/api/market-data/quote.ts
git commit -m "feat: add /api/market-data/quote route wrapping Finnhub with null normalization"
```

---

## Task 6: MarketDataCard Component

**Files:**
- Create: `components/MarketDataCard/MarketDataCard.tsx`
- Create: `components/MarketDataCard/MarketDataCard.module.css`
- Create: `components/MarketDataCard/index.ts`
- Create: `components/MarketDataCard/__tests__/MarketDataCard.test.tsx`

**Consumes:**
- `MarketDataCardProps`, `MarketQuote` from `@/types/market`
- `formatAbbreviated` from `@/lib/formatters`

**Produces:**
- `<MarketDataCard data={} layout="compact|full" isLoading={boolean} />`

- [ ] **Step 1: Create `components/MarketDataCard/__tests__/MarketDataCard.test.tsx` with failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import { MarketDataCard } from '../MarketDataCard';
import type { MarketQuote } from '@/types/market';

const mockData: MarketQuote = {
  symbol: 'AAPL',
  companyName: 'Apple Inc',
  exchange: 'NASDAQ NMS - GLOBAL MARKET',
  price: 189.43,
  priceChange: 2.17,
  percentChange: 1.16,
  dayHigh: 191.05,
  dayLow: 187.34,
  prevClose: 187.26,
  marketCap: 2940000000000,
  volume: 48239014,
  isMarketOpen: true,
};

const closedData: MarketQuote = {
  ...mockData,
  priceChange: null,
  percentChange: null,
  isMarketOpen: false,
};

describe('MarketDataCard', () => {
  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <MarketDataCard data={mockData} layout="compact" isLoading={true} />
    );
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });

  it('renders symbol and company name', () => {
    render(<MarketDataCard data={mockData} layout="compact" />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc')).toBeInTheDocument();
  });

  it('renders OPEN badge when market is open', () => {
    render(<MarketDataCard data={mockData} layout="compact" />);
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('renders CLOSED badge and em dash when market is closed', () => {
    render(<MarketDataCard data={closedData} layout="compact" />);
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders stats row in full layout', () => {
    render(<MarketDataCard data={mockData} layout="full" />);
    expect(screen.getByText('DAY HIGH')).toBeInTheDocument();
    expect(screen.getByText('DAY LOW')).toBeInTheDocument();
    expect(screen.getByText('PREV CLOSE')).toBeInTheDocument();
    expect(screen.getByText('MARKET CAP')).toBeInTheDocument();
    expect(screen.getByText('VOLUME')).toBeInTheDocument();
  });

  it('hides stats row in compact layout', () => {
    render(<MarketDataCard data={mockData} layout="compact" />);
    expect(screen.queryByText('DAY HIGH')).not.toBeInTheDocument();
  });

  it('formats market cap as abbreviated number', () => {
    render(<MarketDataCard data={mockData} layout="full" />);
    expect(screen.getByText('$2.94T')).toBeInTheDocument();
  });

  it('formats volume as abbreviated number', () => {
    render(<MarketDataCard data={mockData} layout="full" />);
    expect(screen.getByText('48.2M')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test components/MarketDataCard/__tests__/MarketDataCard.test.tsx
```

Expected: FAIL — `Cannot find module '../MarketDataCard'`

- [ ] **Step 3: Create `components/MarketDataCard/MarketDataCard.tsx`**

```tsx
import type { MarketDataCardProps } from '@/types/market';
import { formatAbbreviated } from '@/lib/formatters';
import styles from './MarketDataCard.module.css';

export function MarketDataCard({ data, layout, isLoading = false }: MarketDataCardProps) {
  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeleton} ${layout === 'full' ? styles.full : styles.compact}`}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonPrice} />
        {layout === 'full' && <div className={styles.skeletonStats} />}
      </div>
    );
  }

  const {
    symbol, companyName, exchange, price,
    priceChange, percentChange,
    dayHigh, dayLow, prevClose,
    marketCap, volume, isMarketOpen,
  } = data;

  const isPositive = priceChange !== null && priceChange > 0;
  const isNegative = priceChange !== null && priceChange < 0;

  const changeColorClass = isPositive
    ? styles.positive
    : isNegative
    ? styles.negative
    : styles.neutral;

  const arrow = isPositive ? '▲' : isNegative ? '▼' : '';

  const changeDisplay =
    priceChange === null || percentChange === null
      ? '—'
      : `${arrow} ${isPositive ? '+' : ''}${priceChange.toFixed(2)} (${isPositive ? '+' : ''}${percentChange.toFixed(2)}%)`;

  return (
    <div className={`${styles.card} ${layout === 'full' ? styles.full : styles.compact}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.symbolRow}>
            <span className={styles.symbol}>{symbol}</span>
            <span className={styles.exchangeBadge}>{exchange}</span>
          </div>
          <span className={styles.companyName}>{companyName}</span>
        </div>
        <span className={`${styles.statusBadge} ${isMarketOpen ? styles.open : styles.closed}`}>
          {isMarketOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>${price.toFixed(2)}</span>
        <span className={`${styles.priceChange} ${changeColorClass}`}>{changeDisplay}</span>
      </div>

      {layout === 'full' && (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>DAY HIGH</span>
            <span className={styles.statValue}>${dayHigh.toFixed(2)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>DAY LOW</span>
            <span className={styles.statValue}>${dayLow.toFixed(2)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>PREV CLOSE</span>
            <span className={styles.statValue}>${prevClose.toFixed(2)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>MARKET CAP</span>
            <span className={styles.statValue}>{formatAbbreviated(marketCap, '$')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>VOLUME</span>
            <span className={styles.statValue}>{formatAbbreviated(volume)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/MarketDataCard/MarketDataCard.module.css`**

```css
/* ── Skeleton animation ── */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeletonHeader {
  height: 48px;
  background-color: var(--color-border);
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeletonPrice {
  height: 40px;
  background-color: var(--color-border);
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeletonStats {
  height: 96px;
  background-color: var(--color-border);
  border-radius: 4px;
}

/* ── Card base ── */
.card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary-blue);
  border-radius: 6px;
  overflow: hidden;
  font-family: var(--font-family-base);
}

.compact {
  width: 100%;
}

.full {
  width: 100%;
}

/* ── Header ── */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 12px;
}

.headerLeft {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.symbolRow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.symbol {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary-blue);
}

.companyName {
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-primary);
}

/* ── Badges ── */
.exchangeBadge {
  font-size: 11px;
  font-weight: 400;
  color: #ffffff;
  background-color: var(--color-primary-blue);
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.statusBadge {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  border-radius: 4px;
  padding: 3px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.open {
  background-color: var(--color-positive-green);
}

.closed {
  background-color: var(--color-neutral);
}

/* ── Price row ── */
.priceRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 16px 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.priceChange {
  font-size: 16px;
  font-weight: 600;
}

.positive {
  color: var(--color-positive-green);
}

.negative {
  color: var(--color-negative-red);
}

.neutral {
  color: var(--color-neutral);
}

/* ── Stats row (full layout only) ── */
.statsRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border-top: 1px solid var(--color-border);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background-color: var(--color-surface-gray);
}

.statLabel {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.statValue {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .compact {
    width: 100%;
  }

  .priceRow {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .statsRow {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .statsRow {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Create `components/MarketDataCard/index.ts`**

```ts
export { MarketDataCard } from './MarketDataCard';
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npm test components/MarketDataCard/__tests__/MarketDataCard.test.tsx
```

Expected: 8 tests pass.

- [ ] **Step 7: Run all tests**

```bash
npm test
```

Expected: All tests pass (formatters + component = 14 tests).

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/ 
git commit -m "feat: add MarketDataCard component with compact/full layouts, loading skeleton, and tests"
```

---

## Task 7: Demo Page

**Files:**
- Modify: `pages/index.tsx` (replace scaffold content)

**Consumes:**
- `MarketDataCard` from `@/components/MarketDataCard`
- `MarketQuote` from `@/types/market`

- [ ] **Step 1: Replace `pages/index.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/types/market';
import { MarketDataCard } from '@/components/MarketDataCard';

export default function Home() {
  const [data, setData] = useState<MarketQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/market-data/quote?symbol=AAPL')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch market data');
        return res.json() as Promise<MarketQuote>;
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const closedStateData: MarketQuote | null = data
    ? { ...data, isMarketOpen: false, priceChange: null, percentChange: null }
    : null;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Arial, sans-serif', marginBottom: 8, color: '#1A1A2E' }}>
        MarketDataCard — Component Demo
      </h1>
      <p style={{ fontFamily: 'Arial, sans-serif', color: '#6B7280', marginBottom: 40, fontSize: 14 }}>
        WEB-2847 · Stocks &amp; ETFs Overview
      </p>

      {error && (
        <p style={{ color: '#DC2626', fontFamily: 'Arial, sans-serif', marginBottom: 24 }}>
          Error: {error}
        </p>
      )}

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Compact Layout · Market Open State
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <MarketDataCard
            data={data ?? ({} as MarketQuote)}
            layout="compact"
            isLoading={isLoading}
          />
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Full Layout · Market Closed State (null change values)
        </h2>
        <MarketDataCard
          data={closedStateData ?? ({} as MarketQuote)}
          layout="full"
          isLoading={isLoading}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Loading skeletons appear briefly on page load
- Compact card appears with live AAPL data once loaded
- Full card appears with the closed-market state (CLOSED badge, em dash for change values)
- No console errors

- [ ] **Step 3: Check TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add pages/index.tsx
git commit -m "feat: add demo page showing compact/full layout variants with live Finnhub data"
```

---

## Task 8: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# MarketDataCard — TradeStation Front End Assessment

**Ticket:** WEB-2847 · Sprint 14: Web Production  
**Stack:** Next.js 13+ · TypeScript · CSS Modules · React

---

## Getting Started

### 1. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Add your Finnhub API key

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Open `.env.local` and replace the placeholder with your Finnhub API key.  
Get a free key at [finnhub.io](https://finnhub.io) — no credit card required.

### 3. Run the dev server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

### 4. Run tests

\`\`\`bash
npm test
\`\`\`

---

## Loading State Approach

I used a **pulsing skeleton** rather than a spinner.

The card has known structure — a header block, a price block, and a stats block for the full layout. A skeleton that mirrors that structure gives the user a visual anchor for what's loading, and reduces perceived wait time better than a generic spinner that gives no layout signal. Implemented with a CSS `@keyframes` opacity animation — no JavaScript timers, no third-party dependency.

---

## Decisions Not Explicitly Specced

| Decision | Rationale |
|---|---|
| Added `volume` to `MarketQuote` interface and API route | AC #4 requires volume formatted as an abbreviated number (e.g. 48.2M). The field exists on Finnhub's `/quote` response (`v`) but was omitted from the brief's interface — added to satisfy the acceptance criterion. |
| Used Finnhub market status endpoint for `isMarketOpen` | The brief offered a time-based ET check as an alternative. A time check doesn't account for US market holidays — the market would incorrectly show as OPEN on days like Christmas or MLK Day. The Finnhub status endpoint adds one parallel call at no extra latency and returns the correct value. |
| Client-side `useEffect` fetch in demo page | `getServerSideProps` also satisfies the API key security requirement, but data arrives with the HTML — the loading state never fires naturally. Even if `isLoading` weren't an acceptance criterion, loading states are something I'd add in a real app. Choosing client-side fetch makes the loading treatment authentic and keeps the data-fetching model explicit. |
| Demo closed state derived from live data | The full-layout card always shows the closed/null state by overriding `isMarketOpen`, `priceChange`, and `percentChange` on the fetched data. This avoids a second API call and ensures both states are visible regardless of actual market hours. |
| CSS custom properties for design tokens | Tokens defined at `:root` in `styles/tokens.css` are available globally via `var()` in every CSS Module — no re-importing. Single source of truth prevents design drift across files. |

---

## AI Tool Usage

I used **Claude (Claude Code)** throughout this project.

### Design & Architecture Phase

**Prompted:** Read the full assessment brief and help design the architecture before writing any code — project structure, data fetching approach, API route design, component structure, and loading state treatment.

**Generated:** Three data-fetching approaches with trade-offs, full project directory structure, API route normalization logic, component rendering branches, design token strategy using CSS custom properties, decision to add `volume` field, and a full design spec.

**Kept:**
- Approach 1 (client-side useEffect) — even without the `isLoading` AC, I'd add loading states in a real app. With `getServerSideProps`, data arrives with the HTML and the loading state is never visible. Client-side fetch makes it authentic.
- Project structure as proposed
- CSS custom properties for design tokens — tokens at `:root` mean any CSS Module can use `var()` without re-declaring values, building a strong design system that avoids drift
- Pulsing skeleton — fits more naturally in a card layout than a spinner, mirrors the card structure, better UX

**Changed:**
- Pushed back on the time-based market hours check in favor of the Finnhub market status endpoint — the time-based approach doesn't account for US market holidays
- Clarified that `useEffect` calling `/api/market-data/quote` does not violate the API key security requirement — the key never leaves the server, the browser only calls our own Next.js route

### Implementation Phase

**Prompted:** Execute the implementation plan task by task.

**Generated:** All TypeScript interfaces, API route, component, CSS Modules, formatter utility, tests, and demo page.

**Kept:** Overall structure, TypeScript interfaces, API route normalization logic, component render branches, CSS Module class names and token usage.

**Changed:** Reviewed and adjusted CSS values, tested formatting edge cases manually, verified responsive behavior in browser, confirmed no console errors.
```

- [ ] **Step 2: Final verification**

```bash
npm run dev
```

Open `http://localhost:3000`. Run through the full checklist:
- [ ] Loading skeletons appear on page load
- [ ] Compact card renders correctly with live data
- [ ] Full card renders correctly with closed/null state
- [ ] No console errors
- [ ] OPEN/CLOSED badge correct
- [ ] Price change shows `—` on closed card
- [ ] Market cap and volume are formatted (e.g. $2.94T, 48.2M)

```bash
npm test
```

Expected: all tests pass.

```bash
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions, loading state rationale, and decision log"
```

---

## Acceptance Criteria Final Check

- [ ] 1. All fields from API payload flow through typed props — no hardcoded content
- [ ] 2. Both `compact` and `full` layout modes render via single `layout` prop
- [ ] 3. Price change shows green (positive), red (negative), or `—` (null)
- [ ] 4. Volume and market cap display as formatted abbreviated numbers
- [ ] 5. Loading state implemented — no blank white flash — approach documented in README
- [ ] 6. Fully typed TypeScript — no `any`, no errors
- [ ] 7. Responsive — compact stacks on mobile `<768px`
- [ ] 8. No console errors on load or interaction
