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

// Default teacher password hash for '1111'
// echo -n "1111" | sha256sum -> 0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c
export const DEFAULT_TEACHER_PASSWORD = '1111';
export const DEFAULT_TEACHER_HASH = '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c';

const STORAGE_KEY = 'gas_exp_teacher_hash_v2';
const OLD_SCIENCE_HASH = '29e2f494f1c99859f518e38bc9381e4b9bcda1e17d9884bf9d2903e1cb8d99c7';

export function getStoredTeacherHash(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('gas_exp_teacher_hash');
    if (!stored || stored === OLD_SCIENCE_HASH) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_TEACHER_HASH);
      return DEFAULT_TEACHER_HASH;
    }
    return stored;
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
