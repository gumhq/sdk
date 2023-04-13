import { Uploader } from './UploaderInterface';
import { ArweaveStorageHook } from './arweave/useArweave';

export class ArweaveUpload implements Uploader {
  private storage: ArweaveStorageHook;

  constructor(storage: ArweaveStorageHook) {
    this.storage = storage;
  }

  async upload(data: string): Promise<string> {
    const { url, error } = await this.storage.uploadData(data);

    if (error) {
      console.error(error);
      throw new Error(error);
    }

    return url as string;
  }
}