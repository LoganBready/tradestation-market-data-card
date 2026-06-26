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
    const encodedSymbol = encodeURIComponent(symbol);
    const [quoteRes, profileRes, statusRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodedSymbol}&token=${key}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodedSymbol}&token=${key}`),
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
