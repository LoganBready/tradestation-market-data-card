import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/types/market';
import { MarketDataCard } from '@/components/MarketDataCard';
import styles from '@/styles/demo.module.css';

const mockPositive: MarketQuote = {
  symbol: 'MSFT',
  companyName: 'Microsoft Corporation',
  exchange: 'NASDAQ NMS - GLOBAL MARKET',
  price: 415.26,
  priceChange: 8.43,
  percentChange: 2.07,
  dayHigh: 418.50,
  dayLow: 408.12,
  prevClose: 406.83,
  marketCap: 3080000000000,
  volume: 22541038,
  isMarketOpen: true,
};

const mockNegative: MarketQuote = {
  symbol: 'TSLA',
  companyName: 'Tesla, Inc.',
  exchange: 'NASDAQ NMS - GLOBAL MARKET',
  price: 248.50,
  priceChange: -12.35,
  percentChange: -4.74,
  dayHigh: 263.20,
  dayLow: 246.18,
  prevClose: 260.85,
  marketCap: 793000000000,
  volume: 89234521,
  isMarketOpen: true,
};

const mockClosed: MarketQuote = {
  symbol: 'GOOGL',
  companyName: 'Alphabet Inc.',
  exchange: 'NASDAQ NMS - GLOBAL MARKET',
  price: 178.90,
  priceChange: null,
  percentChange: null,
  dayHigh: 181.45,
  dayLow: 176.23,
  prevClose: 177.55,
  marketCap: 2180000000000,
  volume: 18923045,
  isMarketOpen: false,
};

export default function Home() {
  const [data, setData] = useState<MarketQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch('/api/market-data/quote?symbol=AAPL');
        if (!res.ok) throw new Error('Failed to fetch market data');
        const json = (await res.json()) as MarketQuote;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuote();
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>MarketDataCard — Component Demo</h1>
      <p className={styles.subtitle}>WEB-2847 · Stocks &amp; ETFs Overview</p>

      {error && <p className={styles.error} role="alert">Error: {error}</p>}

      <section className={styles.section} aria-labelledby="section-live">
        <h2 id="section-live" className={styles.sectionLabel}>Live Data · AAPL</h2>
        <div className={styles.grid}>
          <MarketDataCard
            data={data ?? ({} as MarketQuote)}
            layout="compact"
            isLoading={isLoading || !data}
          />
        </div>
        <div className={`${styles.stack} ${styles.stackBelowGrid}`}>
          <MarketDataCard
            data={data ?? ({} as MarketQuote)}
            layout="full"
            isLoading={isLoading || !data}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="section-compact">
        <h2 id="section-compact" className={styles.sectionLabel}>Compact Layout · All States · Mock Data</h2>
        <div className={styles.grid}>
          <MarketDataCard data={{} as MarketQuote} layout="compact" isLoading={true} />
          <MarketDataCard data={mockPositive} layout="compact" />
          <MarketDataCard data={mockNegative} layout="compact" />
          <MarketDataCard data={mockClosed} layout="compact" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="section-full">
        <h2 id="section-full" className={styles.sectionLabel}>Full Layout · All States · Mock Data</h2>
        <div className={styles.stack}>
          <MarketDataCard data={{} as MarketQuote} layout="full" isLoading={true} />
          <MarketDataCard data={mockPositive} layout="full" />
          <MarketDataCard data={mockNegative} layout="full" />
          <MarketDataCard data={mockClosed} layout="full" />
        </div>
      </section>
    </main>
  );
}
