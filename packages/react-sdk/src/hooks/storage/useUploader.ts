import { useState, useCallback } from 'react';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../session';
import { Uploader } from './UploaderInterface';
import { useArweaveStorage } from './arweave/useArweave';
import { ArweaveUpload } from './ArweaveUpload';
import { GenesysGoUpload } from './GenesysGoUpload';
import { useShadowStorage } from './shdw/useShadow';

export const useUploader = (
  uploaderType: 'arweave' | 'genesysgo' | 'custom',
  wallet: WalletContextState | SessionWalletInterface,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta",
  customUploaderInstance?: Uploader,
) => {
  if (uploaderType === 'custom' && !customUploaderInstance) {
    throw new Error('Custom uploader instance is required for custom uploader type');
  }

  const arweaveStorage = uploaderType === 'arweave' ? useArweaveStorage(wallet, connection, cluster) : null;
  const genesysgoStorage = uploaderType === 'genesysgo' ? useShadowStorage(wallet, connection) : null;

  if (uploaderType === 'genesysgo' && cluster === 'devnet') {
    throw new Error("GenesysGo doesn't support devnet and it only works on mainnet-beta");
  }

  const getFileUploader = (): Uploader => {
    if (uploaderType === 'custom' && customUploaderInstance) {
      return customUploaderInstance;
    }

    if (uploaderType === 'arweave' && arweaveStorage) {
      return new ArweaveUpload(arweaveStorage);
    } else if (uploaderType === 'genesysgo' && genesysgoStorage) {
      return new GenesysGoUpload(genesysgoStorage);
    } else {
      throw new Error('Invalid uploader type or custom uploader instance not provided');
    }
  };

  const uploader = getFileUploader();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (data: string| File | null) => {
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
