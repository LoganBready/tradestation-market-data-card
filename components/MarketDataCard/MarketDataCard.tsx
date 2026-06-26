import type { MarketDataCardProps } from '@/types/market';
import { formatAbbreviated } from '@/lib/formatters';
import styles from './MarketDataCard.module.css';

export function MarketDataCard({ data, layout, isLoading = false }: MarketDataCardProps) {
  if (isLoading) {
    return (
      <div
        className={`${styles.card} ${styles.skeleton} ${layout === 'full' ? styles.full : styles.compact}`}
        role="status"
        aria-label="Loading market data"
        aria-busy="true"
      >
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonHeaderLeft}>
            <div className={styles.skeletonSymbolRow}>
              <div className={styles.skeletonSymbol} />
              <div className={styles.skeletonExchangeBadge} />
            </div>
            <div className={styles.skeletonCompanyName} />
          </div>
          <div className={styles.skeletonStatusBadge} />
        </div>
        <div className={styles.skeletonPriceRow}>
          <div className={styles.skeletonPrice} />
          <div className={styles.skeletonChange} />
        </div>
        {layout === 'full' && (
          <div className={styles.skeletonStatsRow}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonStat}>
                <div className={styles.skeletonStatLabel} />
                <div className={styles.skeletonStatValue} />
              </div>
            ))}
          </div>
        )}
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

  const arrow = isPositive ? '▲' : isNegative ? '▼' : null;

  return (
    <article
      className={`${styles.card} ${layout === 'full' ? styles.full : styles.compact}`}
      aria-label={`${symbol} stock quote`}
    >
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
        <span className={`${styles.priceChange} ${changeColorClass}`}>
          {priceChange === null || percentChange === null ? '—' : (
            <>
              {arrow && <span aria-hidden="true">{arrow} </span>}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
            </>
          )}
        </span>
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
    </article>
  );
}
