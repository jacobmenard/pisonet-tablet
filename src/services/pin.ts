import * as Crypto from 'expo-crypto';

export const DEFAULT_PIN = '1234';
const SALT = 'pisonet-tablet:v1:';

/** SHA-256 of a salted PIN. The plain PIN is never stored. */
export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, SALT + pin);
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}
