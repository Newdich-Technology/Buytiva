import { PrismaClient } from '../../generated/prisma/client.js';
import type { AuthRepository } from '../../interfaces/auths/authRepository.interface.js';
import { PrismaAuthChallengeRepository } from './authChallenge.repository.js';
import { PrismaAuthCredentialRepository } from './authCredential.repository.js';
import { PrismaAuthSessionRepository } from './authSession.repository.js';
import { PrismaAuthUserRepository } from './authUser.repository.js';

export function createPrismaAuthRepository(prisma: PrismaClient): AuthRepository {
  const users = new PrismaAuthUserRepository(prisma);
  const challenges = new PrismaAuthChallengeRepository(prisma);
  const credentials = new PrismaAuthCredentialRepository(prisma);
  const sessions = new PrismaAuthSessionRepository(prisma);
  return {
    registerPendingCustomer: users.registerPendingCustomer.bind(users),
    findAccountByEmail: users.findAccountByEmail.bind(users),
    findAccountById: users.findAccountById.bind(users),
    getAccessPrincipal: users.getAccessPrincipal.bind(users),
    findOtpChallenge: challenges.findOtpChallenge.bind(challenges),
    createOtpChallenge: challenges.createOtpChallenge.bind(challenges),
    incrementOtpAttempt: challenges.incrementOtpAttempt.bind(challenges),
    consumeEmailVerification: challenges.consumeEmailVerification.bind(challenges),
    createLoginChallenge: challenges.createLoginChallenge.bind(challenges),
    findLoginChallenge: challenges.findLoginChallenge.bind(challenges),
    incrementLoginAttempt: challenges.incrementLoginAttempt.bind(challenges),
    completeLoginChallenge: challenges.completeLoginChallenge.bind(challenges),
    createSession: sessions.createSession.bind(sessions),
    rotateRefreshToken: sessions.rotateRefreshToken.bind(sessions),
    revokeSession: sessions.revokeSession.bind(sessions),
    revokeAllSessions: sessions.revokeAllSessions.bind(sessions),
    listSessions: sessions.listSessions.bind(sessions),
    requestPasswordReset: credentials.requestPasswordReset.bind(credentials),
    resetPassword: credentials.resetPassword.bind(credentials),
    changePassword: credentials.changePassword.bind(credentials),
    saveMfaEnrollment: credentials.saveMfaEnrollment.bind(credentials),
    getMfaFactor: credentials.getMfaFactor.bind(credentials),
    completeMfaEnrollment: credentials.completeMfaEnrollment.bind(credentials),
    acceptTotpStep: credentials.acceptTotpStep.bind(credentials),
    disableMfa: credentials.disableMfa.bind(credentials)
  };
}
