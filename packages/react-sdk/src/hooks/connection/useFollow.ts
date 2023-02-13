import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useFollow = (sdk: SDK, fromProfile: PublicKey, toProfile: PublicKey, userAccount: PublicKey, owner: PublicKey) => {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createConnection = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.connection.create(fromProfile, toProfile, userAccount, owner);
        setConnection(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    createConnection();
  }, [sdk, fromProfile, toProfile, userAccount, owner]);

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

  return { 
    instructionMethodBuilder: connection?.instructionMethodBuilder,
    submitTransaction: connection?.instructionMethodBuilder ? handleSubmitTransaction : undefined,
    connectionPDA: connection?.connectionPDA,
    loading, 
    error 
  };
};

export default useFollow;
