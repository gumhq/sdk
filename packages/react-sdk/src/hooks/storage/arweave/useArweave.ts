import { useCallback } from 'react';
import BigNumber from "bignumber.js";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FundResponse } from '@bundlr-network/client/build/common/types';
import { useBundlr } from './useBundlr';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../../session';

export interface ArweaveStorageHook {
  uploadData: (data: any) => Promise<{ url: string | null, error: string | null }>;
  getAccountBalance: () => Promise<number>;
  estimateMinimumFunds: (data: any) => Promise<number>;
  estimateUploadPriceInSol: (data: any) => Promise<number>;
  fundStorageNode: (amount: number) => Promise<FundResponse>;
}

export const useArweaveStorage = (
  wallet: WalletContextState | SessionWalletInterface,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta"
): ArweaveStorageHook => {
  const bundlr = useBundlr(wallet, connection, cluster);

  const withErrorHandling = useCallback(
    (fn: (...args: any[]) => Promise<any>) => async (...args: any[]) => {
      try {
        const result = await fn(...args);
        return { ...result, error: null };
      } catch (e:any) {
        return { url: null, error: e.message };
      }
    },
    []
  );

  const uploadData = useCallback(
    withErrorHandling(async (data: any) => {
      if (!bundlr) {
        throw new Error('Bundlr not initialized');
      }

      const publicKey = wallet?.publicKey;

      if (!publicKey) {
        throw new Error('Public key not found');
      }

      const price = await bundlr.getPrice(data.length);
      const minimumFunds = price.multipliedBy(50);
      const balance = await bundlr.getBalance(publicKey.toBase58());

      if (balance.isLessThan(minimumFunds)) {
        await bundlr.fund(minimumFunds);
      }

      const transaction = bundlr.createTransaction(data);
      await transaction.sign();
      await transaction.upload();
      const id = transaction.id;

      if (!id) {
        throw new Error('Transaction ID not found');
      }

    const url = `https://arweave.net/${id}`;
    return { url, error: null };
    }),
    [bundlr, wallet, withErrorHandling]
  );

  const getAccountBalance = useCallback(
    withErrorHandling(async () => {
      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const balance = await bundlr.getBalance(wallet.publicKey.toBase58());
      return balance.toNumber();
    }),
  [bundlr, wallet.publicKey, withErrorHandling]
  );

  const estimateMinimumFunds = useCallback(
    withErrorHandling(async (data: any) => {
      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const price = await bundlr.getPrice(data.length);
      const minimumFunds = price.multipliedBy(10);
      return minimumFunds.toNumber();
    }),
  [bundlr, wallet.publicKey, withErrorHandling]
  );

  const estimateUploadPriceInSol = useCallback(
    withErrorHandling(async (data: any) => {
      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const price = await bundlr.getPrice(data.length);
      const priceInSol = price.dividedBy(LAMPORTS_PER_SOL);
      return priceInSol.toNumber();
    }),
  [bundlr, wallet.publicKey, withErrorHandling]
  );

  const fundStorageNode = useCallback(
    withErrorHandling(async (amount: number) => {
      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const transaction = await bundlr.fund(amount);
      return transaction;
    }),
  [bundlr, wallet.publicKey, withErrorHandling]
  );

  return {  
    uploadData,
    getAccountBalance,
    estimateMinimumFunds,
    estimateUploadPriceInSol,
    fundStorageNode,
  };
};
