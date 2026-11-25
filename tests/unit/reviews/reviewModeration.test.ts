import { describe, expect, it, vi } from 'vitest';
import type { ReviewRepository } from '../../../src/interfaces/reviews/reviewRepository.interface.js';
import { moderateReviewCommand } from '../../../src/services/reviews/commands/moderateReview.command.js';

describe('review moderation command', () => {
  it('requires a meaningful reason and sends the actor and expected state to the repository', async () => {
    const moderate = vi.fn().mockResolvedValue({ id: 'review' });
    const repository = { moderate } as unknown as ReviewRepository;
    expect(() => moderateReviewCommand(repository, 'actor', 'review', { expectedStatus: 'PENDING', targetStatus: 'APPROVED', reason: '        ' })).toThrow();
    await moderateReviewCommand(repository, 'actor', 'review', { expectedStatus: 'PENDING', targetStatus: 'APPROVED', reason: '  Checked policy  ' });
    expect(moderate).toHaveBeenCalledWith('actor', 'review', { expectedStatus: 'PENDING', targetStatus: 'APPROVED', reason: 'Checked policy' });
  });
});
