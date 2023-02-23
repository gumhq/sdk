import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useCreateProfile = (sdk: SDK) => {
  const [profilePDA, setProfilePDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setLoading(true);
      setError(null);
      try {

        const ixMethodBuilder = await createProfileIxMethodBuilder(metadataUri, namespace, userAccount, owner);
        await ixMethodBuilder?.rpc();
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk]);

  const getOrCreate = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setLoading(true);
      setError(null);
      try {
        const profilePDA = await sdk.profile.getOrCreate(metadataUri, userAccount, namespace, owner);
        setProfilePDA(profilePDA);
      }
      catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk]);

  const createProfileIxMethodBuilder = useCallback(
    async (metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
      setError(null);

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
        setError(err);
        return null;
      }
    }, [sdk]);

  return {
    create,
    getOrCreate,
    createProfileIxMethodBuilder,
    profilePDA,
    loading,
    error
  };
};

export { useCreateProfile };