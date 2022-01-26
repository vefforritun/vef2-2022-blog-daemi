import { describe, expect, it } from '@jest/globals';
import { blogFilename } from '../lib/utils';

describe('blogFilename', () => {
  it('returns null for invalid input of filename', () => {
    expect(blogFilename(null)).toBe(null);
    expect(blogFilename(true)).toBe(null);
    expect(blogFilename([])).toBe(null);
    expect(blogFilename('')).toBe(null);
  });

  it('returns a filename for valid input', () => {
    expect(blogFilename('test')).toBe('test.html');
  });

  it('returns a filename w/basepath for valid input', () => {
    expect(blogFilename('test', 'foo')).toBe('foo/test.html');
  });
});
