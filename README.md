# MarketDataCard — TradeStation Front End Assessment

**Ticket:** WEB-2847 · Sprint 14: Web Production  
**Stack:** Next.js 13+ · TypeScript · CSS Modules · React  
**Time to complete:** 2 hours 9 minutes (7:36 PM – 9:45 PM)  
**Live demo:** https://tradestation-market-data-card.vercel.app/

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Finnhub API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder with your Finnhub API key.  
Get a free key at [finnhub.io](https://finnhub.io) — no credit card required.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Run tests

```bash
npm test
```

---

## Loading State Approach

I used a **pulsing skeleton** rather than a spinner.

The card has known structure — a header block, a price block, and a stats block for the full layout. A skeleton that mirrors that structure gives the user a visual anchor for what's loading, and reduces perceived wait time better than a generic spinner that gives no layout signal. Implemented with a CSS `@keyframes` opacity animation — no JavaScript timers, no third-party dependency.

---

## Decisions Not Explicitly Specced

| Decision | Rationale |
|---|---|
| Added `volume` to `MarketQuote` interface and API route | AC #4 requires volume formatted as an abbreviated number (e.g. 48.2M). The brief's interface omitted `volume`, but Aaron's Slack thread confirms Finnhub returns it as a raw integer in the `/quote` response (`v` field). Added to satisfy the acceptance criterion. Note: volume reads as `0` when the market is closed — no trading has occurred — which is expected and correct. |
| `priceChange` and `percentChange` are `null` when market is closed | The Slack thread (Aaron) explicitly states Finnhub returns `d`/`dp` as `0` — not `null` — when closed, and instructs the route to normalize them to `null` so the component has a clean signal. The API route implements this: `priceChange: isMarketOpen ? quote.d : null`. The component treats `null` as the closed state and renders `—`. |
| Used Finnhub market status endpoint for `isMarketOpen` | The brief offered a time-based ET check as an alternative. A time check doesn't account for US market holidays — the market would incorrectly show as OPEN on days like Christmas or MLK Day. The Finnhub status endpoint adds one parallel call at no extra latency and returns the correct value. |
| Client-side `useEffect` fetch in demo page | `getServerSideProps` also satisfies the API key security requirement, but data arrives with the HTML — the loading state never fires naturally. Even if `isLoading` weren't an acceptance criterion, loading states are something I'd add in a real app. Choosing client-side fetch makes the loading treatment authentic and keeps the data-fetching model explicit. |
| CSS custom properties for design tokens | Tokens defined at `:root` in `styles/tokens.css` are available globally via `var()` in every CSS Module — no re-importing. Single source of truth prevents design drift across files. |
| Mobile-first CSS with `min-width` breakpoints | Generated code defaulted to desktop-first (`max-width`) queries. Converted to mobile-first (`min-width`) — base styles serve the smallest screen and breakpoints progressively enhance upward. Better for performance and reflects a mobile-dominant world. |
| CSS token naming conventions | The brief names tokens like "Primary Blue" and "Neutral Dash" but doesn't prescribe variable names. Used `--color-primary-blue`, `--color-positive-green`, etc. — follows CSS naming conventions and makes intent clear at the point of use. Added `--color-white` (not in brief) for badge text consistency. |
| `encodeURIComponent` on symbol in Finnhub URLs | Defensive correctness fix — symbols with special characters (e.g. `BRK.B`) are safely encoded in query strings. |
| Demo page uses static mock data for state showcase | The live API fetch reflects actual market conditions — if the market is open, the closed/null state is never visible; if it's closed, positive and negative change colors are never visible. Static mock fixtures (MSFT positive, TSLA negative, GOOGL closed) guarantee all four states are always rendered regardless of market hours. One live AAPL card is kept to prove the API integration works. |
| `--color-positive-green: #00AA78` fails WCAG AA contrast (2.99:1) | The brief specifies this color for positive price change text and the OPEN badge. A WCAG 2.1 AA compliant alternative is `#007A54` (5.37:1). The spec color was kept to match the design handoff exactly — this should be flagged to the designer before shipping to production. |
| Skeleton rebuilt to mirror card anatomy | The initial skeleton used three monolithic gray blocks. Rebuilt to match the real card's structure — symbol chip, exchange badge, status badge, company name, price block, change block, and a responsive stats grid for the full layout. A skeleton that mirrors the real layout reduces perceived load time and gives the user a sense of what's coming. |

### CSS Design Token Mapping

| Brief Token Name | Value | CSS Variable |
|---|---|---|
| Primary Blue | `#0051A5` | `--color-primary-blue` |
| Positive Green | `#00AA78` | `--color-positive-green` |
| Negative Red | `#DC2626` | `--color-negative-red` |
| Neutral Dash | `#6B7280` | `--color-neutral` |
| Card BG | `#FFFFFF` | `--color-card-bg` |
| Surface Gray | `#F7F8FA` | `--color-surface-gray` |
| Text Primary | `#1A1A2E` | `--color-text-primary` |
| Text Muted | `#6B7280` | `--color-text-muted` |
| Border | `#DDDDDD` | `--color-border` |
| *(added)* | `#FFFFFF` | `--color-white` |

---

## Accessibility

The component was audited against WCAG 2.1 AA after implementation. The following was addressed:

| # | Issue | Action |
|---|-------|--------|
| 1 | `--color-positive-green: #00AA78` fails contrast at 2.99:1 (AA requires 4.5:1) | Noted — spec color kept to match design handoff. Compliant alternative is `#007A54` (5.37:1). Should be flagged to designer before production. |
| 2 | Error message missing `role="alert"` | Fixed — dynamically injected content now announces to screen readers |
| 3 | Loading skeleton had no accessible label | Fixed — `role="status"`, `aria-label="Loading market data"`, `aria-busy="true"` added |
| 4 | Arrow characters `▲`/`▼` announced verbosely by screen readers | Fixed — wrapped in `aria-hidden="true"`; numeric text already conveys direction |
| 5 | Skeleton animation ignores `prefers-reduced-motion` | Fixed — animation disabled via `@media (prefers-reduced-motion: reduce)` |
| 6 | Card rendered as generic `<div>` | Fixed — changed to `<article aria-label="{symbol} stock quote">` for landmark navigation |
| 7 | `<section>` elements lacked `aria-labelledby` | Fixed — each section wired to its `<h2>` via `id`/`aria-labelledby` |

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

**Changed:** Converted CSS from desktop-first (`max-width` queries) to mobile-first (`min-width` queries). Added `--color-white` token for badge text consistency. Replaced all inline styles on the demo page with a dedicated CSS Module. Converted `useEffect` from `.then()` chaining to `async/await` with `try/catch/finally`. Rebuilt the loading skeleton from three monolithic blocks into structured elements that mirror the real card anatomy — symbol chip, exchange badge, status badge, company name, price, change, and a responsive stats grid. Expanded the demo page to show all four component states (loading, positive, negative, closed) for both layout variants using static mock data, with a separate live AAPL section to demonstrate the API integration.
