import { useState, useEffect } from 'react';
import { WebBundlr } from '@bundlr-network/client';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { FundResponse } from '@bundlr-network/client/build/common/types';

interface ArweaveStorageHook {
  uploadData: (data: any) => Promise<{ url: string | null, error: string | null }>;
  getAccountBalance: () => Promise<number>;
  estimateMinimumFunds: (data: any) => Promise<number>;
  estimateUploadPriceInSol: (data: any) => Promise<number>;
  fundStorageNode: (amount: number) => Promise<FundResponse>;
}

export const useArweaveStorage = (wallet: WalletContextState, connection: Connection, cluster: "devnet" | "mainnet-beta"): ArweaveStorageHook => {
  const { connected, publicKey } = wallet;
  const [bundlr, setBundlr] = useState<WebBundlr | null>(null);
  const BUNDLR_URL = cluster === 'devnet' ? 'https://devnet.bundlr.network' : 'http://node1.bundlr.network';

  useEffect(() => {
    const initializeBundlr = async () => {
      const newBundlr = new WebBundlr(BUNDLR_URL, 'solana', wallet.wallet?.adapter, {
        providerUrl: connection.rpcEndpoint,
      });
      await newBundlr.ready();
      setBundlr(newBundlr);
    };

    if (connected) {
      initializeBundlr();
    }
  }, [connected, connection.rpcEndpoint]);

  const uploadData = async (data: any) => {
    if (!bundlr || !publicKey) {
      throw new Error('Bundlr not initialized');
    }
    const price = await bundlr.getPrice(data.length);
    const minimumFunds = price.multipliedBy(50);
    const balance = await bundlr.getBalance(publicKey.toBase58());
    if (balance.isLessThan(minimumFunds)) {
      try {
        await bundlr.fund(minimumFunds);
      } catch (e) {
        return { url: null, error: "Insufficient balance to upload" };
      }
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
  };

  const getAccountBalance = async () => {
    if (!bundlr || !publicKey) {
      throw new Error('Bundlr not initialized');
    }
    const balance = await bundlr.getBalance(publicKey.toBase58());
    return balance.toNumber();
  };

  const estimateMinimumFunds = async (data: any) => {
    if (!bundlr || !publicKey) {
      throw new Error('Bundlr not initialized');
    }
    const price = await bundlr.getPrice(data.length);
    const minimumFunds = price.multipliedBy(10);
    return minimumFunds.toNumber();
  };

  const estimateUploadPriceInSol = async (data: any) => {
    if (!bundlr || !publicKey) {
      throw new Error('Bundlr not initialized');
    }
    const price = await bundlr.getPrice(data.length);
    const priceInSol = price.dividedBy(LAMPORTS_PER_SOL);
    return priceInSol.toNumber();
  };

  const fundStorageNode = async (amount: number) => {
    if (!bundlr || !publicKey) {
      throw new Error('Bundlr not initialized');
    }
    const transaction = await bundlr.fund(amount);
    return transaction;
  };

  return {  
    uploadData,
    getAccountBalance,
    estimateMinimumFunds,
    estimateUploadPriceInSol,
    fundStorageNode,
  };
};
