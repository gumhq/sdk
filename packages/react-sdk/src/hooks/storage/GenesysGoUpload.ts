import { ShadowFile } from '@shadow-drive/sdk';
import { SessionWalletInterface } from '../session';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Uploader } from "./UploaderInterface";
import { ShadowStorageInterface } from "./shdw/useShadow";

export class GenesysGoUpload implements Uploader {
  private shadowStorage: ShadowStorageInterface;

  constructor(shadowStorage: ShadowStorageInterface) {
    this.shadowStorage = shadowStorage;
  }

  private isFileOrShadowFile(data: any): data is File | ShadowFile {
    return data instanceof File || (data.hasOwnProperty('file') && data.file instanceof Buffer);
  }

  async upload(data: File | ShadowFile, wallet: WalletContextState | SessionWalletInterface): Promise<{url: string, signature: string}> {
    if (!this.isFileOrShadowFile(data)) {
      throw new Error("Invalid data type. Data must be of type File or ShadowFile");
    }

    const res = await this.shadowStorage.uploadData(data, wallet);

    if (!res) {
      throw new Error("Failed to upload data");
    }

    if (res.upload_errors && res.upload_errors.length > 0) {
      const errorMessages = res.upload_errors.map(error => `${error.file}: ${error.error}`).join(', ');
      console.error(res.upload_errors);
      throw new Error(errorMessages);
    }

    return {
      url: res.finalized_locations[0],
      signature: res.message
    };
  }
}