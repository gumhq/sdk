import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useUnfollow = (sdk: SDK) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unfollow = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setLoading(true);
      setError(null);

      try {
        const instructionMethodBuilder = await deleteConnectionIxMethodBuilder(
          connectionAccount,
          fromProfile,
          toProfile,
          userAccount,
          owner
        );
        await instructionMethodBuilder?.rpc();
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [sdk]);

  const deleteConnectionIxMethodBuilder = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setError(null);

      try {
        const data = sdk.connection.delete(
          connectionAccount,
          fromProfile,
          toProfile,
          userAccount,
          owner
        );
        return data;
      } catch (err: any) {
        setError(err);
      }
    },
    [sdk]
  );

  return {
    unfollow,
    deleteConnectionIxMethodBuilder,
    loading,
    error
  };
};

export default useUnfollow;
