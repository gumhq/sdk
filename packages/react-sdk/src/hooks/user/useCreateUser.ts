import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreateUser = (sdk: SDK) => {
  const [userPDA, setUserPDA] = useState<PublicKey | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<Error | null>(null);

  const create = useCallback(
    async (owner: PublicKey) => {
      setIsCreatingUser(true);
      setCreateUserError(null);

      try {
        const data = await createUserIxMethodBuilder(owner);
        await data?.rpc();
      } catch (err: any) {
        setCreateUserError(err);
      } finally {
        setIsCreatingUser(false);
      }
    },
    [sdk]
  );

  const getOrCreate = useCallback(
    async (owner: PublicKey) => {
      setIsCreatingUser(true);
      setCreateUserError(null);

      try {
        const userPDA = await sdk.user.getOrCreate(owner);
        setUserPDA(userPDA);
      } catch (err: any) {
        setCreateUserError(err);
      } finally {
        setIsCreatingUser(false);
      }
    },
    [sdk]);

  const createUserIxMethodBuilder = useCallback(
    async (owner: PublicKey) => {
      setCreateUserError(null);

      try {
        const user = await sdk.user.create(owner);
        setUserPDA(user?.userPDA);
        return user.instructionMethodBuilder;
      } catch (err: any) {
        setCreateUserError(err);
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
    isCreatingUser,
    createUserError
  };
};

export { useCreateUser };