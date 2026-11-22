import type { EmailMessage } from '../../interfaces/notifications/emailProvider.interface.js';

export function createVerificationEmail(to: string, code: string, expiresMinutes: number, challengeId: string): EmailMessage {
  return {
    to,
    subject: 'Verify your BUYTIVA email',
    text: 'Your BUYTIVA verification code is ' + code + '. Challenge reference: ' + challengeId + '. It expires in ' + expiresMinutes + ' minutes.'
  };
}

export function createApplicationEmail(to: string, reference: string): EmailMessage {
  return {
    to,
    subject: 'BUYTIVA procurer application received',
    text: 'Your application was received. Your tracking reference is ' + reference + '.'
  };
}

export function createApplicationStatusLookupEmail(to: string, code: string, expiresMinutes: number): EmailMessage {
  return { to, subject: 'Verify BUYTIVA application status access', text: 'Your one-time application status verification code is ' + code + '. It expires in ' + expiresMinutes + ' minutes.' };
}

export function createApplicationVerificationEmail(to: string, reference: string, code: string, expiresMinutes: number): EmailMessage {
  return {
    to,
    subject: 'Verify your BUYTIVA procurer application',
    text: 'Your application reference is ' + reference + '. Your verification code is ' + code + '. It expires in ' + expiresMinutes + ' minutes.'
  };
}

export function createStatusEmail(to: string, status: string, reason?: string): EmailMessage {
  return {
    to,
    subject: 'BUYTIVA application status updated',
    text: 'Your application status is ' + status + '.' + (reason ? ' Details: ' + reason : '')
  };
}

export function createInvitationEmail(to: string, link: string, role: string): EmailMessage {
  return {
    to,
    subject: 'BUYTIVA account invitation',
    text: 'You were invited to join BUYTIVA as ' + role + '. Complete setup at: ' + link
  };
}

export function createPasswordResetEmail(to: string, link: string): EmailMessage {
  return { to, subject: 'Reset your BUYTIVA password', text: 'Reset your password at: ' + link };
}

export function createSecurityEmail(to: string, message: string): EmailMessage {
  return { to, subject: 'BUYTIVA security notification', text: message };
}
