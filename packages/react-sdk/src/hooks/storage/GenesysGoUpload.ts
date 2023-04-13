import { Uploader } from "./UploaderInterface";
import { ShadowStorageInterface } from "./shdw/useShadow";

export class GenesysGoUpload implements Uploader {
  private shadowStorage: ShadowStorageInterface;

  constructor(shadowStorage: ShadowStorageInterface) {
    this.shadowStorage = shadowStorage;
  }

  async upload(data: File): Promise<string> {
    const res = await this.shadowStorage.uploadData(data);

    if (!res) {
      throw new Error("Failed to upload data");
    }

    if (res.upload_errors && res.upload_errors.length > 0) {
      const errorMessages = res.upload_errors.map(error => `${error.file}: ${error.error}`).join(', ');
      console.error(res.upload_errors);
      throw new Error(errorMessages);
    }

    return res.finalized_locations[0];
  }
}