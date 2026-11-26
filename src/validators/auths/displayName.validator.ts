/** Shared registration and profile rule: normalized, trimmed and free of ASCII controls. */
export function normalizeDisplayName(input: string): string | null {
  const name = input.normalize('NFKC').trim();
  return name.length >= 2 && name.length <= 120 && !/[\u0000-\u001f\u007f]/.test(name) ? name : null;
}
