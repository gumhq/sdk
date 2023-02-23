import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { Namespace } from "@gumhq/sdk/lib/profile";

const useExploreFeed = (sdk: SDK, namespace: Namespace) => {
  const [exploreFeedData, setExploreFeedData] = useState<any>(null);
  const [exploreFeedLoading, setExploreFeedLoading] = useState(false);
  const [exploreFeedError, setExploreFeedError] = useState<Error | null>(null);

  const fetchExploreFeed = useCallback(
    async () => {
      setExploreFeedLoading(true);
      setExploreFeedError(null);

      try {
        const data = await sdk.post.getPostsByNamespace(namespace);

        setExploreFeedData(data);
      } catch (err: any) {
        setExploreFeedError(err);
      } finally {
        setExploreFeedLoading(false);
      }
    }, [sdk, namespace]);

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  return { exploreFeedData, exploreFeedLoading, exploreFeedError };
};

export { useExploreFeed };
