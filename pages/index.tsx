import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/types/market';
import { MarketDataCard } from '@/components/MarketDataCard';
import styles from '@/styles/demo.module.css';

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
    <main className={styles.page}>
      <h1 className={styles.title}>MarketDataCard — Component Demo</h1>
      <p className={styles.subtitle}>WEB-2847 · Stocks &amp; ETFs Overview</p>

      {error && <p className={styles.error}>Error: {error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Compact Layout · Live Data</h2>
        <div className={styles.grid}>
          <MarketDataCard
            data={data ?? ({} as MarketQuote)}
            layout="compact"
            isLoading={isLoading || !data}
          />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionLabel}>Full Layout · Market Closed State (null change values)</h2>
        <MarketDataCard
          data={closedStateData ?? ({} as MarketQuote)}
          layout="full"
          isLoading={isLoading || !data}
        />
      </section>
    </main>
  );
}
