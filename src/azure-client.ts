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
  const serviceBaseURL = getServiceBaseUrl(config);
  const account = trimParam(config.account);
  const accountKey = trimParam(config.accountKey);
  const sasToken = trimParam(config.sasToken);
  
  // Use SAS token authentication when provided.
  if (sasToken) {
    const queryChar = sasToken.startsWith('?') ? '' : '?';
    return new BlobServiceClient(
      `${serviceBaseURL}${queryChar}${sasToken}`,
      new AnonymousCredential()
    );
  }
  
  if (accountKey) {
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const pipeline = newPipeline(sharedKeyCredential);
    return new BlobServiceClient(serviceBaseURL, pipeline);
  }

  return new BlobServiceClient(serviceBaseURL, new AnonymousCredential());
}
