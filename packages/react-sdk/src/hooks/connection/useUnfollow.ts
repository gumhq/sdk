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
      owner: PublicKey,
      refundReceiver: PublicKey = owner,
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await deleteConnectionIxMethodBuilder(
          connectionAccount,
          fromProfile,
          toProfile,
          owner,
          refundReceiver
        );
        
        if (ixMethodBuilder) {
          return await ixMethodBuilder.rpc();
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

  const unfollowWithSession = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      sendTransaction: sendTransactionFn,
      refundReceiver: PublicKey = sessionPublicKey,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await deleteConnectionWithSessionIxMethodBuilder(
          connectionAccount,
          fromProfile,
          toProfile,
          sessionPublicKey,
          sessionAccount,
          refundReceiver
        );
        
        if (ixMethodBuilder) {
          const tx = await ixMethodBuilder.transaction();
          if (tx) {
            return await sendTransaction(tx, connection, options);
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
      owner: PublicKey,
      refundReceiver: PublicKey = owner
    ) => {
      try {
        const connection = sdk.connection.delete(
          connectionAccount,
          fromProfile,
          toProfile,
          owner,
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

  const deleteConnectionWithSessionIxMethodBuilder = useCallback(
    async (
      connectionAccount: PublicKey,
      fromProfile: PublicKey,
      toProfile: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      refundReceiver: PublicKey = sessionPublicKey
    ) => {
      try {
        const connection = sdk.connection.deleteWithSession(
          connectionAccount,
          fromProfile,
          toProfile,
          sessionPublicKey,
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
    unfollowWithSession,
    deleteConnectionIxMethodBuilder,
    deleteConnectionWithSessionIxMethodBuilder,
    connectionLoading,
    connectionError
  };
};

export { useUnfollow };
