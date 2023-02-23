import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreateUser = (sdk: SDK) => {
  const [userPDA, setUserPDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (owner: PublicKey) => {
      setLoading(true);
      setError(null);

      try {
        const data = await createUserIxMethodBuilder(owner);
        await data?.rpc();
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [sdk]
  );

  const getOrCreate = useCallback(
    async (owner: PublicKey) => {
      setLoading(true);
      setError(null);

      try {
        const userPDA = await sdk.user.getOrCreate(owner);
        setUserPDA(userPDA);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [sdk]);

  const createUserIxMethodBuilder = useCallback(
    async (owner: PublicKey) => {
      setError(null);

      try {
        const user = await sdk.user.create(owner);
        setUserPDA(user?.userPDA);
        return user.instructionMethodBuilder;
      } catch (err: any) {
        setError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    create,
    getOrCreate,
    createUserIxMethodBuilder,
    userPDA,
    loading,
    error
  };
};

export { useCreateUser };