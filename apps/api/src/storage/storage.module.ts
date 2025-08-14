import { Module, Provider } from '@nestjs/common';
import { IStorageService } from './storage.types';
import { VercelBlobService } from './vercel-blob.service';

const storageProvider: Provider = {
  provide: 'IStorageService',
  useFactory: () => {
    const provider = process.env.STORAGE_PROVIDER || 'vercel-blob';
    switch (provider) {
      case 'vercel-blob':
      default:
        return new VercelBlobService();
    }
  },
};

@Module({
  providers: [storageProvider],
  exports: ['IStorageService'],
})
export class StorageModule {}
