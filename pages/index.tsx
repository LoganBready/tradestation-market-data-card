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
