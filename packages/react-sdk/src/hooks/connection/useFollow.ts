import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useFollow = (sdk: SDK) => {
  const [connectionPDA, setConnectionPDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const follow = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setLoading(true);
      setError(null);

      try {
        const instructionMethodBuilder = await createConnectionIxMethodBuilder(
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
    [sdk]
  );

  const createConnectionIxMethodBuilder = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setError(null);

      try {
        const connection = await sdk.connection.create(
          fromProfile,
          toProfile,
          userAccount,
          owner
        );
        setConnectionPDA(connection.connectionPDA);
        return connection.instructionMethodBuilder;
      } catch (err: any) {
        setError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    follow,
    createConnectionIxMethodBuilder,
    connectionPDA,
    loading,
    error
  };
};

export { useFollow };
