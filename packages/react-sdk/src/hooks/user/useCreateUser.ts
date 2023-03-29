import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useCreateUser = (sdk: SDK) => {
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<Error | null>(null);

  const create = useCallback(
    async (owner: PublicKey) => {
      setIsCreatingUser(true);
      setCreateUserError(null);

      try {
        const data = await createUserIxMethodBuilder(owner);
        await data?.instructionMethodBuilder.rpc();
        return data?.userPDA;
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
        return userPDA;
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
        
        const data = {
          instructionMethodBuilder: user.instructionMethodBuilder,
          userPDA: user.userPDA,
        }
        return data;
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
    isCreatingUser,
    createUserError
  };
};

export { useCreateUser };