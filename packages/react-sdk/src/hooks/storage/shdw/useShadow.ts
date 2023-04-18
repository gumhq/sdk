import { useCallback, useEffect, useState } from 'react';
import {
  ShadowFile,
  ShdwDrive,
  StorageAccountResponse,
  CreateStorageResponse,
  ShadowUploadResponse,
} from '@shadow-drive/sdk';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getOrca, OrcaPoolConfig } from '@orca-so/sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Decimal from 'decimal.js';
import {
  isSessionWallet,
  calculateShdwAmount,
  buyShdwWithSol,
  calculateShdwRequired,
  calculateRequiredSizeInBytes,
} from './shadowStorageUtils';
import { SessionWalletInterface } from 'src/hooks/session';

export interface ShadowStorageInterface {
  uploadData: (data: File | ShadowFile, wallet: WalletContextState | SessionWalletInterface, storageAccount?: PublicKey) => Promise<ShadowUploadResponse | null | undefined>;
  getOwnedStorageAccounts: (wallet: WalletContextState | SessionWalletInterface) => Promise<StorageAccountResponse[]>;
  createStorageAccount: (name: string, sizeInMB: number, wallet: WalletContextState | SessionWalletInterface, owner2?: PublicKey) => Promise<CreateStorageResponse | null>;
}

/**
 * Custom React hook to interact with the Shadow Drive storage system.
 *
 * @param wallet - The wallet object, which should be of type WalletContextState or SessionWalletInterface.
 * @param connection - The connection object, which should be of type Connection from the @solana/web3.js package.
 * @returns An object containing methods to upload data, manage storage accounts, and interact with the Shadow token (SHDW).
 */
export const useShadowStorage = (
  connection: Connection,
): ShadowStorageInterface => {
  const SHDW = new PublicKey('SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y');

    const initializeShadow = async (wallet: WalletContextState | SessionWalletInterface) => {
      const shdwInstance = await new ShdwDrive(connection, wallet).init();
      return shdwInstance;
    };

  /**
   * Fetch the list of owned storage accounts.
   *
   * @returns A promise that resolves to an array of StorageAccountResponse objects.
   */
  const getOwnedStorageAccounts = useCallback(async (wallet: WalletContextState | SessionWalletInterface) => {
    const shadowStorage = await initializeShadow(wallet);
    return shadowStorage ? await shadowStorage.getStorageAccounts("v2") : [];
  }, []);

  /**
   * Create a new storage account.
   *
   * @param name - The name of the new storage account.
   * @param sizeInMB - The size of the new storage account in MB.
   * @param owner2 - An optional PublicKey for the second owner of the storage account.
   * @returns A promise that resolves to a CreateStorageResponse object or null.
   */
  const createStorageAccount = useCallback(async (name: string, sizeInMB: number, wallet: WalletContextState | SessionWalletInterface, owner2?: PublicKey) => {
    const shadowStorage = await initializeShadow(wallet);
    return shadowStorage ? await shadowStorage.createStorageAccount(name, `${sizeInMB.toString()}MB`, "v2", owner2) : null;
  }, []);

  const getAvailableStorage = useCallback(async (wallet: WalletContextState | SessionWalletInterface, storageAccount?: PublicKey): Promise<number | null> => {
    const shadowStorage = await initializeShadow(wallet);
    if (shadowStorage) {
      let storageAvailable: number | null = null;

      if (!storageAccount) {
        const accounts = await getOwnedStorageAccounts(wallet);
        const gumAccount = accounts.find((account) => account.account.identifier === "Gum");

        if (gumAccount) {
          storageAvailable = gumAccount.account.storageAvailable;
        }
      } else {
        const account = await shadowStorage.getStorageAccount(storageAccount);

        if (account) {
          storageAvailable = Number(account.reserved_bytes) - Number(account.current_usage);
        }
      }

      return storageAvailable;
    }

    return null;
  }, [getOwnedStorageAccounts]);

  const hasSufficientStorageSpace = useCallback(async (wallet: WalletContextState | SessionWalletInterface, requiredSizeInBytes: number, storageAccount?: PublicKey) => {
    const storageAvailable = await getAvailableStorage(wallet, storageAccount);

    return storageAvailable !== null && storageAvailable > requiredSizeInBytes;
  }, [getAvailableStorage]);

  const checkSHDWBalance = useCallback(async (wallet: WalletContextState | SessionWalletInterface) => {
    if (!wallet?.publicKey) return;

    const response = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const solBalance = await connection.getBalance(wallet?.publicKey);
    if (solBalance < 0.005) {
      return;
    }

    const shdwToken = response.value.find(
      (account) => account.account.data.parsed.info.mint === SHDW.toBase58()
    );
    const shdwTokenBalance =
      shdwToken?.account.data.parsed.info.tokenAmount.uiAmountString || 0;
    return shdwTokenBalance;
  }, []);

  const buySHDW = useCallback(async (wallet: WalletContextState | SessionWalletInterface, amount: number) => {
    if (!wallet.publicKey) return;

    const orca = getOrca(connection);
    const orcaSolPool = orca.getPool(OrcaPoolConfig.SHDW_SOL);

    const checkSolAmount = new Decimal(1);
    const checkShdwAmount = await calculateShdwAmount(orcaSolPool, checkSolAmount);
    const checkShdwAmountNumber = checkShdwAmount.toNumber();

    const solAmount = new Decimal((checkSolAmount.toNumber() / checkShdwAmountNumber) * amount);
    const shdwAmount = await calculateShdwAmount(orcaSolPool, solAmount);

    const tx = await buyShdwWithSol(orcaSolPool, wallet, connection, solAmount, shdwAmount);

    return tx;
  }, [connection]);

  /**
   * Upload a file to a storage account, and handle storage and token requirements.
   *
   * @param data - The file to be uploaded, which should be of type File or ShadowFile.
   * @param storageAccount - An optional PublicKey for the target storage account.
   * @returns A promise that resolves to a ShadowUploadResponse object, null, or undefined.
   */
  const uploadData = useCallback(async (data: File | ShadowFile, wallet: WalletContextState | SessionWalletInterface, storageAccount?: PublicKey, makeStorageAccountImmutable: boolean = true) => {
    const shadowStorage = await initializeShadow(wallet);
    const requiredSizeInBytes = calculateRequiredSizeInBytes(data);
    if (shadowStorage) {
      if (!storageAccount) {
        const accounts = await getOwnedStorageAccounts(wallet);
        const gumAccount = accounts.find((account) => account.account.identifier === "Gum");

        if (gumAccount) {
          const hasSpace = await hasSufficientStorageSpace(wallet, requiredSizeInBytes, gumAccount.publicKey);
          if (!hasSpace) {
            const shdwNeeded = calculateShdwRequired(1024*5);
            const shdwBalance = await checkSHDWBalance(wallet);
            if (shdwBalance < shdwNeeded) {
              await buySHDW(wallet, shdwNeeded);
            }
            await shadowStorage.addStorage(gumAccount.publicKey, "5MB", "v2");
          }
          storageAccount = gumAccount.publicKey;
        } else {
          const shdwNeeded = calculateShdwRequired(1024*5);
          const shdwBalance = await checkSHDWBalance(wallet);
          if (shdwBalance < shdwNeeded) {
            await buySHDW(wallet, shdwNeeded);
          }
          const ownerPublicKey = isSessionWallet(wallet) ? wallet.ownerPublicKey ?? undefined : wallet.publicKey ?? undefined;
          const account = await createStorageAccount("Gum", 5, wallet, ownerPublicKey);
          if (account) {
            storageAccount = new PublicKey(account.shdw_bucket);
          } else {
            throw new Error("Failed to create storage account");
          }
          if (makeStorageAccountImmutable) {
            const response = await shadowStorage.makeStorageImmutable(storageAccount, "v2");
            if (!response) {
              throw new Error("Failed to make storage account immutable");
            }
          }
        }
      }
      return await shadowStorage.uploadFile(storageAccount, data);
    }
    return null;
  }, [getOwnedStorageAccounts, createStorageAccount]);

  return {
    uploadData,
    getOwnedStorageAccounts,
    createStorageAccount,
  };
};
