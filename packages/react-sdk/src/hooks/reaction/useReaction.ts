import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ReactionType } from "@gumhq/sdk/lib/reaction";

type SignAndSendTransactionFn = <T extends Transaction>(transactions: T | T[]) => Promise<string[]>;

const useReaction = (sdk: SDK, ) => {
  const [reactionPDA, setReactionPDA] = useState<PublicKey | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [createReactionError, setCreateReactionError] = useState(null);

  const createReaction = useCallback(
    async (
      reactionType: ReactionType,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      signAndSendTransaction?: SignAndSendTransactionFn
    ) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await createReactionIxMethodBuilder(reactionType, fromProfile, toPostAccount, userAccount, owner, sessionAccount);

        if (ixMethodBuilder) {
          if (signAndSendTransaction) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await signAndSendTransaction(tx);
            }
          } else {
            return await ixMethodBuilder.rpc();
          }
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );

  const createReactionIxMethodBuilder = useCallback(
    async (
      reactionType: ReactionType,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey
    ) => {
      try {
        const data = await sdk.reaction.create(fromProfile, toPostAccount, reactionType, userAccount, owner, sessionAccount);
        setReactionPDA(data.reactionPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreateReactionError(err);
        return null;
      }
    },
    [sdk]
  );

  const deleteReaction = useCallback(
    async (
      reactionAccount: PublicKey,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      refundReceiver: PublicKey = owner,
      signAndSendTransaction?: SignAndSendTransactionFn
    ) => {
      setIsReacting(true);

      try {
        const ixMethodBuilder = await deleteReactionIxMethodBuilder(reactionAccount, fromProfile, toPostAccount, userAccount, owner, sessionAccount, refundReceiver);
        
        if (ixMethodBuilder) {
          if (signAndSendTransaction) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await signAndSendTransaction(tx);
            }
          } else {
            return await ixMethodBuilder.rpc();
          }
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );


  const deleteReactionIxMethodBuilder = useCallback((
    reactionAccount: PublicKey,
    fromProfile: PublicKey,
    toPostAccount: PublicKey,
    userAccount: PublicKey,
    owner: PublicKey,
    sessionAccount?: PublicKey,
    refundReceiver: PublicKey = owner,
  ) => {
    setCreateReactionError(null);

    try {
      const data = sdk.reaction.delete(reactionAccount, fromProfile, toPostAccount, userAccount, owner, sessionAccount, refundReceiver);
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
