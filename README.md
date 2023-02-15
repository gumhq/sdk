# gum-sdk-monorepo

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/gumhq/sdk.git
```

2. Install Lerna (if you haven't already):

```bash
npm install -g lerna
```

3. Install dependencies and link packages:

```bash
cd sdk
npx lerna bootstrap
```

4. Build the packages:

```bash
npx lerna run build
```

## Packages

### [gumhq/sdk](https://github.com/gumhq/sdk/tree/master/packages/gpl-core)

The Gum SDK is a JavaScript library for interacting with the Gum protocol. It provides a simple interface for creating and managing users, profiles, and posts. To use the @gumhq/sdk package in your project, import it and refer to the code in the gpl-core folder.

### [gumhq/react-sdk](https://github.com/gumhq/sdk/tree/master/packages/react-sdk)

The Gum React SDK is built on top of the Gum SDK and provides a set of React Hooks for interacting with the Gum protocol.

## Documentation

- [Overview](https://docs.gum.fun/introduction/overview)
- [Getting Started Guide](https://docs.gum.fun/protocol-overview/quickstart)
- [FAQ](https://docs.gum.fun/introduction/faqs)

You can find the complete documentation for the Gum SDK at https://docs.gum.fun/

## Example App

Check out the [example app](https://github.com/gumhq/gum-example-app) that uses the Gum SDK to demonstrate its capabilities. The app is a simple React app that showcases the creation of a user, profile, and post.

## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The Gum SDK is licensed under the [GNU General Public License v3.0](https://github.com/gumhq/sdk/blob/master/LICENSE).

## Support

Join our Discord community at [https://discord.gg/tCswbSK5W2](https://discord.gg/tCswbSK5W2) for any questions or support.
