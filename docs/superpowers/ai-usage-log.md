# AI Tool Usage Log

This log tracks how AI tools were used throughout this project — what was prompted, what was generated, what was kept, and what was changed. Compiled into the README for submission.

---

## Phase 1: Design & Architecture

**Tool:** Claude (Claude Code)

**Prompted:** Read the full assessment brief and help design the architecture before writing any code — project structure, data fetching approach, API route design, component structure, and loading state treatment.

**Generated:**
- Three data fetching approaches (client-side useEffect, getServerSideProps, App Router + Suspense) with trade-offs for each
- Full project directory structure
- API route normalization logic and field mapping from Finnhub raw responses
- Component rendering branches (loading, compact, full)
- Design token strategy using CSS custom properties as an alternative to Tailwind
- Decision to add `volume` field (missing from brief's interface but required by AC #4)
- Full design spec at `docs/superpowers/specs/2026-06-25-market-data-card-design.md`

**Kept:**
- Approach 1 (client-side useEffect) for the demo page — even if `isLoading` weren't an acceptance criterion, loading states are something I'd add regardless in a real app. But with `getServerSideProps`, the data arrives with the HTML and the loading state would never be visible to the user. Choosing client-side fetch was a deliberate call to both demonstrate the loading treatment authentically and keep the data-fetching model simple and transparent
- Project structure as proposed
- CSS custom properties for design tokens — defining tokens at `:root` means any CSS Module in the project can consume them via `var()` without re-declaring values. This builds a strong design system foundation and prevents design drift where the same color gets typed differently across files over time
- Pulsing skeleton for loading state — skeletons fit more naturally in a card-based layout than a spinner. The card has known structure, so the skeleton can mirror it and give the user a sense of what's coming. Better UX than a generic spinner that gives no layout signal

**Changed / Decisions Made:**
- Pushed back on time-based market hours check (Option B) in favor of the Finnhub market status endpoint (Option A) — the time-based approach doesn't account for US market holidays, which would cause the card to incorrectly show OPEN on days like Christmas or Thanksgiving
- Clarified that client-side `useEffect` calling `/api/market-data/quote` does NOT violate the API key security requirement — the key never leaves the server, the browser only calls our own Next.js route
- Used explicit, descriptive CSS custom property names rather than lifting the brief's label names verbatim — the brief names tokens like "Primary Blue" and "Neutral Dash" but doesn't prescribe variable names. Using `--color-primary-blue`, `--color-positive-green`, etc. follows CSS naming conventions and makes the intent clear at the point of use. Full mapping:

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

## Phase 2: API Route

*(To be completed after implementation)*

---

## Phase 3: MarketDataCard Component

**Generated:** Component with three render branches (loading skeleton, compact layout, full layout), CSS Modules with design token variables, responsive stats grid, price change display logic (positive/negative/null), badge styles, barrel export, and full test suite.

**Kept:** Overall structure, prop-driven architecture, skeleton animation approach, all token usage.

**Changed / Decisions Made:**
- Converted CSS from desktop-first (`max-width` queries) to mobile-first (`min-width` queries) — the generated code defaulted to desktop-first, which is a common pattern but not best practice. Mobile-first means base styles serve the smallest screen and breakpoints progressively enhance for larger ones. This is better for performance and reflects how most users in a mobile-dominant world will encounter the component first.
- Added `--color-white: #FFFFFF` token to `styles/tokens.css` and replaced two hardcoded `#ffffff` values in badge styles — consistency with the design token system matters for maintainability even for something as simple as white text.

---

## Phase 4: Demo Page & README

*(To be completed after implementation)*
