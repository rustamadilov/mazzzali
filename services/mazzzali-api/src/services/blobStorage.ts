import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import type { AppConfig } from './config.js';
import { requireSetting } from './config.js';
import type { IBlobStorageService } from './interfaces/IBlobStorageService.js';

const azuriteAccount = 'devstoreaccount1';
const azuriteKey = 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUz5t8fQ==';

export interface BlobClientProvider {
  getClient(): BlobServiceClient;
}

export class AzuriteBlobClientProvider implements BlobClientProvider {
  private readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getClient(): BlobServiceClient {
    return new BlobServiceClient(this.endpoint, new StorageSharedKeyCredential(azuriteAccount, azuriteKey));
  }
}

export class ManagedIdentityBlobClientProvider implements BlobClientProvider {
  private readonly endpoint: string;
  private readonly credential = new DefaultAzureCredential();

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getClient(): BlobServiceClient {
    return new BlobServiceClient(this.endpoint, this.credential);
  }
}

export function createBlobClientProvider(config: AppConfig): BlobClientProvider {
  if (config.environment === 'Development') {
    const endpoint = process.env.AZURITE_BLOB_URL ?? requireSetting('AZURITE_BLOB_URL');
    return new AzuriteBlobClientProvider(endpoint);
  }

  const endpoint = config.blobEndpoint ?? requireSetting('AZURE_STORAGE_BLOB_ENDPOINT');
  new URL(endpoint);
  return new ManagedIdentityBlobClientProvider(endpoint);
}

export class BlobStorageService implements IBlobStorageService {
  constructor(private readonly provider: BlobClientProvider) {}

  async healthCheck(): Promise<boolean> {
    try {
      await this.provider.getClient().getProperties();
      return true;
    } catch {
      return false;
    }
  }
}