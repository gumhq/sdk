import { SDK } from "@gumhq/sdk";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const usePost = (sdk: SDK, postAccount: PublicKey) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPost = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await sdk.post.get(postAccount);

        setPost(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sdk, postAccount]);

  useEffect(() => {
  fetchPost();
  }, [fetchPost]);

  return { post, loading, error };
};

export default usePost;