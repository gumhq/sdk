import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useUnfollow = (sdk: SDK, connectionAccount: PublicKey, fromProfile: PublicKey, toProfile: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConnection = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data = sdk.connection.delete(connectionAccount, fromProfile, toProfile, userAccount, owner);
        setConnection(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, connectionAccount, fromProfile, toProfile, userAccount, owner]
  );

  const handleSubmitTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await connection.instructionMethodBuilder.rpc();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    deleteConnection();
  }, [deleteConnection]);

  return { 
    instructionMethodBuilder: connection?.instructionMethodBuilder,
    submitTransaction: connection?.instructionMethodBuilder ? handleSubmitTransaction : undefined,
    loading, 
    error 
  };
};

export default useUnfollow;