import { useMemo } from 'react';
import { GraphQLClient } from 'graphql-request';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { SDK } from '@gumhq/sdk';
import { Connection, ConfirmOptions, Cluster } from '@solana/web3.js';

const useGum = (
  wallet: AnchorWallet,
  connection: Connection,
  opts: ConfirmOptions,
  cluster: Cluster | "localnet",
  graphqlClient?: GraphQLClient
) => {
  const sdk = useMemo(() => {
    return new SDK(wallet, connection, opts, cluster, graphqlClient);
  }, [wallet]);

  return sdk;
};

export { useGum };
