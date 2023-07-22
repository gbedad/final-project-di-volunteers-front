import { SHA256 } from 'crypto-js';

export function generateTruncatedHash(length) {
  const timestamp = Date.now().toString();
  const randomValue = Math.random().toString();
  const uniqueString = timestamp + randomValue;
  const hash = SHA256(uniqueString).toString();
  const truncatedHash = hash.substring(0, length); // Truncate the hash to the desired length
  return truncatedHash;
}
