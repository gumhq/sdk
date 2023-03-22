import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, Transaction, Cluster, Connection } from '@solana/web3.js';
import { useEffect, useRef, useState } from 'react';
import { generateEncryptionKey, encrypt, decrypt } from '../../utils/crypto';
import { SessionWallet } from '@gumhq/sdk';
import * as nacl from 'tweetnacl';
import { BN } from "@project-serum/anchor";
import { deleteItemFromIndexedDB, getItemFromIndexedDB, setItemToIndexedDB } from 'src/utils/indexedDB';

export interface SessionWalletInterface {
  publicKey: PublicKey | null;
  signTransaction: (<T extends Transaction>(transaction: T) => Promise<T>) | undefined;
  signAllTransactions: (<T extends Transaction >(transactions: T[]) => Promise<T[]>) | undefined;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
  createSession: (targetProgram: PublicKey, topUp: boolean, validUntil?: number | null) => Promise<{ sessionToken: any; encryptionKey: string; } | undefined>;
  revokeSession: () => Promise<void>;
  getSessionToken: () => Promise<string | null>;
  error: string | null;
}

// Constants
const SESSION_OBJECT_STORE = 'sessions';
const ENCRYPTION_KEY_OBJECT_STORE = 'user_preferences';

export function useSessionKeyWallet(wallet: AnchorWallet, connection: Connection, cluster: Cluster | "localnet"): SessionWalletInterface {
  const keypairRef = useRef<Keypair>(Keypair.generate());
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sdk = new SessionWallet(wallet, connection, cluster)

  // functions for keypair management
  const generateKeypair = () => {
    keypairRef.current = Keypair.generate();
  };

  const loadKeypairFromDecryptedSecret = (decryptedKeypair: string) => {
    keypairRef.current = Keypair.fromSecretKey(new Uint8Array(Buffer.from(decryptedKeypair, 'base64')));
  };

  useEffect(() => {
    if (!wallet) {
      return;
    }

    getSessionToken();
  }, [wallet]);

  const deleteSessionData = async () => {
    await deleteItemFromIndexedDB(ENCRYPTION_KEY_OBJECT_STORE);
    await deleteItemFromIndexedDB(SESSION_OBJECT_STORE);
  };

  const signTransaction = async <T extends Transaction>(transaction: T): Promise<T> => {
    transaction.sign(keypairRef.current);
    return transaction;
  };

  const signAllTransactions = async <T extends Transaction>(transactions: T[]): Promise<T[]> => {
    return Promise.all(transactions.map((transaction) => signTransaction(transaction)));
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    return nacl.sign.detached(message, keypairRef.current.secretKey);
  };

  const getSessionToken = async (): Promise<string | null> => {
    if (sessionToken) {
      return sessionToken;
    }

    try {
      const [sessionData, encryptionKeyData] = await Promise.all([
        getItemFromIndexedDB(SESSION_OBJECT_STORE),
        getItemFromIndexedDB(ENCRYPTION_KEY_OBJECT_STORE),
      ]);

      if (sessionData && encryptionKeyData) {
        const { encryptedToken, encryptedKeypair, validUntil } = sessionData;
        const { userPreferences: storedEncryptionKey, validUntil: encryptionKeyExpiry } = encryptionKeyData;

        const currentTimestamp = Math.ceil(Date.now() / 1000);

        if (currentTimestamp > encryptionKeyExpiry || currentTimestamp > validUntil) {
          await deleteSessionData();
          return null;
        }

        const decryptedToken = decrypt(encryptedToken, storedEncryptionKey);
        const decryptedKeypair = decrypt(encryptedKeypair, storedEncryptionKey);

        loadKeypairFromDecryptedSecret(decryptedKeypair);

        setSessionToken(decryptedToken);
        // setEncryptionKey(storedEncryptionKey);

        return decryptedToken;
      }
    } catch (error: any) {
      console.error("Error getting session data from IndexedDB:", error);
      setError(error);
    }

    return null;
  };

  const createSession = async (targetProgramPublicKey: PublicKey, topUp = false, validUntilTimestamp: number | null= null) => {
    try {
      // if the expiry param is null or undefined, then the session will be valid for 1 hour
      if (!validUntilTimestamp) {
        validUntilTimestamp = Math.ceil((Date.now() + 60 * 60 * 1000) / 1000);
      }

      const validUntilBN: BN | null = new BN(validUntilTimestamp);
      
      generateKeypair();

      const sessionKeypair = keypairRef.current;
      const sessionSignerPublicKey = sessionKeypair.publicKey;

      const instructionMethodBuilder = sdk.program.methods.createSession(topUp, validUntilBN)
        .accounts({
          targetProgram: targetProgramPublicKey,
          sessionSigner: sessionSignerPublicKey,
          authority: wallet.publicKey as PublicKey,
        });

      const pubKeys = await instructionMethodBuilder.pubkeys();
      const sessionToken = pubKeys.sessionToken as PublicKey;

      await instructionMethodBuilder.signers([sessionKeypair]).rpc();
      await deleteSessionData();

      const encryptionKey = generateEncryptionKey();

      const sessionTokenString = sessionToken.toBase58();
      const keypairSecretBase64String = Buffer.from(sessionKeypair.secretKey).toString('base64');

      const encryptedToken = encrypt(sessionTokenString, encryptionKey);
      const encryptedKeypair = encrypt(keypairSecretBase64String, encryptionKey);

      await setItemToIndexedDB(SESSION_OBJECT_STORE, { encryptedToken, encryptedKeypair, validUntilTimestamp });
      await setItemToIndexedDB(ENCRYPTION_KEY_OBJECT_STORE, { 'userPreferences': encryptionKey, validUntilTimestamp });

      setSessionToken(sessionTokenString);
      // setEncryptionKey(encryptionKey);
      return {
        sessionToken: sessionTokenString,
        encryptionKey,
      };
    } catch (error: any) {
      console.error("Error creating session:", error);
      setError(error);
    }
  };

  const revokeSession = async () => {
    try {
      if (!sessionToken) {
        return;
      }
      const sessionTokenPublicKey = new PublicKey(sessionToken);
      const instructionMethodBuilder = await sdk.revoke(sessionTokenPublicKey, wallet.publicKey as PublicKey);
      await instructionMethodBuilder.rpc();

      await deleteSessionData();
      setSessionToken(null);
      keypairRef.current = Keypair.generate(); // overwrite the keypair to remove the old secret key
    } catch (error: any) {
      console.error("Error revoking session:", error);
      setError(error);
    }
  };

  if (!wallet) {
    return {
      publicKey: null,
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage: undefined,
      getSessionToken: async () => null,
      createSession: async () => undefined,
      revokeSession: async () => undefined,
      error,
    };
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction,
    signAllTransactions,
    signMessage,
    getSessionToken,
    createSession,
    revokeSession,
    error,
  };
}





