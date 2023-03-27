import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_LENGTH = 32;

export function generateEncryptionKey(): string {
  const key = CryptoJS.lib.WordArray.random(ENCRYPTION_KEY_LENGTH);
  return CryptoJS.enc.Base64.stringify(key);
}

export function encrypt(data: string, password: string): string {
  const iv = CryptoJS.lib.WordArray.random(16);
  const passwordHash = CryptoJS.SHA256(password);
  const cipher = CryptoJS.AES.encrypt(data, passwordHash, { iv: iv });
  const encryptedData = cipher.ciphertext.toString(CryptoJS.enc.Base64);
  return `${encryptedData}.${iv.toString(CryptoJS.enc.Base64)}`;
}

export function decrypt(data: string, password: string): string {
  const [encryptedDataString, ivString] = data.split('.');
  const encryptedData = CryptoJS.enc.Base64.parse(encryptedDataString);
  const iv = CryptoJS.enc.Base64.parse(ivString);
  const passwordHash = CryptoJS.SHA256(password);
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encryptedData });
  const decryptedData = CryptoJS.AES.decrypt(cipherParams, passwordHash, { iv: iv });
  return decryptedData.toString(CryptoJS.enc.Utf8);
}
