import isValidEmail from './isValidEmail';

describe('isValidEmail', () => {
  describe('valid emails', () => {
    it.each([
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user@sub.domain.com',
      'user.name+tag@sub.domain.co.uk',
      'USER@EXAMPLE.COM',
      '  user@example.com  ',
    ])('accepts %s', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it.each([
      'notanemail',
      '@domain.com',
      'user@',
      'user@domain',
      '',
      '   ',
      'user @example.com',
      'user@ example.com',
    ])('rejects %s', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false for null', () => {
      expect(isValidEmail(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });
  });
});