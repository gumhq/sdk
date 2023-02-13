import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useCreateProfile = (sdk: SDK, metadataUri: String, namespace: Namespace, userAccount: PublicKey, owner: PublicKey) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProfile = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const createProfile = await sdk.profile.create(userAccount, namespace, owner);
        const profileMetadata = await sdk.profileMetadata.create(metadataUri, createProfile.profilePDA, userAccount, owner);
        const profileMetadataIx = await profileMetadata.instructionMethodBuilder.instruction();

        const profile = {
          instructionMethodBuilder: createProfile.instructionMethodBuilder.postInstructions(
          [profileMetadataIx]),
          profilePDA: createProfile.profilePDA,
        }
        setProfile(profile);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, owner]);

    const handleSubmitTransaction = useCallback(
      async () => {
        setLoading(true);
        setError(null);
        try {
          await profile.instructionMethodBuilder.rpc();
        } catch (err: any) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }, [profile]);

  useEffect(() => {
  createProfile();
  }, [createProfile]);

  return { 
    instructionMethodBuilder: profile ? profile.instructionMethodBuilder : undefined,
    submitTransaction: handleSubmitTransaction,
    profilePDA: profile ? profile.profilePDA : undefined,
    loading, 
    error 
  };
};

export default useCreateProfile;