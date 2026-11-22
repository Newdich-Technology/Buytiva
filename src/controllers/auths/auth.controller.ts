import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AuthPrincipal } from '../../models/auths/auth.model.js';
import { registerUserCommand } from '../../services/auths/commands/registerUser.command.js';
import { requestEmailOtpCommand } from '../../services/auths/commands/requestEmailOtp.command.js';
import { verifyEmailOtpCommand } from '../../services/auths/commands/verifyEmailOtp.command.js';
import { loginUserCommand } from '../../services/auths/commands/loginUser.command.js';
import { completeLoginChallengeCommand } from '../../services/auths/commands/completeLoginChallenge.command.js';
import { requestPasswordResetCommand } from '../../services/auths/commands/requestPasswordReset.command.js';
import { resetPasswordCommand } from '../../services/auths/commands/resetPassword.command.js';
import { changePasswordCommand } from '../../services/auths/commands/changePassword.command.js';
import { getCurrentUserQuery } from '../../services/auths/queries/getCurrentUser.query.js';

export class AuthController {
  constructor(private readonly dependencies: AuthDependencies) {}

  register(input: { email: string; displayName: string; password: string; termsAccepted: boolean }) {
    return registerUserCommand(this.dependencies, input);
  }

  requestEmailOtp(email: string) {
    return requestEmailOtpCommand(this.dependencies, email);
  }

  verifyEmailOtp(input: { email: string; challengeId: string; code: string }) {
    return verifyEmailOtpCommand(this.dependencies, input);
  }

  login(input: { email: string; password: string; deviceLabel?: string }) {
    return loginUserCommand(this.dependencies, input);
  }

  completeLogin(input: { challengeToken: string; code: string; deviceLabel?: string }) {
    return completeLoginChallengeCommand(this.dependencies, input);
  }

  requestPasswordReset(email: string) {
    return requestPasswordResetCommand(this.dependencies, email);
  }

  resetPassword(input: { token: string; password: string; confirmPassword: string }) {
    return resetPasswordCommand(this.dependencies, input);
  }

  changePassword(userId: string, input: { currentPassword: string; password: string; confirmPassword: string }) {
    return changePasswordCommand(this.dependencies, userId, input);
  }

  currentUser(principal: AuthPrincipal): ReturnType<typeof getCurrentUserQuery> {
    return getCurrentUserQuery(principal);
  }
}
