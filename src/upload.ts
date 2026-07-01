import { Config, File } from './types';
import { BlobServiceClient } from '@azure/storage-blob';
import { getServiceBaseUrl, getFileName, trimParam, toBool } from './utils';

const uploadOptions = {
  bufferSize: 4 * 1024 * 1024,
  maxBuffers: 20,
};

const containerCreationPromises = new WeakMap<BlobServiceClient, Map<string, Promise<void>>>();

function getPublicAccessType(config: Config): 'blob' | 'container' | undefined {
  const publicAccessType = trimParam(config.publicAccessType);

  if (!publicAccessType) {
    return undefined;
  }

  if (publicAccessType === 'blob' || publicAccessType === 'container') {
    return publicAccessType;
  }

  throw new Error(
    `Invalid publicAccessType "${publicAccessType}". Expected "blob" or "container".`
  );
}

function validateContainerAccessConfig(config: Config): void {
  if (
    toBool(config.createContainerIfNotExist) &&
    toBool(config.publicContainer) &&
    !getPublicAccessType(config)
  ) {
    throw new Error(
      'publicContainer requires publicAccessType to be "blob" or "container" when createContainerIfNotExist is enabled.'
    );
  }
}

async function ensureContainerExists(
  config: Config,
  blobSvcClient: BlobServiceClient,
  containerName: string
): Promise<void> {
  if (!toBool(config.createContainerIfNotExist)) {
    return;
  }

  const publicAccessType = getPublicAccessType(config);
  const cacheKey = `${containerName}:${publicAccessType || 'private'}`;
  let clientCache = containerCreationPromises.get(blobSvcClient);

  if (!clientCache) {
    clientCache = new Map<string, Promise<void>>();
    containerCreationPromises.set(blobSvcClient, clientCache);
  }

  let creationPromise = clientCache.get(cacheKey);

  if (!creationPromise) {
    const containerClient = blobSvcClient.getContainerClient(containerName);
    creationPromise = containerClient
      .createIfNotExists({ access: publicAccessType })
      .then(() => undefined)
      .catch((err) => {
        clientCache.delete(cacheKey);
        throw err;
      });
    clientCache.set(cacheKey, creationPromise);
  }

  await creationPromise;
}

export async function handleUpload(
  config: Config,
  blobSvcClient: BlobServiceClient,
  file: File
): Promise<void> {
  validateContainerAccessConfig(config);

  const serviceBaseURL = getServiceBaseUrl(config);
  const containerName = trimParam(config.containerName);
  const containerClient = blobSvcClient.getContainerClient(containerName);

  await ensureContainerExists(config, blobSvcClient, containerName);

  const client = containerClient.getBlockBlobClient(getFileName(config.defaultPath, file));
  const options = {
    blobHTTPHeaders: {
      blobContentType: file.mime,
      blobCacheControl: trimParam(config.defaultCacheControl),
    },
  };
  const cdnBaseURL = trimParam(config.cdnBaseURL);
  
  // Only strip SAS token from URL if container is public
  let finalUrl = client.url;
  
  if (toBool(config.publicContainer)) {
    // For public containers, strip SAS token from URL
    const urlParts = finalUrl.split('?');
    const baseUrl = urlParts[0];
    finalUrl = baseUrl;
  }
  
  file.url = cdnBaseURL
    ? finalUrl.replace(serviceBaseURL, cdnBaseURL.replace(/\/$/, ''))
    : finalUrl;

  if (toBool(config.removeCN) && file.url.includes(`/${containerName}/`)) {
    file.url = file.url.replace(`/${containerName}/`, '/');
  }

  if (file.buffer) {
    await client.uploadData(file.buffer, options);
  } else if (file.path) {
    await client.uploadFile(file.path, options);
  } else if (file.stream) {
    await client.uploadStream(
      file.stream,
      uploadOptions.bufferSize,
      uploadOptions.maxBuffers,
      options
    );

    // Close the stream to release the file handle
    if (typeof file.stream.destroy === 'function') {
      file.stream.destroy();
    }
  } else {
    throw new Error('File data is not available for upload.');
  }
}
