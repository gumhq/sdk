import * as React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import { Connection } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import { SessionWalletInterface, useUploader } from '../hooks';
import { Uploader } from 'src/hooks/storage/UploaderInterface';
import { ShadowFile } from '@shadow-drive/sdk';

interface UploaderContextValue {
  handleUpload: (data: string | object | File | ShadowFile , wallet: WalletContextState | SessionWalletInterface) => Promise<{ url: string; signature: string; } | undefined>;
  uploading: boolean;
  error: string | null;
}

interface UploaderProviderProps {
  uploaderType: 'arweave' | 'genesysgo' | 'custom';
  connection: Connection;
  cluster: 'devnet' | 'mainnet-beta';
  customUploaderInstance?: Uploader;
  children: ReactNode;
}

const UploaderContext = createContext<UploaderContextValue | null>(null);

export const useUploaderContext = (): UploaderContextValue => {
  const context = useContext(UploaderContext);
  if (!context) {
    throw new Error('useUploaderContext must be used within an UploaderProvider');
  }
  return context;
};

export const UploaderProvider = ({
  uploaderType,
  connection,
  cluster,
  customUploaderInstance,
  children,
}: UploaderProviderProps): JSX.Element => {
  const uploader = useUploader(
    uploaderType,
    connection,
    cluster,
    customUploaderInstance
  );

  return (
    <UploaderContext.Provider value={uploader}>{children}</UploaderContext.Provider>
  );
};
