export interface Uploader {
  upload(data: string): Promise<string>;
}
