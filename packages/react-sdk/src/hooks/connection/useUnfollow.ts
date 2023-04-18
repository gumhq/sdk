import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

const useUnfollow = (sdk: SDK) => {
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const unfollow = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      refundReceiver: PublicKey = owner,
      sendTransaction?: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await deleteConnectionIxMethodBuilder(
          connectionAccount,
          fromProfile,
          toProfile,
          userAccount,
          owner,
          sessionAccount,
          refundReceiver
        );
        
        if (ixMethodBuilder) {
          if (sendTransaction) {
            const tx = await ixMethodBuilder.transaction();
            if (tx) {
              return await sendTransaction(tx, connection, options);
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
    [sdk]);

  const deleteConnectionIxMethodBuilder = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      userAccount: PublicKey,
      owner: PublicKey,
      sessionAccount?: PublicKey,
      refundReceiver: PublicKey = owner
    ) => {
      try {
        const connection = sdk.connection.delete(
          connectionAccount,
          fromProfile,
          toProfile,
          userAccount,
          owner,
          sessionAccount,
          refundReceiver
        );
        return connection;
      } catch (err: any) {
        setConnectionError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    unfollow,
    deleteConnectionIxMethodBuilder,
    connectionLoading,
    connectionError
  };
};

export { useUnfollow };
