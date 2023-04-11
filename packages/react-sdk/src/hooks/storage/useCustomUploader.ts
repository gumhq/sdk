import { useState, useCallback } from 'react';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../session';
import { Uploader } from './UploaderInterface';
import { useArweaveStorage } from './arweave/useArweave';
import { ArweaveUpload } from './ArweaveUpload';
import { GenesysGoUpload } from './GenesysGoUpload';

export const useCustomUploader = (
  uploaderType: 'arweave' | 'genesysgo' | 'custom',
  wallet: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta",
  useSession: boolean,
  session?: SessionWalletInterface,
  customUploaderInstance?: Uploader,
) => {
  if (uploaderType === 'custom' && !customUploaderInstance) {
    throw new Error('Custom uploader instance is required for custom uploader type');
  }

  const arweaveStorage = useArweaveStorage(wallet, connection, cluster, useSession, session);

  const getFileUploader = (): Uploader => {
    if (uploaderType === 'custom' && customUploaderInstance) {
      return customUploaderInstance;
    }

    if (!session) {
      throw new Error('Session is required for arweave uploader');
    }

    if (uploaderType === 'arweave') {
      return new ArweaveUpload(arweaveStorage);
    } else if (uploaderType === 'genesysgo') {
      return new GenesysGoUpload();
    } else {
      throw new Error('Invalid uploader type or custom uploader instance not provided');
    }
  };

  const uploader = getFileUploader();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (data: string | null) => {
    if (data) {
      setUploading(true);
      setError(null);
      try {
        const url = await uploader.upload(data);
        return url;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
  }, [uploader]);

  return { handleUpload, uploading, error };
};
