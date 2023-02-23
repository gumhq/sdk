# Gum React SDK

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/@gumhq/react-sdk?color=%23d45bff">
  <img alt="npm" src="https://img.shields.io/npm/dt/@gumhq/react-sdk?color=%23d45bff">
</p>

## Installation

```bash
yarn add @gumhq/react-sdk
```

## Documentation

For more detailed documentation, please visit the [Gum documentation](https://docs.gum.fun/).

## Usage

The `useGum` hook provides the Gum SDK instance and the `useCreateUser` hook provides a function to create a new user.

```tsx
import { useGum, useCreateUser } from "@gumhq/react-sdk";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

const App = () => {
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com", "confirmed"),
    []
  );
  const sdk = useGum(
    anchorWallet,
    connection,
    { preflightCommitment: "confirmed" },
    "devnet"
  );

  const { create, error, loading } = useCreateUser(sdk!);

  return (
    <button
      onClick={() => {
        create(anchorWallet?.publicKey as PublicKey);
      }}
    >
      Create User
    </button>
  );
};

export default App;
```

## Example App

Check out the [example app](https://github.com/gumhq/gum-example-app) that uses the react-sdk to demonstrate its capabilities. The app is a simple React app that showcases the creation of a user, profile, and post.

## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The Gum SDK is licensed under the [GNU General Public License v3.0](https://github.com/gumhq/sdk/blob/master/packages/react-sdk/LICENSE).

## Support

Join our Discord community at [https://discord.gg/tCswbSK5W2](https://discord.gg/tCswbSK5W2) for any questions or support.
