import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

const useFollow = (sdk: SDK) => {
  const [connectionPDA, setConnectionPDA] = useState<PublicKey | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const follow = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await createConnectionIxMethodBuilder(
          fromProfile,
          toProfile,
          owner,
          payer
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
    [sdk]
  );

  const followWithSession = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      sendTransaction: sendTransactionFn,
      payer: PublicKey = sessionPublicKey,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setConnectionLoading(true);
      setConnectionError(null);

      try {
        const ixMethodBuilder = await createConnectionWithSessionIxMethodBuilder(
          fromProfile,
          toProfile,
          sessionPublicKey,
          sessionAccount,
          payer
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
    [sdk]
  );

  const createConnectionIxMethodBuilder = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      try {
        const connection = await sdk.connection.create(
          fromProfile,
          toProfile,
          owner,
          payer
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

  const createConnectionWithSessionIxMethodBuilder = useCallback(
    async (
      fromProfile: PublicKey,
      toProfile: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      payer: PublicKey = sessionPublicKey,
    ) => {
      try {
        const connection = await sdk.connection.createWithSession(
          fromProfile,
          toProfile,
          sessionPublicKey,
          sessionAccount,
          payer
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
    followWithSession,
    createConnectionIxMethodBuilder,
    createConnectionWithSessionIxMethodBuilder,
    connectionPDA,
    connectionLoading,
    connectionError
  };
};

export { useFollow };
