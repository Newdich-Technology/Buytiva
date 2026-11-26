import { describe, expect, it } from 'vitest';
import { getAuthConfig } from '../../../src/configs/auth.config.js';

const secrets = { AUTH_TOKEN_SECRET: 'a'.repeat(32), AUTH_OTP_PEPPER: 'b'.repeat(32), AUTH_ENCRYPTION_KEY: Buffer.alloc(32, 5).toString('base64') };
describe('authentication configuration', () => {
  it('accepts HTTPS origins in production and local defaults in development', () => {
    expect(getAuthConfig({ ...secrets, NODE_ENV: 'production', PUBLIC_APP_URL: 'https://buytiva.example/path' }).publicBaseUrl).toBe('https://buytiva.example');
    expect(getAuthConfig(secrets).publicBaseUrl).toBe('http://localhost:5173');
  });
  it.each([undefined, 'http://buytiva.example', 'ftp://buytiva.example', 'https://user:pass@buytiva.example', 'not a url'])('rejects unsafe production URL %s', (url) => {
    expect(() => getAuthConfig({ ...secrets, NODE_ENV: 'production', PUBLIC_APP_URL: url })).toThrow();
  });
  it.each(['NaN', '12.5', 'Infinity', '10', '999'])('rejects invalid maximum password length %s', (value) => {
    expect(() => getAuthConfig({ ...secrets, AUTH_PASSWORD_MAX_LENGTH: value })).toThrow();
  });
});
