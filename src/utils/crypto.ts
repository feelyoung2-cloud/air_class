/**
 * Password hashing utility using SHA-256 via browser Web Crypto API
 */

export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default teacher password hash for 'science1234'
// echo -n "science1234" | sha256sum -> 29e2f494f1c99859f518e38bc9381e4b9bcda1e17d9884bf9d2903e1cb8d99c7
export const DEFAULT_TEACHER_PASSWORD = 'science1234';
export const DEFAULT_TEACHER_HASH = '29e2f494f1c99859f518e38bc9381e4b9bcda1e17d9884bf9d2903e1cb8d99c7';

const STORAGE_KEY = 'gas_exp_teacher_hash';

export function getStoredTeacherHash(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_TEACHER_HASH;
  } catch {
    return DEFAULT_TEACHER_HASH;
  }
}

export function saveTeacherHash(newHash: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, newHash);
  } catch (e) {
    console.warn('Could not save password hash to localStorage', e);
  }
}

export async function verifyTeacherPassword(inputPassword: string): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword.trim());
  const storedHash = getStoredTeacherHash();
  return inputHash === storedHash;
}
