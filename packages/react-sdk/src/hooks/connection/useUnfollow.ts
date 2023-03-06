import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useUnfollow = (sdk: SDK) => {
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const unfollow = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

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
        setConnectionError(err);
      } finally {
        setConnectionLoading(false);
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
      setConnectionError(null);

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
        setConnectionError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    unfollow,
    deleteConnectionIxMethodBuilder,
    connectionLoading,
    connectionError
  };
};

export { useUnfollow };
