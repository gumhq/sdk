import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useFeed = (sdk: SDK, profileAccount: PublicKey) => {
  const [feedData, setFeedData] = useState<any>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<Error | null>(null);

  const fetchFeed = useCallback(
    async () => {
      setFeedLoading(true);
      setFeedError(null);

      try {
        const data = await sdk.post.getPostsByFollowedUsers(profileAccount);

        setFeedData(data);
      } catch (err: any) {
        setFeedError(err);
      } finally {
        setFeedLoading(false);
      }
    }, [sdk, profileAccount]);

  useEffect(() => {
    fetchFeed();
  }, []);

  return { feedData, feedLoading, feedError };
};

export { useFeed };
