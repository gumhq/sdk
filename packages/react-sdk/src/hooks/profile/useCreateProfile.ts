import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useCreateProfile = (sdk: SDK) => {
  const [state, setState] = useState({
    isCreatingProfile: false,
    createProfileError: null as Error | null,
  });

  const create = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const ixMethodBuilder = await createProfileIxMethodBuilder(metadataUri, namespace, userAccount, owner);
        await ixMethodBuilder?.instructionMethodBuilder.rpc();
        setState({ isCreatingProfile: false, createProfileError: null });
        return ixMethodBuilder?.profilePDA;
      } catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
      }
    }, [sdk]);

  const getOrCreate = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const profilePDA = await sdk.profile.getOrCreate(metadataUri, userAccount, namespace, owner);
        setState({ isCreatingProfile: false, createProfileError: null });
        return profilePDA;
      }
      catch (err: any) {
        setState({ isCreatingProfile: false, createProfileError: err });
      }
    }, [sdk]);

  const createProfileIxMethodBuilder = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setState({ isCreatingProfile: true, createProfileError: null });

      try {
        const createProfile = await sdk.profile.create(userAccount, namespace, owner);
        const profileMetadata = await sdk.profileMetadata.create(metadataUri, createProfile.profilePDA, userAccount, owner);
        const profileMetadataIx = await profileMetadata.instructionMethodBuilder.instruction();

        const data = {
          instructionMethodBuilder: createProfile.instructionMethodBuilder.postInstructions(
            [profileMetadataIx]),
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
    createProfileIxMethodBuilder,
    ...state,
  };
};

export { useCreateProfile };