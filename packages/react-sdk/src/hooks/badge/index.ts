import { GATEWAY_SERVICE_URL, SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { WalletContextState } from "@solana/wallet-adapter-react";

const useBadge = (sdk: SDK) => {
  const [state, setState] = useState({
    isProcessing: false,
    processingError: null as Error | null,
  });

  const createBadge = useCallback(
    async (
      metadataUri: string,
      issuer: PublicKey,
      schema: PublicKey,
      holder: PublicKey,
      updateAuthority: PublicKey,
      authority: PublicKey
    ) => {
      setState({ isProcessing: true, processingError: null });

      try {
        const { badgePDA, instructionMethodBuilder } = await sdk.badge.createBadge(metadataUri, issuer, schema, holder, updateAuthority, authority);
        await instructionMethodBuilder.rpc();
        setState({ isProcessing: false, processingError: null });
        return badgePDA;
      } catch (err: any) {
        setState({ isProcessing: false, processingError: err });
      }
    },
    [sdk.badge]
  );

  const updateBadge = useCallback(
    async (
      metadataUri: string,
      badgeAccount: PublicKey,
      issuer: PublicKey,
      schema: PublicKey,
      signer: PublicKey
    ) => {
      setState({ isProcessing: true, processingError: null });

      try {
        const instructionMethodBuilder = await sdk.badge.updateBadge(metadataUri, badgeAccount, issuer, schema, signer);
        await instructionMethodBuilder.rpc();
        setState({ isProcessing: false, processingError: null });
      } catch (err: any) {
        setState({ isProcessing: false, processingError: err });
      }
    },
    [sdk.badge]
  );

  const createIssuer = useCallback(
    async (
      authority: PublicKey
    ) => {
      setState({ isProcessing: true, processingError: null });

      try {
        const { issuerPDA, instructionMethodBuilder } = await sdk.badge.createIssuer(authority);
        await instructionMethodBuilder.rpc();
        setState({ isProcessing: false, processingError: null });
        return issuerPDA;
      } catch (err: any) {
        setState({ isProcessing: false, processingError: err });
      }
    },
    [sdk.badge]
  );

  const createSchema = useCallback(
    async (
      metadataUri: string,
      authority: PublicKey
    ) => {
      setState({ isProcessing: true, processingError: null });

      try {
        const { schemaPDA, instructionMethodBuilder } = await sdk.badge.createSchema(metadataUri, authority);
        await instructionMethodBuilder.rpc();
        setState({ isProcessing: false, processingError: null });
        return schemaPDA;
      } catch (err: any) {
        setState({ isProcessing: false, processingError: err });
      }
    },
    [sdk.badge]
  );

    const issueGatewayBadge = useCallback(
    async (
      wallet: WalletContextState,
      holderWallet: PublicKey,
      holderProfile: PublicKey,
      schemaAccount: PublicKey,
      issuer: PublicKey,
      gumTld: PublicKey,
      appId: string,
      dateJoined: string,
      authority: PublicKey,
      updateAuthority?: PublicKey,
    ) => {
      setState({ isProcessing: true, processingError: null });

      // Sign message
      const message = new TextEncoder().encode("Issue Gateway Badge");
      if (!wallet.signMessage) {
        throw new Error("Wallet does not support signMessage");
      }
      const signature = await wallet.signMessage(message);

      const [badgePDA, _] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("badge"),
          issuer.toBuffer(),
          schemaAccount.toBuffer(),
          holderProfile.toBuffer(),
        ],
        sdk.program.programId
      );
      try {
        const gatewayResponse = await axios.post(`${GATEWAY_SERVICE_URL}/issueBadge`, {
          signature,
          userWallet: holderWallet.toBase58(),
          profileAddress: holderProfile.toBase58(),
          issuerAddress: issuer.toBase58(),
          badgeAddress: badgePDA.toBase58(),
          gumTld: gumTld.toBase58(),
          appName: appId,
          dateJoined,
          authority: authority.toBase58(),
        });
        const gatewayBadge = gatewayResponse.data.createCredential;
        if (!gatewayBadge) {
          throw new Error("Failed to issue gateway badge");
        }
        const metadataUri = `gateway://${gatewayBadge.id}`;
        const badge = await createBadge(
          metadataUri,
          issuer,
          schemaAccount,
          holderProfile,
          updateAuthority || authority,
          authority,
        );
        setState({ isProcessing: false, processingError: null });
        return badge;
      } catch (err: any) {
        setState({ isProcessing: false, processingError: err });
      }
    },
    [sdk.badge]
  );

  return {
    createBadge,
    updateBadge,
    createIssuer,
    createSchema,
    issueGatewayBadge,
    ...state,
  };
};

export { useBadge };
