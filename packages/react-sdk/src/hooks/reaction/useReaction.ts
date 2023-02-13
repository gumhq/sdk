import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { ReactionType } from "@gumhq/sdk/lib/reaction";

const useReaction = (sdk: SDK, fromProfile: PublicKey, toPostAccount: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitTransaction = useCallback(async (connection: any) => {
    setLoading(true);
    setError(null);

    try {
      await connection.instructionMethodBuilder.rpc();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReaction = useCallback(
    async (reactionType: ReactionType) => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.reaction.create(fromProfile, toPostAccount, reactionType, userAccount, owner);
        return { 
          instructionMethodBuilder: data?.instructionMethodBuilder,
          submitTransaction: data.instructionMethodBuilder ? handleSubmitTransaction(data) : undefined,
          reactionPDA: data.reactionPDA,
          loading: false, 
          error: null
        };
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, fromProfile, toPostAccount, userAccount, owner]);

  const deleteReaction = useCallback(
    async (reactionAccount: PublicKey) => {
      setLoading(true);
      setError(null);

      try {
        const data = sdk.reaction.delete(reactionAccount, fromProfile, toPostAccount, userAccount, owner);
        
        return {
          instructionMethodBuilder: data,
          submitTransaction: data ? handleSubmitTransaction(data) : undefined,
          loading: false,
          error: null
        };

      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, fromProfile, toPostAccount, userAccount, owner]);

  return { 
    createReaction,
    deleteReaction,
    loading,
    error
  };
};

export default useReaction;
