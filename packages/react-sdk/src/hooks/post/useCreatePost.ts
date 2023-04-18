import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

const useCreatePost = (sdk: SDK) => {
  const [postPDA, setPostPDA] = useState<PublicKey | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<Error | null>(null);

  const create = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      sendTransaction?: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsCreatingPost(true);
      setCreatePostError(null);

      try {
        const ixMethodBuilder = await createPostIxMethodBuilder(metadataUri, profileAccount, userAccount, owner, sessionAccount);
        const tx = await ixMethodBuilder?.transaction();

        if (sendTransaction) {
          if (tx) {
            return await sendTransaction(tx, connection, options);
          }
        } else {
          return await ixMethodBuilder?.rpc();
        }
      } catch (err: any) {
        setCreatePostError(err);
      } finally {
        setIsCreatingPost(false);
      }
    },
    [sdk]
  );

  const createPostIxMethodBuilder = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey
    ) => {
      setCreatePostError(null);

      try {
        const data = await sdk.post.create(metadataUri, profileAccount, userAccount, owner, sessionAccount);
        setPostPDA(data.postPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreatePostError(err);
        return null;
      }
    },
    [sdk]
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