import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const usePost = (sdk: SDK, postAccount: PublicKey) => {
  const [post, setPost] = useState<any>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<Error | null>(null);

  const fetchPost = useCallback(
    async () => {
      setPostLoading(true);
      setPostError(null);

      try {
        const data = await sdk.post.get(postAccount);

        setPost(data);
      } catch (err: any) {
        setPostError(err);
      } finally {
        setPostLoading(false);
      }
    }, [sdk, postAccount]);

  useEffect(() => {
  fetchPost();
  }, []);

  return { post, postLoading, postError };
};

export { usePost };