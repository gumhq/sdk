// useCustomUploader.ts
import { useState, useCallback } from 'react';
import { useArweaveStorage } from './useArweave';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

export type UploaderType = 'arweave' | 'genesysgo' | 'custom';

export interface UploaderFunction {
  (data: File | string | object): Promise<string>;
}

export const useCustomUploader = (
  uploaderType: UploaderType,
  wallet: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "mainnet-beta",
  customUploader?: UploaderFunction,
) => {
  if (uploaderType === 'custom' && !customUploader) {
    throw new Error('Custom uploader function is required for custom uploader type');
  }

  const arweaveStorage = useArweaveStorage(wallet, connection, cluster);

  const getFileUploader = (): UploaderFunction => {
    if (uploaderType === 'custom' && customUploader) {
      return customUploader;
    }

    if (uploaderType === 'arweave') {
      return async (data: File | string | object): Promise<string> => {
        const dataArrayBuffer = await (async () => {
          if (typeof data === 'string') {
            return new TextEncoder().encode(data).buffer;
          } else if (data instanceof File) {
            return data.arrayBuffer();
          } else {
            return new TextEncoder().encode(JSON.stringify(data)).buffer;
          }
        })();

        const { url, error } = await arweaveStorage.uploadData(dataArrayBuffer);

        if (error) {
          throw new Error(error);
        }

        return url as string;
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

  const [data, setData] = useState<File | string | object | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async () => {
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
  }, [data, uploader]);

  return { setData, handleUpload, uploading, uploadedUrl, error };
};
