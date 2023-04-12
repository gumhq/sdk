import { useEffect, useState } from 'react';
import { WebBundlr } from '@bundlr-network/client';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../../session';

function isSessionWallet(wallet: WalletContextState | SessionWalletInterface): wallet is SessionWalletInterface {
  return 'sessionToken' in wallet;
}

export const useBundlr = (
  wallet: WalletContextState | SessionWalletInterface,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta"
) => {
  const isConnected = isSessionWallet(wallet) ? !!wallet.sessionToken : wallet.connected;
  const useSession = isSessionWallet(wallet);
  const [bundlr, setBundlr] = useState<WebBundlr | null>(null);
  const BUNDLR_URL = cluster === 'devnet' ? 'https://devnet.bundlr.network' : 'http://node1.bundlr.network';

  useEffect(() => {
    const initializeBundlr = async () => {
      const newBundlr = new WebBundlr(BUNDLR_URL, 'solana', wallet, {
        providerUrl: connection.rpcEndpoint,
      });
      await newBundlr.ready();
      setBundlr(newBundlr);
    };

    const initializeBundlrWithSession = async () => {
      if (!isSessionWallet(wallet) || !wallet.sessionToken) {
        throw new Error('Session is required for arweave uploader');
      }
      const newBundlr = new WebBundlr(BUNDLR_URL, 'solana', wallet, {
        providerUrl: connection.rpcEndpoint,
      });
      await newBundlr.ready();
      setBundlr(newBundlr);
    };

    if (isConnected) {
      if (useSession) {
        initializeBundlrWithSession();
      } else {
        initializeBundlr();
      }
    }
  }, [isConnected, connection.rpcEndpoint, wallet]);

  return bundlr;
};
