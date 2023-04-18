import { SessionWalletInterface } from '../session';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Uploader } from './UploaderInterface';
import { ArweaveStorageHook } from './arweave/useArweave';

export class ArweaveUpload implements Uploader {
  private storage: ArweaveStorageHook;

  constructor(storage: ArweaveStorageHook) {
    this.storage = storage;
  }

  async upload(data: string | object, wallet: WalletContextState | SessionWalletInterface): Promise<{url: string, signature: string}> {
    const { url, signature, error } = await this.storage.uploadData(data, wallet);

    if (error) {
      console.error(error);
      throw new Error(error);
    }

    if (!url || !signature) {
      throw new Error('Failed to upload data');
    }

    return {
      url,
      signature,
    }
  }
}