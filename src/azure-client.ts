// src/azureClient.ts

import {
    BlobServiceClient,
    AnonymousCredential,
    StorageSharedKeyCredential,
    newPipeline,
  } from '@azure/storage-blob';
  import { Config } from './types';
  import { trimParam, getServiceBaseUrl } from './utils';
  
  export function makeBlobServiceClient(config: Config): BlobServiceClient {
    const serviceBaseURL = getServiceBaseUrl(config).replace(/\/$/, ''); // Ensure no trailing slash
    const account = trimParam(config.account);
    const accountKey = trimParam(config.accountKey);
    let sasToken = trimParam(config.sasToken);
  
    // Always use strongest available authentication for operations
  // Use SAS token authentication (preferred for uploads)
  if (sasToken) {
    const queryChar = sasToken.startsWith('?') ? '' : '?';
    return new BlobServiceClient(`${serviceBaseURL.replace(/\/$/, '')}${queryChar}${sasToken}`, new AnonymousCredential());
  }
  
    // Use account key authentication
    if (accountKey) {
      const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
      const pipeline = newPipeline(sharedKeyCredential);
      return new BlobServiceClient(serviceBaseURL, pipeline);
    }

    // Fallback to anonymous access (only if no credentials provided)
    const anonymousCredential = new AnonymousCredential();
    return new BlobServiceClient(serviceBaseURL, anonymousCredential);
  }
