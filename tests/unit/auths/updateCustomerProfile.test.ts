import { describe, expect, it, vi } from 'vitest';
import { updateCustomerProfileCommand } from '../../../src/services/auths/commands/updateCustomerProfile.command.js';
import type { AuthRepository } from '../../../src/interfaces/auths/authRepository.interface.js';

describe('customer profile update', () => {
  it('normalizes the display name and derives the user from the principal', async () => {
    const updateCustomerDisplayName = vi.fn().mockResolvedValue(true);
    const repository = { updateCustomerDisplayName } as unknown as AuthRepository;
    expect(await updateCustomerProfileCommand(repository, 'actor', '  Ａda  ')).toEqual({ displayName: 'Ada' });
    expect(updateCustomerDisplayName).toHaveBeenCalledWith('actor', 'Ada');
  });
  it('rejects blank, control characters and revoked users', async () => {
    const updateCustomerDisplayName = vi.fn().mockResolvedValue(false);
    const repository = { updateCustomerDisplayName } as unknown as AuthRepository;
    await expect(updateCustomerProfileCommand(repository, 'actor', '  ')).rejects.toThrow();
    await expect(updateCustomerProfileCommand(repository, 'actor', 'A\nB')).rejects.toThrow();
    expect(updateCustomerDisplayName).not.toHaveBeenCalled();
    await expect(updateCustomerProfileCommand(repository, 'actor', 'Name')).rejects.toThrow();
  });
});
