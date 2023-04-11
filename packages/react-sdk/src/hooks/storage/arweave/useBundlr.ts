import { useEffect, useState } from 'react';
import { WebBundlr } from '@bundlr-network/client';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../../session';

export const useBundlr = (
  wallet: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta",
  useSession: boolean,
  session?: SessionWalletInterface
) => {
  const { connected } = wallet;
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
      if (!session || !session.sessionToken) {
        throw new Error('Session is required for arweave uploader');
      }
      const newBundlr = new WebBundlr(BUNDLR_URL, 'solana', session, {
        providerUrl: connection.rpcEndpoint,
      });
      await newBundlr.ready();
      setBundlr(newBundlr);
    };

    if (connected && !useSession) {
      initializeBundlr();
    } else if (connected && useSession && session && session.sessionToken) {
      initializeBundlrWithSession();
    }
  }, [connected, connection.rpcEndpoint, session?.publicKey]);

  return bundlr;
};
