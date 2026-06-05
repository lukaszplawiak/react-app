import getCourseDuration from './getCourseDuration';

describe('getCourseDuration', () => {
  describe('valid durations', () => {
    it('formats 60 minutes as 01:00 hour', () => {
      expect(getCourseDuration(60)).toBe('01:00 hour');
    });

    it('formats 90 minutes as 01:30 hours', () => {
      expect(getCourseDuration(90)).toBe('01:30 hours');
    });

    it('formats 120 minutes as 02:00 hours', () => {
      expect(getCourseDuration(120)).toBe('02:00 hours');
    });

    it('formats 45 minutes as 00:45 hours', () => {
      expect(getCourseDuration(45)).toBe('00:45 hours');
    });

    it('formats 0 minutes as N/A', () => {
      expect(getCourseDuration(0)).toBe('N/A');
    });
  });

  describe('invalid inputs — N/A guard (line 5)', () => {
    it('returns N/A for null', () => {
      expect(getCourseDuration(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(getCourseDuration(undefined)).toBe('N/A');
    });

    it('returns N/A for negative number', () => {
      expect(getCourseDuration(-10)).toBe('N/A');
    });

    it('returns N/A for NaN', () => {
      expect(getCourseDuration(NaN)).toBe('N/A');
    });
  });

  describe('hour/hours label', () => {
    it('uses "hour" for exactly 1 hour', () => {
      expect(getCourseDuration(60)).toContain('hour');
      expect(getCourseDuration(60)).not.toContain('hours');
    });

    it('uses "hours" for more than 1 hour', () => {
      expect(getCourseDuration(121)).toContain('hours');
    });

    it('uses "hours" for less than 1 hour', () => {
      expect(getCourseDuration(30)).toContain('hours');
    });
  });
});
