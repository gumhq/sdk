export interface Uploader {
  upload(data: string | File): Promise<string>;
}
