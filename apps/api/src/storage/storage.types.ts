export type StoredFile = {
  url: string;
  key: string; // provider-specific key/path
  size: number;
  contentType: string;
  provider: 'vercel-blob' | 's3';
};

export interface IStorageService {
  upload(params: {
    filename: string;
    contentType: string;
    buffer: Buffer;
    isPublic?: boolean;
  }): Promise<StoredFile>;

  delete(key: string): Promise<void>;
}
