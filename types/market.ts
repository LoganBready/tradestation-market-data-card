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
