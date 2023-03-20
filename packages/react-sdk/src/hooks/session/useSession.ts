import { useState, useEffect } from 'react';
import { SDK } from '@gumhq/sdk';
import { PublicKey, Keypair } from "@solana/web3.js";
import { getItemFromIndexedDB, setItemToIndexedDB, deleteItemFromIndexedDB } from '../../utils/indexedDB';
import { generateEncryptionKey, encrypt, decrypt } from '../../utils/crypto';

export type UseSessionReturnType = {
  sessionToken: string | null,
  keypair: Keypair | null,
  encryptionKey: string,
  error: string | null,
  createSession: (targetProgram: PublicKey, owner: PublicKey, topUp?: boolean, expiry?: number | null)
    => Promise<{ sessionToken: string; keypair: Keypair; encryptionKey: string; } | undefined>
};

// Constants
const SESSION_OBJECT_STORE = 'sessions';
const ENCRYPTION_KEY_OBJECT_STORE = 'user_preferences';

const useSession = (sdk: SDK): UseSessionReturnType => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const [sessionData, encryptionKeyData] = await Promise.all([
          getItemFromIndexedDB(SESSION_OBJECT_STORE),
          getItemFromIndexedDB(ENCRYPTION_KEY_OBJECT_STORE),
        ]);

        if (sessionData && encryptionKeyData) {
          const { encryptedToken, encryptedKeypair, expiry } = sessionData;
          const { encryptionKey: storedEncryptionKey, expiry: encryptionKeyExpiry } = encryptionKeyData;

          if (Date.now() > encryptionKeyExpiry || Date.now() > expiry) {
            await deleteSessionData();
            return;
          }

          const decryptedToken = decrypt(encryptedToken, storedEncryptionKey);
          const decryptedKeypair = decrypt(encryptedKeypair, storedEncryptionKey);

          const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(decryptedKeypair, 'base64')));

          setSessionToken(decryptedToken);
          setKeypair(keypair);
          setEncryptionKey(storedEncryptionKey);
        }
      } catch (error: any) {
        console.error("Error getting session data from IndexedDB:", error);
        setError(error);
      }
    };

    getSessionData();
  }, []);

  const createSession = async (targetProgram: PublicKey, owner: PublicKey, topUp = false, validUntil?: number | null) => {
    try {

      // if the expiry param is null or undefined, then the session will be valid for 1 hour
      if (!validUntil) {
      validUntil = Math.ceil((Date.now() + 60 * 60 * 1000) / 1000);
      }

      const { sessionPDA: sessionToken, sessionSignerKeypair: keypair, instructionMethodBuilder } = await sdk.session.create(targetProgram, owner, topUp, validUntil);

      await instructionMethodBuilder.signers([keypair]).rpc();
      await deleteSessionData();

      const encryptionKey = generateEncryptionKey();

      const sessionTokenString = sessionToken.toBase58();
      const keypairSecretBase64String = Buffer.from(keypair.secretKey).toString('base64');

      const encryptedToken = encrypt(sessionTokenString, encryptionKey);
      const encryptedKeypair = encrypt(keypairSecretBase64String, encryptionKey);

      await setItemToIndexedDB(SESSION_OBJECT_STORE, { encryptedToken, encryptedKeypair, validUntil });
      await setItemToIndexedDB(ENCRYPTION_KEY_OBJECT_STORE, { 'userPreferences': encryptionKey, validUntil });

      setSessionToken(sessionTokenString);
      setKeypair(keypair);
      setEncryptionKey(encryptionKey);
      return {
        sessionToken: sessionTokenString,
        keypair,
        encryptionKey,
      };
    } catch (error: any) {
      console.error("Error creating session:", error);
      setError(error);
    }
  };

  const deleteSessionData = async () => {
    await deleteItemFromIndexedDB(ENCRYPTION_KEY_OBJECT_STORE);
    await deleteItemFromIndexedDB(SESSION_OBJECT_STORE);
  };

  return { sessionToken, keypair, encryptionKey, error, createSession};
};

export default useSession;
