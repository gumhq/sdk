import { Uploader } from "./UploaderInterface";

export class GenesysGoUpload implements Uploader {
  async upload(_: string): Promise<string> {
    throw new Error('GenesysGo upload not implemented');
  }
}