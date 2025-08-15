import { Injectable } from '@nestjs/common';
import { IStorageService, StoredFile } from './storage.types';
import { put, del } from '@vercel/blob';
import { Readable } from 'stream';

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
    
    // Convert Buffer to Readable stream for Vercel Blob compatibility
    const stream = Readable.from(params.buffer);
    
    const res = await put(objectName, stream, {
      access: access as any,
      contentType: params.contentType,
      token,
    });

    return {
      url: res.url,
      key: res.pathname || objectName,
      size: params.buffer.length, // Use buffer length since res.size doesn't exist
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
