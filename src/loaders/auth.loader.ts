import type { Logger } from 'pino';
import type { PrismaClient } from '../generated/prisma/client.js';
import { getAuthConfig } from '../configs/auth.config.js';
import { getMailConfig } from '../configs/mail.config.js';
import { Argon2PasswordHasher } from '../lib/security/passwordHasher.js';
import { SmtpEmailSender } from '../lib/email/emailSender.js';
import { createPrismaAuthRepository } from '../repositories/auths/auth.repository.js';
import { PrismaOutboxRepository } from '../repositories/outbox/outbox.repository.js';
import { ProcessAuthEmailOutboxJob } from '../jobs/workers/processAuthEmailOutbox.job.js';
import type { AuthDependencies } from '../types/authDependencies.type.js';
import type { EmailProvider } from '../interfaces/notifications/emailProvider.interface.js';
import { AUTH_OUTBOX_POLL_MS } from '../constants/auths/auth.constants.js';
import { PrismaProcurerApplicationRepository } from '../repositories/identity/procurerApplication.repository.js';
import { PrismaStaffInvitationRepository } from '../repositories/administrators/staffInvitation.repository.js';

export interface AuthRuntime {
  readonly dependencies: AuthDependencies;
  readonly emailOutboxJob: ProcessAuthEmailOutboxJob;
}

export function createAuthRuntime(prisma: PrismaClient, logger: Logger, provider?: EmailProvider): AuthRuntime {
  const config = getAuthConfig();
  const dependencies: AuthDependencies = {
    config,
    repository: createPrismaAuthRepository(prisma),
    passwordHasher: new Argon2PasswordHasher(),
    emailProvider: provider ?? new SmtpEmailSender(getMailConfig()),
    identityRepository: new PrismaProcurerApplicationRepository(prisma),
    staffRepository: new PrismaStaffInvitationRepository(prisma)
  };
  return {
    dependencies,
    emailOutboxJob: new ProcessAuthEmailOutboxJob(new PrismaOutboxRepository(prisma), dependencies.emailProvider, config, logger)
  };
}

export function startAuthEmailOutboxPolling(job: ProcessAuthEmailOutboxJob, logger: Logger): NodeJS.Timeout {
  const timer = setInterval(() => {
    void job.drainAvailable(20).catch(() => logger.error({ event: 'AUTH_EMAIL_OUTBOX_FAILURE' }, 'Email outbox polling failed'));
  }, AUTH_OUTBOX_POLL_MS);
  timer.unref();
  return timer;
}
