import * as argon2 from 'argon2';
import { AUTH_ARGON_MEMORY_KIB, AUTH_ARGON_PARALLELISM, AUTH_ARGON_TIME_COST } from '../../constants/auths/auth.constants.js';

export interface PasswordHashingProvider {
  hashPassword(password: string): Promise<string>;
  verifyPassword(passwordHash: string, password: string): Promise<boolean>;
}

export class Argon2PasswordHasher implements PasswordHashingProvider {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: AUTH_ARGON_MEMORY_KIB,
      timeCost: AUTH_ARGON_TIME_COST,
      parallelism: AUTH_ARGON_PARALLELISM
    });
  }

  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
