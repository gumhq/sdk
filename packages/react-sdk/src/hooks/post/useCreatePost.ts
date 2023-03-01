import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreatePost = (sdk: SDK) => {
  const [postPDA, setPostPDA] = useState<PublicKey | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<Error | null>(null);

  const create = useCallback(
    async (metadataUri: String, profileAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setIsCreatingPost(true);
      setCreatePostError(null);

      try {
        const instructionMethodBuilder = await createPostIxMethodBuilder(metadataUri, profileAccount, userAccount, owner);
        await instructionMethodBuilder?.rpc();
      } catch (err: any) {
        setCreatePostError(err);
      } finally {
        setIsCreatingPost(false);
      }
    }, [sdk]);

  const createPostIxMethodBuilder = useCallback(
    async (metadataUri: String, profileAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setCreatePostError(null);

      try {
        const data = await sdk.post.create(metadataUri, profileAccount, userAccount, owner);
        setPostPDA(data.postPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreatePostError(err);
        return null;
      }
    }, [sdk]
  );

  return {
    create,
    createPostIxMethodBuilder,
    postPDA,
    isCreatingPost,
    createPostError
  };
};

export { useCreatePost };