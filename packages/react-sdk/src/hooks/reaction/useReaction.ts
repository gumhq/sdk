import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import { ReactionType } from "@gumhq/sdk/lib/reaction";

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

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
      sendTransactionFn?: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await createReactionIxMethodBuilder(reactionType, fromProfile, toPostAccount, userAccount, owner, sessionAccount);

        if (ixMethodBuilder) {
          if (sendTransactionFn) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await sendTransactionFn(tx, connection, options);
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
      sendTransaction?: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsReacting(true);

      try {
        const ixMethodBuilder = deleteReactionIxMethodBuilder(reactionAccount, fromProfile, toPostAccount, userAccount, owner, sessionAccount, refundReceiver);
        
        if (ixMethodBuilder) {
          if (sendTransaction) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await sendTransaction(tx, connection, options);
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
