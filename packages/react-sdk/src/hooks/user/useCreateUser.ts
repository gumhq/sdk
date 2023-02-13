import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreateUser = (sdk: SDK, owner: PublicKey) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.user.create(owner);

        setUser(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, owner]);

  const handleSubmitTransaction = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        await user.instructionMethodBuilder.rpc();
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [user]);

  useEffect(() => {
  createUser();
  }, [createUser]);

  return { 
    instructionMethodBuilder: user ? user.instructionMethodBuilder : undefined,
    submitTransaction: handleSubmitTransaction,
    userPDA: user ? user.userPDA : undefined,
    loading, 
    error 
  };
};

export default useCreateUser;