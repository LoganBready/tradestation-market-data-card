import { formatAbbreviated } from '../formatters';

describe('formatAbbreviated', () => {
  it('formats trillions with $ prefix', () => {
    expect(formatAbbreviated(2940000000000, '$')).toBe('$2.94T');
  });

  it('formats billions with $ prefix', () => {
    expect(formatAbbreviated(1500000000, '$')).toBe('$1.50B');
  });

  it('formats millions without prefix', () => {
    expect(formatAbbreviated(48239014)).toBe('48.2M');
  });

  it('formats thousands without prefix', () => {
    expect(formatAbbreviated(5300)).toBe('5.3K');
  });

  it('returns value as-is below 1000', () => {
    expect(formatAbbreviated(999)).toBe('999');
  });

  it('applies prefix to all magnitudes', () => {
    expect(formatAbbreviated(1000, '$')).toBe('$1.0K');
  });
});
