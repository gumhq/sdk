import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreateProfile = (sdk: SDK) => {
  const [state, setState] = useState({
    isCreatingProfile: false,
    createProfileError: null as Error | null,
  });

  const create = useCallback(
    async (metadataUri: string, screenNameAccount: PublicKey, owner: PublicKey, payer: PublicKey = owner) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const ixMethodBuilder = await createProfileIxMethodBuilder(metadataUri, screenNameAccount, owner, payer);
        await ixMethodBuilder?.instructionMethodBuilder.rpc();
        setState({ isCreatingProfile: false, createProfileError: null });
        return ixMethodBuilder?.profilePDA;
      } catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
      }
    }, [sdk]);

  const getOrCreate = useCallback(
    async (metadataUri: string, screenNameAccount: PublicKey, owner: PublicKey, payer: PublicKey = owner) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const profilePDA = await sdk.profile.getOrCreate(metadataUri, screenNameAccount, owner, payer);
        setState({ isCreatingProfile: false, createProfileError: null });
        return profilePDA;
      }
      catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
      }
    }, [sdk]);

  const createProfileWithDomain = useCallback(
    async (metadataUri: string, domainName: string, authority: PublicKey, payer: PublicKey = authority) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const ixMethodBuilder = await sdk.profile.createProfileWithGumDomain(metadataUri, domainName, authority, payer);
        await ixMethodBuilder?.instructionMethodBuilder.rpc();
        setState({ isCreatingProfile: false, createProfileError: null });
        return ixMethodBuilder?.profilePDA;
      } catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
      }
    }, [sdk]);

  const createProfileIxMethodBuilder = useCallback(
    async (metadataUri: string, screenNameAccount: PublicKey, authority: PublicKey, payer: PublicKey) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const createProfile = await sdk.profile.create(metadataUri, screenNameAccount, authority, payer);

        const data = {
          instructionMethodBuilder: createProfile.instructionMethodBuilder,
          profilePDA: createProfile.profilePDA,
        }
        setState({ isCreatingProfile: false, createProfileError: null });
        return data;
      } catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
        return null;
      }
    }, [sdk]);

  return {
    create,
    getOrCreate,
    createProfileWithDomain,
    createProfileIxMethodBuilder,
    ...state,
  };
};

export { useCreateProfile };