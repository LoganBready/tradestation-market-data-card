# MarketDataCard — TradeStation Front End Assessment

**Ticket:** WEB-2847 · Sprint 14: Web Production  
**Stack:** Next.js 13+ · TypeScript · CSS Modules · React

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
| Added `volume` to `MarketQuote` interface and API route | AC #4 requires volume formatted as an abbreviated number (e.g. 48.2M). The field exists on Finnhub's `/quote` response (`v`) but was omitted from the brief's interface — added to satisfy the acceptance criterion. |
| Used Finnhub market status endpoint for `isMarketOpen` | The brief offered a time-based ET check as an alternative. A time check doesn't account for US market holidays — the market would incorrectly show as OPEN on days like Christmas or MLK Day. The Finnhub status endpoint adds one parallel call at no extra latency and returns the correct value. |
| Client-side `useEffect` fetch in demo page | `getServerSideProps` also satisfies the API key security requirement, but data arrives with the HTML — the loading state never fires naturally. Even if `isLoading` weren't an acceptance criterion, loading states are something I'd add in a real app. Choosing client-side fetch makes the loading treatment authentic and keeps the data-fetching model explicit. |
| Demo closed state derived from live data | The full-layout card always shows the closed/null state by overriding `isMarketOpen`, `priceChange`, and `percentChange` on the fetched data. This avoids a second API call and ensures both states are visible regardless of actual market hours. |
| CSS custom properties for design tokens | Tokens defined at `:root` in `styles/tokens.css` are available globally via `var()` in every CSS Module — no re-importing. Single source of truth prevents design drift across files. |
| Mobile-first CSS with `min-width` breakpoints | Generated code defaulted to desktop-first (`max-width`) queries. Converted to mobile-first (`min-width`) — base styles serve the smallest screen and breakpoints progressively enhance upward. Better for performance and reflects a mobile-dominant world. |
| CSS token naming conventions | The brief names tokens like "Primary Blue" and "Neutral Dash" but doesn't prescribe variable names. Used `--color-primary-blue`, `--color-positive-green`, etc. — follows CSS naming conventions and makes intent clear at the point of use. Added `--color-white` (not in brief) for badge text consistency. |
| `encodeURIComponent` on symbol in Finnhub URLs | Defensive correctness fix — symbols with special characters (e.g. `BRK.B`) are safely encoded in query strings. |

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

**Changed:** Converted CSS from desktop-first (`max-width` queries) to mobile-first (`min-width` queries). Added `--color-white` token for badge text consistency. Reviewed and adjusted CSS values, tested formatting edge cases manually, verified responsive behavior in browser, confirmed no console errors.
