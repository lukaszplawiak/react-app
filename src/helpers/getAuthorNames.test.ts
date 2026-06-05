import type { Author } from '../types';

import getAuthorNames from './getAuthorNames';

const authors: Author[] = [
  { id: 'a1', name: 'Ada Lovelace' },
  { id: 'a2', name: 'Grace Hopper' },
  { id: 'a3', name: 'Margaret Hamilton' },
];

describe('getAuthorNames', () => {
  describe('basic functionality', () => {
    it('returns author name for single id', () => {
      expect(getAuthorNames(['a1'], authors)).toBe('Ada Lovelace');
    });

    it('returns comma-separated names for multiple ids', () => {
      expect(getAuthorNames(['a1', 'a2'], authors)).toBe(
        'Ada Lovelace, Grace Hopper'
      );
    });

    it('preserves order from authorIds not from authors array', () => {
      expect(getAuthorNames(['a2', 'a1'], authors)).toBe(
        'Grace Hopper, Ada Lovelace'
      );
    });

    it('skips ids not found in authors array', () => {
      expect(getAuthorNames(['a1', 'unknown'], authors)).toBe('Ada Lovelace');
    });
  });

  describe('empty / null inputs', () => {
    it('returns empty string when authorIds is empty array', () => {
      expect(getAuthorNames([], authors)).toBe('');
    });

    it('returns empty string when authorIds is null', () => {
      expect(getAuthorNames(null, authors)).toBe('');
    });

    it('returns empty string when authorIds is undefined', () => {
      expect(getAuthorNames(undefined, authors)).toBe('');
    });

    it('returns empty string when authors is empty array', () => {
      expect(getAuthorNames(['a1'], [])).toBe('');
    });

    it('returns empty string when authors is null', () => {
      expect(getAuthorNames(['a1'], null)).toBe('');
    });

    it('returns empty string when authors is undefined', () => {
      expect(getAuthorNames(['a1'], undefined)).toBe('');
    });
  });

  describe('truncate option — line 21', () => {
    it('does not truncate when truncate is false (default)', () => {
      const longName = 'A'.repeat(40);
      const longAuthors: Author[] = [{ id: 'x', name: longName }];
      expect(getAuthorNames(['x'], longAuthors)).toBe(longName);
    });

    it('truncates with ellipsis when names exceed MAX_AUTHORS_DISPLAY_LENGTH (30)', () => {
      const longAuthor: Author = { id: 'x', name: 'A'.repeat(35) };
      const result = getAuthorNames(['x'], [longAuthor], { truncate: true });
      expect(result.length).toBeLessThanOrEqual(30);
      expect(result.endsWith('...')).toBe(true);
    });

    it('does not truncate when names are within limit', () => {
      const result = getAuthorNames(['a1'], authors, { truncate: true });
      expect(result).toBe('Ada Lovelace');
      expect(result.endsWith('...')).toBe(false);
    });

    it('truncates combined names exceeding 30 chars', () => {
      const result = getAuthorNames(['a1', 'a2', 'a3'], authors, {
        truncate: true,
      });
      // 'Ada Lovelace, Grace Hopper, Margaret Hamilton' is > 30 chars
      expect(result.endsWith('...')).toBe(true);
    });
  });
});
