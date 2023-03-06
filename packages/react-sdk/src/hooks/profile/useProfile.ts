import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useProfile = (sdk: SDK, profileAccount: PublicKey) => {
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<Error | null>(null);

  const fetchProfile = useCallback(
    async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const data = await sdk.profile.get(profileAccount);

        setProfile(data);
      } catch (err: any) {
        setProfileError(err);
      } finally {
        setProfileLoading(false);
      }
    }, [sdk, profileAccount]);

  useEffect(() => {
  fetchProfile();
  }, []);

  return { profile, profileLoading, profileError };
};

export { useProfile };