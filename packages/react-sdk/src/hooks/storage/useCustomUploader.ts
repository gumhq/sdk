import { useState, useCallback } from 'react';
import { useArweaveStorage } from './arweave/useArweave';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { SessionWalletInterface } from '../session';

export type UploaderType = 'arweave' | 'genesysgo' | 'custom';

export interface UploaderFunction {
  (data: string): Promise<string>;
}

export const useCustomUploader = (
  uploaderType: UploaderType,
  wallet: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta",
  useSession: boolean,
  session?: SessionWalletInterface,
  customUploader?: UploaderFunction,
) => {
  if (uploaderType === 'custom' && !customUploader) {
    throw new Error('Custom uploader function is required for custom uploader type');
  }

  const arweaveStorage = useArweaveStorage(wallet, connection, cluster, useSession, session);

  const getFileUploader = (): UploaderFunction => {
    if (uploaderType === 'custom' && customUploader) {
      return customUploader;
    }
    
    if (!session) {
      throw new Error('Session is required for arweave uploader');
    }

    if (uploaderType === 'arweave') {
      return async (data: string): Promise<string> => {
        try {
          const { url, error } = await arweaveStorage.uploadData(data);

          if (error) {
            console.error(error);
            throw new Error(error);
          }

          return url as string;
        } catch (err) {
          console.error('Error in Arweave uploader:', err);
          throw err;
        }
      };
    } else if (uploaderType === 'genesysgo') {
      return async (_: File | string | object): Promise<string> => {
        throw new Error('GenesysGo upload not implemented');
      };
    } else {
      throw new Error('Invalid uploader type or custom uploader function not provided');
    }
  };

  const uploader = getFileUploader();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (data: string | null) => {
    if (data) {
      setUploading(true);
      setError(null);
      try {
        const url = await uploader(data);
        setUploadedUrl(url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
  }, [uploader]);

  return { handleUpload, uploading, uploadedUrl, error };
};
