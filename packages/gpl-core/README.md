# @gumhq/sdk

## Overview
Gum is a developer toolkit for building user-centric crypto apps. The Gum protocol prioritizes people over the protocol itself, and with its simple SDK, components, and powerful APIs, developers can enhance their apps with social profiles, activity feeds, embedded actions, and engagement loops. Our goal is to create an ecosystem where developers can easily build a variety of web3 apps with ease, making building crypto apps fun and enjoyable.

## Getting Started

To start using the @gumhq/sdk, you will need to install it as a dependency in your project. You can do this using npm by running the following command in your terminal:

```bash
yarn add @gumhq/sdk
```

### Setup Gum SDK

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

here is an example of how to use the Gum SDK in a React app:

```typescript
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useCallback } from "react";
import { Connection } from "@solana/web3.js";
import { useGumSDK } from "./useGumSDK";

const wallet = useWallet();
const userPublicKey = wallet.publicKey;
const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);
const sdk = useGumSDK(connection, { preflightCommitment: "confirmed" }, "devnet");
```

## Usage

### Create a new user

```typescript
const handleCreateUser = useCallback(async () => {
  const { program, userPDA } = await sdk.user.create(userPublicKey);
  const tx = await program.transaction();
  tx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
  tx.feePayer = userPublicKey;
  await wallet.sendTransaction(tx, sdk.rpcConnection);
}, [sdk, userPublicKey, wallet]);
```

### Get all user accounts info of a user

```typescript
const users = await sdk.program.account.user.getUserAccountsInfo(userPublicKey);
```

### Create a new profile

```typescript
const handleCreateProfile = useCallback(async (userPDA: PublicKey, namespace: String, userPublicKey: PublicKey) => {
  if (!userPDA || !namespace || !userPublicKey) return;
  const { program, profilePDA } = await sdk.profile.create(userPDA, "Personal", userPublicKey);
  const tx = await program.transaction();
  tx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
  tx.feePayer = userPublicKey;
  await wallet.sendTransaction(tx, sdk.rpcConnection);
}, [sdk, userPDA, userPublicKey, wallet]);
```

### Create a new post

```typescript
const handleCreatePost = useCallback(async (metadataUri: String, profilePDA: PublicKey, userPDA: PublicKey, userPublicKey: PublicKey) => {
  if (!metadataUri || !userPDA || !profilePDA) return;
  const { program, postPda } = await sdk.post.create(metadataUri, profilePDA, userPDA, userPublicKey);
  const tx = await program.transaction();
  tx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
  tx.feePayer = userPublicKey;
  await wallet.sendTransaction(tx, sdk.rpcConnection)
  }, [sdk, userPublicKey, wallet]);
```

## Example App

You can find an example app using the Gum SDK [here](https://github.com/gumhq/gum-example-app). This app is a simple React app that uses the Gum SDK to create a user, create a profile, and create a post.

## Support

If you have any questions, please reach out to us on [Discord](https://discord.gg/tCswbSK5W2).
