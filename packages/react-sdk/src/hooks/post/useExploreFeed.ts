import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";

const useExploreFeed = (sdk: SDK) => {
  const [exploreFeedData, setExploreFeedData] = useState<any>(null);
  const [exploreFeedLoading, setExploreFeedLoading] = useState(false);
  const [exploreFeedError, setExploreFeedError] = useState<Error | null>(null);

  // const fetchExploreFeed = useCallback(
  //   async () => {
  //     setExploreFeedLoading(true);
  //     setExploreFeedError(null);

  //     try {
  //       const data = await sdk.post.getPostsByNamespace(namespace);

  //       setExploreFeedData(data);
  //     } catch (err: any) {
  //       setExploreFeedError(err);
  //     } finally {
  //       setExploreFeedLoading(false);
  //     }
  //   }, [sdk]);

  // useEffect(() => {
  //   fetchExploreFeed();
  // }, []);

  return { exploreFeedData, exploreFeedLoading, exploreFeedError };
};

export { useExploreFeed };
