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

The `useGumContext`, `useCreateProfile`, and `useUploaderContext` hooks provide the necessary utilities to create a new profile.

```tsx
import {
  useCreateProfile,
  useGumContext,
  useUploaderContext,
} from "@gumhq/react-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function ProfileCreation() {
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const wallet = useWallet();
  const { publicKey } = wallet;
  const { sdk } = useGumContext(); // access the Gum SDK
  const { createProfileWithDomain } = useCreateProfile(sdk); // create a new profile
  const { handleUpload } = useUploaderContext(); // upload metadata to Arweave/GenesysGo

  const createProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const profileMetadata = {
      name: profileName,
      bio: profileBio,
      avatar: profileAvatar,
    };

    const uploadResponse = await handleUpload(profileMetadata, wallet);
    if (!uploadResponse) {
      console.error("Error uploading profile metadata");
      return false;
    }

    const profileResponse = await createProfileWithDomain(
      uploadResponse.url,
      profileUsername,
      publicKey
    );
    if (!profileResponse) {
      console.error("Error creating profile");
      return false;
    }

    console.log("Profile created successfully", profileResponse);
  };

  // Your HTML form and fields would go here
}
```

## Gum Quickstart

The Gum Quickstart is an excellent starting point for developers aiming to leverage Gum in their Next.js applications. This ready-to-use template not only expedites the setup process, but also includes functional examples and components to facilitate the creation of domain profiles, posts, and more. Check out the [Gum Quickstart](https://github.com/gumhq/gum-quickstart) to get started.

## Example App

Check out the [example app](https://github.com/gumhq/gum-example-app) that uses the Gum SDK to demonstrate its capabilities. The app is a simple React app that showcases the creation of a domain, profile, and posts.

## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The Gum SDK is licensed under the [GNU General Public License v3.0](https://github.com/gumhq/sdk/blob/master/packages/react-sdk/LICENSE).

## Support

Join our Discord community at [https://discord.gg/tCswbSK5W2](https://discord.gg/tCswbSK5W2) for any questions or support.
