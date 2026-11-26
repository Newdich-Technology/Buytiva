import type { RatingSummary } from '../../models/reviews/review.model.js';

export function summarizeRatings(distribution: RatingSummary['distribution']): RatingSummary {
  const counts = [distribution.one, distribution.two, distribution.three, distribution.four, distribution.five];
  const count = counts.reduce((sum, value) => sum + value, 0);
  const total = counts.reduce((sum, value, index) => sum + value * (index + 1), 0);
  return { averageRating: count ? Math.floor((total * 20 + count) / (2 * count)) / 10 : null, reviewCount: count, distribution };
}
