import { describe, expect, it } from 'vitest';
import { validateReview } from '../../../src/validators/reviews/review.validator.js';

describe('review validation', () => {
  it('accepts integer ratings and preserves untrusted comments as text', () => {
    expect(validateReview({ rating: 5, comment: ' <script>alert(1)</script> ' })).toEqual({ rating: 5, comment: '<script>alert(1)</script>' });
    expect(validateReview({ rating: 1, comment: '  ' }).comment).toBeNull();
    expect(validateReview({ rating: 3, comment: null }).rating).toBe(3);
  });
  it('rejects out of range, fractional, and oversized input', () => {
    for (const rating of [0, 6, 1.5, NaN]) expect(() => validateReview({ rating, comment: null })).toThrow();
    expect(() => validateReview({ rating: 4, comment: 'x'.repeat(2001) })).toThrow();
  });
});
