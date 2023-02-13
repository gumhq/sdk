import { useState, useEffect } from 'react';
import { GraphQLClient } from 'graphql-request';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { SDK } from '@gumhq/sdk';
import { Connection, ConfirmOptions, Cluster } from '@solana/web3.js';

const useGum = (wallet: AnchorWallet, connection: Connection, opts: ConfirmOptions, cluster: Cluster, graphqlClient?: GraphQLClient) => {
  const [sdk, setSdk] = useState<SDK | null>(null);
  
  useEffect(() => {
    setSdk(new SDK(wallet, connection, opts, cluster, graphqlClient));
  }, [wallet]);

  return sdk;
};

export default useGum;
