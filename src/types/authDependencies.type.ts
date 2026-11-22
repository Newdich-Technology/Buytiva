import type { AuthConfig } from '../configs/auth.config.js';
import type { EmailProvider } from '../interfaces/notifications/emailProvider.interface.js';
import type { ProcurerApplicationRepository } from '../interfaces/identity/procurerApplicationRepository.interface.js';
import type { AuthRepository } from '../interfaces/auths/authRepository.interface.js';
import type { StaffInvitationRepository } from '../interfaces/administrators/staffInvitationRepository.interface.js';
import type { PasswordHashingProvider } from '../lib/security/passwordHasher.js';

export interface AuthDependencies {
  readonly config: AuthConfig;
  readonly repository: AuthRepository;
  readonly passwordHasher: PasswordHashingProvider;
  readonly emailProvider: EmailProvider;
  readonly identityRepository: ProcurerApplicationRepository;
  readonly staffRepository: StaffInvitationRepository;
}
