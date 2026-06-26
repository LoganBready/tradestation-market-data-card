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
