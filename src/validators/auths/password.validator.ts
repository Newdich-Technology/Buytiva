import { AUTH_COMMON_PASSWORDS } from "../../constants/auths/auth.constants.js";
import {
  invalidPasswordLengthError,
  weakPasswordError,
} from "../../errors/auths/auth.error.js";

export function validatePasswordStrength(
  password: string,
  minimumLength: number,
  maximumLength: number,
): void {
  if (password.length < minimumLength || password.length > maximumLength) {
    throw invalidPasswordLengthError();
  }
  const characterGroups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  if (
    characterGroups.filter(Boolean).length < 3 ||
    new Set<string>(AUTH_COMMON_PASSWORDS).has(password.toLowerCase())
  ) {
    throw weakPasswordError();
  }
}
