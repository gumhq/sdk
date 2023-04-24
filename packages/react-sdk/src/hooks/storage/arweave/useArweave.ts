import { useCallback, useState } from 'react';
import { WebBundlr } from '@bundlr-network/client';
import BigNumber from "bignumber.js";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FundResponse } from '@bundlr-network/client/build/common/types';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../../session';

function isSessionWallet(wallet: WalletContextState | SessionWalletInterface): wallet is SessionWalletInterface {
  return 'sessionToken' in wallet;
}

export interface ArweaveStorageHook {
  uploadData: (data: any, wallet: WalletContextState | SessionWalletInterface) => Promise<{ url: string | null, signature: string | null, error: string | null }>;
  getAccountBalance: () => Promise<number>;
  estimateMinimumFunds: (data: any) => Promise<number>;
  estimateUploadPriceInSol: (data: any) => Promise<number>;
  fundStorageNode: (amount: number) => Promise<FundResponse>;
}

export const useArweaveStorage = (
  connection: Connection,
  cluster: "devnet" | "mainnet-beta"
): ArweaveStorageHook => {

  const BUNDLR_URL = cluster === 'devnet' ? 'https://devnet.bundlr.network' : 'http://node2.bundlr.network';

  const initializeBundlr = async (wallet: WalletContextState | SessionWalletInterface) => {
    if (isSessionWallet(wallet) && !wallet.sessionToken) {
      throw new Error('Session is required for arweave uploader');
    }

    const newBundlr = new WebBundlr(BUNDLR_URL, 'solana', wallet, {
      providerUrl: connection.rpcEndpoint,
    });
    await newBundlr.ready();
    return newBundlr;
  };

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
    withErrorHandling(async (data: any, wallet: WalletContextState | SessionWalletInterface) => {
      const bundlr = await initializeBundlr(wallet);

      if (!bundlr) {
        throw new Error('Bundlr not initialized');
      }

      const publicKey = wallet?.publicKey;

      if (!publicKey) {
        throw new Error('Public key not found');
      }

      if (typeof data === 'object') {
        data = JSON.stringify(data);
      }
      
      const transaction = bundlr.createTransaction(data);
      try {
        await transaction.sign();
        await transaction.upload();
      } catch (e: any) {
        if (e.message.includes("Not enough funds to send data")) {
          const price = await bundlr.getPrice(data.length);
          const minimumFunds = price.multipliedBy(1);
          const balance = await bundlr.getBalance(publicKey.toBase58());

          if (balance.isLessThan(minimumFunds)) {
            await bundlr.fund(minimumFunds);
          }

          // Retry signing and uploading after funding
          await transaction.sign();
          await transaction.upload();
        } else {
          throw e;
        }
      }

      const id = transaction.id;

      if (!id) {
        throw new Error('Transaction ID not found');
      }

      const url = `https://arweave.net/${id}`;
      const signature = transaction.signature;
      return { url, signature, error: null };
    }),
    [withErrorHandling]
  );

  const getAccountBalance = useCallback(
    withErrorHandling(async ( wallet: WalletContextState | SessionWalletInterface) => {
      const bundlr = await initializeBundlr(wallet);

      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const balance = await bundlr.getBalance(wallet.publicKey.toBase58());
      return balance.toNumber();
    }),
  [withErrorHandling]
  );

  const estimateMinimumFunds = useCallback(
    withErrorHandling(async (data: any, wallet: WalletContextState | SessionWalletInterface) => {
      const bundlr = await initializeBundlr(wallet);

      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const price = await bundlr.getPrice(data.length);
      const minimumFunds = price.multipliedBy(10);
      return minimumFunds.toNumber();
    }),
  [withErrorHandling]
  );

  const estimateUploadPriceInSol = useCallback(
    withErrorHandling(async (data: any, wallet: WalletContextState | SessionWalletInterface) => {
      const bundlr = await initializeBundlr(wallet);

      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const price = await bundlr.getPrice(data.length);
      const priceInSol = price.dividedBy(LAMPORTS_PER_SOL);
      return priceInSol.toNumber();
    }),
  [withErrorHandling]
  );

  const fundStorageNode = useCallback(
    withErrorHandling(async (amount: number, wallet: WalletContextState | SessionWalletInterface) => {
      const bundlr = await initializeBundlr(wallet);

      if (!bundlr || !wallet.publicKey) {
        throw new Error('Bundlr not initialized');
      }
      const transaction = await bundlr.fund(amount);
      return transaction;
    }),
  [withErrorHandling]
  );

  return {  
    uploadData,
    getAccountBalance,
    estimateMinimumFunds,
    estimateUploadPriceInSol,
    fundStorageNode,
  };
};
