import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useCreateProfile = (sdk: SDK) => {
  const [profilePDA, setProfilePDA] = useState<PublicKey | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [createProfileError, setCreateProfileError] = useState<Error | null>(null);

  const create = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setIsCreatingProfile(true);
      setCreateProfileError(null);
      try {

        const ixMethodBuilder = await createProfileIxMethodBuilder(metadataUri, namespace, userAccount, owner);
        await ixMethodBuilder?.rpc();
      } catch (err: any) {
        setCreateProfileError(err);
      } finally {
        setIsCreatingProfile(false);
      }
    }, [sdk]);

  const getOrCreate = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setIsCreatingProfile(true);
      setCreateProfileError(null);
      try {
        const profilePDA = await sdk.profile.getOrCreate(metadataUri, userAccount, namespace, owner);
        setProfilePDA(profilePDA);
      }
      catch (err: any) {
        setCreateProfileError(err);
      } finally {
        setIsCreatingProfile(false);
      }
    }, [sdk]);

  const createProfileIxMethodBuilder = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setCreateProfileError(null);

      try {
        const createProfile = await sdk.profile.create(userAccount, namespace, owner);
        const profileMetadata = await sdk.profileMetadata.create(metadataUri, createProfile.profilePDA, userAccount, owner);
        const profileMetadataIx = await profileMetadata.instructionMethodBuilder.instruction();

        const data = {
          instructionMethodBuilder: createProfile.instructionMethodBuilder.postInstructions(
            [profileMetadataIx]),
          profilePDA: createProfile.profilePDA,
        }
        setProfilePDA(data.profilePDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreateProfileError(err);
        return null;
      }
    }, [sdk]);

  return {
    create,
    getOrCreate,
    createProfileIxMethodBuilder,
    profilePDA,
    isCreatingProfile,
    createProfileError
  };
};

export { useCreateProfile };