import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";

type SignAndSendTransactionFn = <T extends Transaction>(transactions: T | T[]) => Promise<string[]>;

const useFollow = (sdk: SDK) => {
  const [connectionPDA, setConnectionPDA] = useState<PublicKey | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const follow = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      signAndSendTransaction?: SignAndSendTransactionFn
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await createConnectionIxMethodBuilder(
          fromProfile,
          toProfile,
          userAccount,
          owner,
          sessionAccount
        );
        
        if (ixMethodBuilder) {
          if (signAndSendTransaction) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await signAndSendTransaction(tx);
            }
          } else {
            return await ixMethodBuilder.rpc();
          }
        } else {
          const error = new Error('ixMethodBuilder is undefined');
          setConnectionError(error);
          return Promise.reject(error);
        }
      } catch (err: any) {
        setConnectionError(err);
      } finally {
        setConnectionLoading(false);
      }
    },
    [sdk]
  );

  const createConnectionIxMethodBuilder = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey
    ) => {
      try {
        const connection = await sdk.connection.create(
          fromProfile,
          toProfile,
          userAccount,
          owner,
          sessionAccount
        );
        setConnectionPDA(connection.connectionPDA);
        return connection.instructionMethodBuilder;
      } catch (err: any) {
        setConnectionError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    follow,
    createConnectionIxMethodBuilder,
    connectionPDA,
    connectionLoading,
    connectionError
  };
};

export { useFollow };
