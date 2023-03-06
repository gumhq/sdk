import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useFollow = (sdk: SDK) => {
  const [connectionPDA, setConnectionPDA] = useState<PublicKey | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const follow = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const instructionMethodBuilder = await createConnectionIxMethodBuilder(
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
    [sdk]
  );

  const createConnectionIxMethodBuilder = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey
    ) => {
      setConnectionError(null);

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
        setConnectionError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    follow,
    createConnectionIxMethodBuilder,
    connectionPDA,
    connectionLoading,
    connectionError
  };
};

export { useFollow };
