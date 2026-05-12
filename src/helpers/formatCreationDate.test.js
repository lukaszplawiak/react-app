import formatCreationDate from '../formatCreationDate';

describe('formatCreationDate', () => {
  it('should format date with zero-padded day and month', () => {
    expect(formatCreationDate(new Date('2021-07-20T10:00:00Z'))).toBe('20.07.2021');
  });

  it('should zero-pad single-digit day and month', () => {
    expect(formatCreationDate(new Date('2024-01-05T00:00:00Z'))).toBe('05.01.2024');
  });

  it('should return "Invalid date" for invalid input', () => {
    expect(formatCreationDate('not-a-date')).toBe('Invalid date');
  });

  it('should return "Invalid date" for null input', () => {
    expect(formatCreationDate(null)).toBe('Invalid date');
  });
});