import { describe, expect, it } from 'vitest';
import { summarizeRatings } from '../../../src/utils/reviews/ratingSummary.js';

describe('rating summary', () => {
  it('returns null rather than fabricating an average for an empty population', () => {
    expect(summarizeRatings({ one: 0, two: 0, three: 0, four: 0, five: 0 })).toMatchObject({ averageRating: null, reviewCount: 0 });
  });
  it('counts each bucket and rounds to one decimal half-up', () => {
    const distribution = { one: 1, two: 1, three: 1, four: 2, five: 2 };
    expect(summarizeRatings(distribution)).toEqual({ averageRating: 3.4, reviewCount: 7, distribution });
    expect(summarizeRatings({ one: 1, two: 0, three: 0, four: 0, five: 7 }).averageRating).toBe(4.5);
    expect(summarizeRatings({ one: 0, two: 0, three: 0, four: 1, five: 2 }).averageRating).toBe(4.7);
  });
});
