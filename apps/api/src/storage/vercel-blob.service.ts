import { Injectable } from '@nestjs/common';
import { IStorageService, StoredFile } from './storage.types';
import { put, del } from '@vercel/blob';

@Injectable()
export class VercelBlobService implements IStorageService {
  async upload(params: {
    tenantId: string;
    filename: string;
    contentType: string;
    buffer: Buffer;
    isPublic?: boolean;
  }): Promise<StoredFile> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob');
    }
    const access = params.isPublic ? 'public' : 'private';
    const objectName = `uploads/${params.tenantId}/${Date.now()}-${params.filename}`;
    const res = await put(objectName, params.buffer, {
      access: access as any,
      contentType: params.contentType,
      token,
    });

    return {
      url: res.url,
      key: res.pathname || objectName,
      size: res.size,
      contentType: params.contentType,
      provider: 'vercel-blob',
    };
  }

  async delete(key: string): Promise<void> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob');
    }
    await del(key, { token });
  }
}
