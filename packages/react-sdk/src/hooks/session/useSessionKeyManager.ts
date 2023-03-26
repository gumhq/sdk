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
  isLoading: boolean;
  error: string | null;
  sessionToken: string | null;
  signTransaction: (<T extends Transaction>(transaction: T) => Promise<T>) | undefined;
  signAllTransactions: (<T extends Transaction >(transactions: T[]) => Promise<T[]>) | undefined;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
  sendTransaction: (<T extends Transaction>(transaction: T) => Promise<string>) | undefined;
  signAndSendTransaction: (<T extends Transaction>(transactions: T | T[]) => Promise<string[]>) | undefined;
  createSession: (targetProgram: PublicKey, topUp: boolean, validUntil?: number) => Promise<{ sessionToken: string; publicKey: string; } | undefined>;
  revokeSession: () => Promise<void>;
  getSessionToken: () => Promise<string | null>;
}

// Constants
const SESSION_OBJECT_STORE = 'sessions';
const ENCRYPTION_KEY_OBJECT_STORE = 'user_preferences';

export function useSessionKeyManager(wallet: AnchorWallet, connection: Connection, cluster: Cluster | "localnet"): SessionWalletInterface {
  const keypairRef = useRef<Keypair | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const [, forceUpdate] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sdk = new SessionWallet(wallet, connection, cluster)

  // functions for keypair management
  const generateKeypair = () => {
    keypairRef.current = Keypair.generate();
  };

  const loadKeypairFromDecryptedSecret = (decryptedKeypair: string) => {
    keypairRef.current = Keypair.fromSecretKey(new Uint8Array(Buffer.from(decryptedKeypair, 'base64')));
  };

  const triggerRerender = () => {
    forceUpdate({});
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

  const withLoading = async (asyncFunction: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async <T extends Transaction>(transaction: T): Promise<T> => {
    return withLoading(async () => {
      if (!keypairRef.current || !sessionTokenRef.current) {
        throw new Error('Cannot sign transaction - keypair or session token not loaded. Please create a session first.');
      }

      const { blockhash } = await connection.getLatestBlockhash("finalized");
      const feePayer = keypairRef.current.publicKey;

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = feePayer;
      transaction.sign(keypairRef.current);

      return transaction;
    });
  };

  const signAllTransactions = async <T extends Transaction>(transactions: T[]): Promise<T[]> => {
    return withLoading(async () => {
      return Promise.all(transactions.map((transaction) => signTransaction(transaction)));
    });
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    return withLoading(async () => {
      if (!keypairRef.current) {
        throw new Error('Cannot sign message - keypair not loaded. Please create a session first.');
      }
      return nacl.sign.detached(message, keypairRef.current.secretKey);
    });

  };

  const sendTransaction = async (signedTransaction: Transaction): Promise<string> => {
    return withLoading(async () => {
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      return txid;
    });
  };

  const signAndSendTransaction = async (transaction: Transaction | Transaction[]): Promise<string[]> => {
    return withLoading(async () => {
      const transactionsArray = Array.isArray(transaction) ? transaction : [transaction];
      const signedTransactions = await signAllTransactions(transactionsArray);
      const txids = await Promise.all(signedTransactions.map((signedTransaction) => sendTransaction(signedTransaction)));
      return txids;
    });
  };

  const getSessionToken = async (): Promise<string | null> => {
    if (sessionTokenRef.current) {
      return sessionTokenRef.current;
    }

    try {
      const [sessionData, encryptionKeyData] = await Promise.all([
        getItemFromIndexedDB(SESSION_OBJECT_STORE),
        getItemFromIndexedDB(ENCRYPTION_KEY_OBJECT_STORE),
      ]);

      if (sessionData && encryptionKeyData) {
        const { encryptedToken, encryptedKeypair, validUntilTimestamp } = sessionData;
        const { userPreferences: storedEncryptionKey, validUntilTimestamp: encryptionKeyExpiry } = encryptionKeyData;

        const currentTimestamp = Math.ceil(Date.now() / 1000);

        if (currentTimestamp > encryptionKeyExpiry || currentTimestamp > validUntilTimestamp) {
          await deleteSessionData();
          return null;
        }

        const decryptedToken = decrypt(encryptedToken, storedEncryptionKey);
        const decryptedKeypair = decrypt(encryptedKeypair, storedEncryptionKey);

        loadKeypairFromDecryptedSecret(decryptedKeypair);

        sessionTokenRef.current = decryptedToken;
        triggerRerender();

        return decryptedToken;
      }
    } catch (error: any) {
      console.error("Error getting session data from IndexedDB:", error);
      setError(error);
    }

    return null;
  };

  const createSession = async (targetProgramPublicKey: PublicKey, topUp = false, expiryInMinutes: number = 60) => {
    return withLoading(async () => {
      try {
        
        // if expiry is more than 24 hours then throw error
        if (expiryInMinutes > 24 * 60) {
          throw new Error("Expiry cannot be more than 24 hours.");
        }

        if (!keypairRef.current) {
          generateKeypair();
        }

        // default expiry is 60 minutes 
        const expiryTimestamp = Math.ceil((Date.now() + expiryInMinutes * 60 * 1000) / 1000);

        const validUntilBN: BN | null = new BN(expiryTimestamp);

        const sessionKeypair: Keypair | null = keypairRef.current;
        if (!sessionKeypair) {
          throw new Error("Session keypair not generated.");
        }
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

        await setItemToIndexedDB(SESSION_OBJECT_STORE, { encryptedToken, encryptedKeypair, validUntilTimestamp: expiryTimestamp });
        await setItemToIndexedDB(ENCRYPTION_KEY_OBJECT_STORE, { 'userPreferences': encryptionKey, validUntilTimestamp: expiryTimestamp });

        sessionTokenRef.current = sessionTokenString;
        triggerRerender();
        return {
          sessionToken: sessionTokenRef.current,
          publicKey: sessionSignerPublicKey.toBase58(),
        };
      } catch (error: any) {
        console.error("Error creating session:", error);
        setError(error);
      }
    });
  };

  const revokeSession = async () => {
    return withLoading(async () => {
      try {
        if (!sessionTokenRef.current) {
          return;
        }
        const sessionTokenPublicKey = new PublicKey(sessionTokenRef.current);
        const instructionMethodBuilder = await sdk.revoke(sessionTokenPublicKey, wallet.publicKey as PublicKey);
        await instructionMethodBuilder.rpc();

        await deleteSessionData();
        sessionTokenRef.current = null;
        triggerRerender();
        keypairRef.current = null;
      } catch (error: any) {
        console.error("Error revoking session:", error);
        setError(error);
      }
    });
  };

  if (!wallet) {
    return {
      publicKey: null,
      isLoading: false,
      sessionToken: null,
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage: undefined,
      sendTransaction: undefined,
      signAndSendTransaction: undefined,
      getSessionToken: async () => null,
      createSession: async () => undefined,
      revokeSession: async () => undefined,
      error,
    };
  }

  return {
    publicKey: sessionTokenRef.current && keypairRef.current ? keypairRef.current.publicKey : null,
    isLoading,
    error,
    sessionToken: sessionTokenRef.current,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    signAndSendTransaction,
    getSessionToken,
    createSession,
    revokeSession,
  };
};
