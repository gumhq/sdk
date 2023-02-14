import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreatePost = (sdk: SDK) => {
  const [postPDA, setPostPDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (metadataUri: String, profileAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setLoading(true);
      setError(null);

      try {
        const instructionMethodBuilder = await createPostIxMethodBuilder(metadataUri, profileAccount, userAccount, owner);
        await instructionMethodBuilder?.rpc();
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk]);

  const createPostIxMethodBuilder = useCallback(
    async (metadataUri: String, profileAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setError(null);

      try {
        const data = await sdk.post.create(metadataUri, profileAccount, userAccount, owner);
        setPostPDA(data.postPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setError(err);
        return null;
      }
    }, [sdk]
  );

  return {
    create,
    createPostIxMethodBuilder,
    postPDA,
    loading,
    error
  };
};

export { useCreatePost };