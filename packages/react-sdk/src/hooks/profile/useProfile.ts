import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useProfile = (sdk: SDK, profileAccount: PublicKey) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.profile.get(profileAccount);

        setProfile(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, profileAccount]);

  useEffect(() => {
  fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error };
};

export default useProfile;