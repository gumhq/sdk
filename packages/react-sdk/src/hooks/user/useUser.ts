import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useUser = (sdk: SDK, userAccount: PublicKey) => {
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<Error | null>(null);

  const fetchUser = useCallback(
    async () => {
      setUserLoading(true);
      setUserError(null);

      try {
        const data = await sdk.user.get(userAccount);

        setUser(data);
      } catch (err: any) {
        setUserError(err);
      } finally {
        setUserLoading(false);
      }
    }, [sdk, userAccount]);

  useEffect(() => {
  fetchUser();
  }, []);

  return { user, userLoading, userError };
};

export { useUser };