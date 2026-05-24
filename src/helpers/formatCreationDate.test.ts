import formatCreationDate from './formatCreationDate';

describe('formatCreationDate', () => {
  it('should format date with zero-padded day and month', () => {
    expect(formatCreationDate(new Date('2021-07-20T10:00:00Z'))).toBe(
      '20.07.2021'
    );
  });

  it('should format single-digit day and month with leading zeros', () => {
    expect(formatCreationDate(new Date('2021-01-05T10:00:00Z'))).toBe(
      '05.01.2021'
    );
  });

  it('should accept ISO string as input', () => {
    expect(formatCreationDate('2021-07-20T10:00:00Z')).toBe('20.07.2021');
  });

  it('should return empty string for null input', () => {
    expect(formatCreationDate(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(formatCreationDate(undefined)).toBe('');
  });

  it('should return empty string for invalid date string', () => {
    expect(formatCreationDate('not-a-date')).toBe('');
  });
});
