import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useUser = (sdk: SDK, userAccount: PublicKey) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.user.get(userAccount);

        setUser(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, userAccount]);

  useEffect(() => {
  fetchUser();
  }, [fetchUser]);

  return { user, loading, error };
};

export default useUser;