import { AUTH_DEFAULT_SMTP_PORT } from '../constants/auths/auth.constants.js';
import { mailConfigurationError } from '../errors/auths/auth.error.js';

export interface MailConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
  readonly from: string;
}

export function getMailConfig(environment: NodeJS.ProcessEnv = process.env): MailConfig {
  const host = environment.SMTP_HOST;
  const user = environment.SMTP_USER;
  const password = environment.SMTP_PASSWORD;
  const from = environment.SMTP_FROM;
  const port = Number(environment.SMTP_PORT ?? AUTH_DEFAULT_SMTP_PORT);
  if (!host || !user || !password || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw mailConfigurationError();
  }
  return { host, user, password, from, port, secure: environment.SMTP_SECURE === 'true' };
}
