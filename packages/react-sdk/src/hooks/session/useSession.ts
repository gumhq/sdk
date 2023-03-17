import { useState, useEffect } from 'react';
import { SDK } from '@gumhq/sdk';
import bs58 from 'bs58';
import { PublicKey, Keypair } from "@solana/web3.js";
import CryptoJS from 'crypto-js';

export type UseSessionReturnType = [
  sessionToken: string | null,
  keypair: Keypair | null,
  encryptionKey: string,
  error: string | null,
  createSession: (targetProgram: PublicKey, owner: PublicKey, topUp?: boolean, expiry?: number | null)
    => Promise<{ sessionToken: string; keypair: Keypair; encryptionKey: string; } | undefined>
];

// Constants
const SESSION_STORAGE_KEY = 'q3s1m8t9-session-tkn';
const ENCRYPTION_KEY_STORAGE_KEY = 'd8b5n6m2-id';
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const EXPIRY_TIME_IN_MS = 1000 * 60 * 60; // 1 hour

const useSession = (sdk: SDK): UseSessionReturnType => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSessionData = async () => {
      const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);
      const encryptionKeyDataString = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);

      const sessionData = sessionDataString ? JSON.parse(sessionDataString) : null;
      const encryptionKeyData = encryptionKeyDataString ? JSON.parse(encryptionKeyDataString) : null;

      if (sessionData && encryptionKeyData) {
        const { encryptedToken, encryptedKeypair, expiry } = sessionData;
        const { encryptionKey: storedEncryptionKey, expiry: encryptionKeyExpiry } = encryptionKeyData;

        if (Date.now() > encryptionKeyExpiry || Date.now() > expiry) {
          localStorage.removeItem(ENCRYPTION_KEY_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }

        try {
          const decryptedToken = decrypt(encryptedToken, storedEncryptionKey);
          const decryptedKeypair = decrypt(encryptedKeypair, storedEncryptionKey);

          const keypair = Keypair.fromSecretKey(bs58.decode(decryptedKeypair));

          setSessionToken(decryptedToken);
          setKeypair(keypair);
          setEncryptionKey(storedEncryptionKey);
        } catch (error) {
          console.error("Error decrypting session data:", error);
          setError("Error decrypting session data");
        }
      }
    };

    getSessionData();
  }, []);

  const createSession = async (targetProgram: PublicKey, owner: PublicKey, topUp = false, expiry?: number | null) => {
    try {
      // if the expiry param is null or undefined, then the session will expire in 1 hour
      expiry = expiry || Date.now() + EXPIRY_TIME_IN_MS;

      const { sessionPDA: sessionToken, sessionSigner: keypair } = await sdk.session.create(targetProgram, owner, topUp, expiry);

      const encryptionKey = generateEncryptionKey();

      const sessionTokenString = sessionToken.toBase58();
      const keypairSecretBase58String = bs58.encode(keypair.secretKey);

      const encryptedToken = encrypt(sessionTokenString, encryptionKey);
      const encryptedKeypair = encrypt(keypairSecretBase58String, encryptionKey);

      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ encryptedToken, encryptedKeypair, expiry })
      );
      localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, JSON.stringify({ encryptionKey, expiry }));

      setSessionToken(sessionTokenString);
      setKeypair(keypair);
      setEncryptionKey(encryptionKey);
      return {
        sessionToken: sessionTokenString,
        keypair,
        encryptionKey,
      };
    } catch (error) {
      console.error("Error creating session:", error);
      setError("Error creating session");
    }
  };


  return [sessionToken, keypair, encryptionKey, error, createSession];
};

function generateEncryptionKey(): string {
  const key = CryptoJS.lib.WordArray.random(ENCRYPTION_KEY_LENGTH);
  return key.toString();
}

function encrypt(data: string, key: string): string {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(data, key, { iv });
  return `${encrypted.toString()}:${iv.toString()}`;
}

function decrypt(data: string, key: string): string {
  const [encryptedData, iv] = data.split(':');
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv: CryptoJS.enc.Hex.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export { useSession };
