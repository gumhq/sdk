# @gumhq/sdk

## Overview
Gum is a developer toolkit for building user-centric crypto apps. The Gum protocol prioritizes people over the protocol itself, and with its simple SDK, components, and powerful APIs, developers can enhance their apps with social profiles, activity feeds, embedded actions, and engagement loops. Our goal is to create an ecosystem where developers can easily build a variety of web3 apps with ease, making building crypto apps fun and enjoyable.

## Getting Started

To start using the @gumhq/sdk, you will need to install it as a dependency in your project. You can do this using npm by running the following command in your terminal:

```bash
yarn add @gumhq/sdk
```

Once installed, you can import and start using the package in your project by including the following line of code:

```typescript
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@gumhq/sdk";
import { Cluster, ConfirmOptions, Connection } from "@solana/web3.js";

export const useGumSDK = (connection: Connection, opts: ConfirmOptions, cluster: Cluster) => {
  const anchorWallet = useAnchorWallet() as AnchorWallet;

  const sdk = new SDK(
        anchorWallet,
        connection,
        opts,
        cluster
      );
  return sdk;
};

```

## Usage

### Create a new user

```typescript
const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);
const sdk = useGumSDK(connection, { preflightCommitment: "confirmed" }, "devnet");

const handleCreateUser = useCallback(async () => {
  const program = await sdk.user.create(pubKey);
  const tx = await program.program.transaction();
  tx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
  tx.feePayer = pubKey;
  await wallet.sendTransaction(tx, sdk.rpcConnection);
}, [sdk, pubKey, wallet]);
```

### Get a user

```typescript
const users = await sdk.program.account.user.all([{ memcmp: { offset: 8, bytes: pubKey.toBase58() } }]);
```

## Support

If you have any questions, please reach out to us on [Discord](https://discord.gg/tCswbSK5W2).
