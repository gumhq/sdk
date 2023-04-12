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
  uploadData: (data: File | ShadowFile, storageAccount?: PublicKey) => Promise<ShadowUploadResponse | null | undefined>;
  getOwnedStorageAccounts: () => Promise<StorageAccountResponse[]>;
  createStorageAccount: (name: string, sizeInMB: number) => Promise<CreateStorageResponse | null>;
  shadowStorage: ShdwDrive | null;
}

export const useShadowStorage = (
  wallet: WalletContextState | SessionWalletInterface,
  connection: Connection,
): ShadowStorageInterface => {
  const [shadowStorage, setShadowStorage] = useState<ShdwDrive | null>(null);
  const SHDW = new PublicKey('SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y');

  useEffect(() => {
    const initializeShadow = async () => {
      const newShadow = await new ShdwDrive(connection, wallet).init();
      setShadowStorage(newShadow);
    };

    if ((isSessionWallet(wallet) && wallet.sessionToken) || (!isSessionWallet(wallet) && wallet.connected)) {
      initializeShadow();
    }
  }, [connection.rpcEndpoint, wallet]);

  const getOwnedStorageAccounts = useCallback(async () => {
    return shadowStorage ? await shadowStorage.getStorageAccounts("v2") : [];
  }, [shadowStorage]);

  const createStorageAccount = useCallback(async (name: string, sizeInMB: number) => {
    return shadowStorage ? await shadowStorage.createStorageAccount(name, `${sizeInMB.toString()}MB`, "v2") : null;
  }, [shadowStorage]);

  const getAvailableStorage = useCallback(async (storageAccount?: PublicKey): Promise<number | null> => {
    if (shadowStorage) {
      let storageAvailable: number | null = null;

      if (!storageAccount) {
        const accounts = await getOwnedStorageAccounts();
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
  }, [shadowStorage, getOwnedStorageAccounts]);

  const hasSufficientStorageSpace = useCallback(async (requiredSizeInBytes: number, storageAccount?: PublicKey) => {
    const storageAvailable = await getAvailableStorage(storageAccount);

    return storageAvailable !== null && storageAvailable > requiredSizeInBytes;
  }, [getAvailableStorage]);

  const checkSHDWBalance = useCallback(async () => {
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
  }, [wallet]);

  const buySHDW = useCallback(async (amount: number) => {
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
  }, [wallet, connection]);

  const uploadData = useCallback(async (data: File | ShadowFile, storageAccount?: PublicKey) => {
    const requiredSizeInBytes = calculateRequiredSizeInBytes(data);
    if (shadowStorage) {
      if (!storageAccount) {
        const accounts = await getOwnedStorageAccounts();
        const gumAccount = accounts.find((account) => account.account.identifier === "Gum");

        if (gumAccount) {
          const hasSpace = await hasSufficientStorageSpace(requiredSizeInBytes, gumAccount.publicKey);
          if (!hasSpace) {
            const shdwNeeded = calculateShdwRequired(1024*5);
            const shdwBalance = await checkSHDWBalance();
            if (shdwBalance < shdwNeeded) {
              await buySHDW(shdwNeeded);
            }
            await shadowStorage.addStorage(gumAccount.publicKey, "5MB", "v2");
          }
          storageAccount = gumAccount.publicKey;
        } else {
          const shdwNeeded = calculateShdwRequired(1024*5);
          const shdwBalance = await checkSHDWBalance();
          if (shdwBalance < shdwNeeded) {
            await buySHDW(shdwNeeded);
          }
          const account = await createStorageAccount("Gum", 5);
          if (account) {
            storageAccount = new PublicKey(account.shdw_bucket);
          } else {
            throw new Error("Failed to create storage account");
          }
        }
      }
      return await shadowStorage.uploadFile(storageAccount, data);
    }
    return null;
  }, [shadowStorage, getOwnedStorageAccounts, createStorageAccount]);

  return {
    uploadData,
    getOwnedStorageAccounts,
    createStorageAccount,
    shadowStorage
  };
};
