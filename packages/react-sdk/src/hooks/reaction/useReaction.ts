import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { ReactionType } from "@gumhq/sdk/lib/reaction";

const useReaction = (sdk: SDK, ) => {
  const [reactionPDA, setReactionPDA] = useState<PublicKey | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [createReactionError, setCreateReactionError] = useState(null);

  const createReaction = useCallback(
    async (reactionType: ReactionType, fromProfile: PublicKey, toPostAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await createReactionIxMethodBuilder(reactionType, fromProfile, toPostAccount, userAccount, owner);
        await ixMethodBuilder?.rpc();
        
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    }, [sdk]);

  const createReactionIxMethodBuilder = useCallback(
    async (reactionType: ReactionType, fromProfile: PublicKey, toPostAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setCreateReactionError(null);

      try {
        const data = await sdk.reaction.create(fromProfile, toPostAccount, reactionType, userAccount, owner);
        setReactionPDA(data.reactionPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreateReactionError(err);
        return null;
      }
    }, [sdk]);


  const deleteReaction = useCallback(
    async (reactionAccount: PublicKey, fromProfile: PublicKey, toPostAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await deleteReactionIxMethodBuilder(reactionAccount, fromProfile, toPostAccount, userAccount, owner);
        await ixMethodBuilder?.rpc();
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    }, [sdk]);

    const deleteReactionIxMethodBuilder = useCallback(
      async (reactionAccount: PublicKey, fromProfile: PublicKey, toPostAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
        setCreateReactionError(null);

        try {
          const data = sdk.reaction.delete(reactionAccount, fromProfile, toPostAccount, userAccount, owner);
          return data;
        } catch (err: any) {
          setCreateReactionError(err);
          return null;
        }
      }, [sdk]);



  return { 
    createReaction,
    createReactionIxMethodBuilder,
    deleteReaction,
    deleteReactionIxMethodBuilder,
    reactionPDA,
    isReacting,
    createReactionError
  };
};

export { useReaction };
