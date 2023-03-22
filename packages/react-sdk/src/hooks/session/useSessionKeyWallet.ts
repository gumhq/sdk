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
  sessionToken: string | null;
  signTransaction: (<T extends Transaction>(transaction: T) => Promise<T>) | undefined;
  signAllTransactions: (<T extends Transaction >(transactions: T[]) => Promise<T[]>) | undefined;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
  sendTransaction: (<T extends Transaction>(transaction: T) => Promise<string>) | undefined;
  createSession: (targetProgram: PublicKey, topUp: boolean, validUntil?: number | null) => Promise<{ sessionToken: any; encryptionKey: string; } | undefined>;
  revokeSession: () => Promise<void>;
  getSessionToken: () => Promise<string | null>;
  error: string | null;
}

// Constants
const SESSION_OBJECT_STORE = 'sessions';
const ENCRYPTION_KEY_OBJECT_STORE = 'user_preferences';

export function useSessionKeyWallet(wallet: AnchorWallet, connection: Connection, cluster: Cluster | "localnet"): SessionWalletInterface {
  const keypairRef = useRef<Keypair | null>(null);
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
    if (!keypairRef.current || !sessionToken) {
      throw new Error('Keypair or session token not loaded or is not available. Please re-create the session.');
    }

    const { blockhash } = await connection.getLatestBlockhash("finalized");
    const feePayer = new PublicKey(sessionToken);

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;
    transaction.sign(keypairRef.current);

    return transaction;
  };


  const signAllTransactions = async <T extends Transaction>(transactions: T[]): Promise<T[]> => {
    return Promise.all(transactions.map((transaction) => signTransaction(transaction)));
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!keypairRef.current) {
      throw new Error('Keypair not loaded or is not available. Please re-create the session.');
    }
    return nacl.sign.detached(message, keypairRef.current.secretKey);
  };

  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    const signedTransaction = await signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    return txid;
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

        setSessionToken(decryptedToken);

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

      generateKeypair();

      if (!keypairRef.current) {
        throw new Error("Keypair is not available. Please re-create the session.");
      }

      // if the expiry param is null or undefined, then the session will be valid for 1 hour
      if (!validUntilTimestamp) {
        validUntilTimestamp = Math.ceil((Date.now() + 60 * 60 * 1000) / 1000);
      }

      const validUntilBN: BN | null = new BN(validUntilTimestamp);

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
      keypairRef.current = null;
    } catch (error: any) {
      console.error("Error revoking session:", error);
      setError(error);
    }
  };

  if (!wallet) {
    return {
      publicKey: null,
      sessionToken: null,
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage: undefined,
      sendTransaction: undefined,
      getSessionToken: async () => null,
      createSession: async () => undefined,
      revokeSession: async () => undefined,
      error,
    };
  }

  return {
    publicKey: sessionToken && keypairRef.current ? keypairRef.current.publicKey : null,
    sessionToken,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    getSessionToken,
    createSession,
    revokeSession,
    error,
  };
}





