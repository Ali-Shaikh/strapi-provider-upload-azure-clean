import { Config, File } from './types';
import { BlobServiceClient } from '@azure/storage-blob';
import { getServiceBaseUrl, getFileName, trimParam, toBool } from './utils';

const uploadOptions = {
  bufferSize: 4 * 1024 * 1024,
  maxBuffers: 20,
};

export async function handleUpload(
  config: Config,
  blobSvcClient: BlobServiceClient,
  file: File
): Promise<void> {
  const serviceBaseURL = getServiceBaseUrl(config);
  const containerName = trimParam(config.containerName);
  const containerClient = blobSvcClient.getContainerClient(containerName);

  // Check if container needs to be created
  if (toBool(config.createContainerIfNotExist)) {
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      await containerClient.create({
        access: config.publicAccessType || 'blob',
      });
    }
  }

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
  
  // Ensure consistent URL format for replacement
  const normalizedServiceBaseURL = serviceBaseURL.replace(/\/$/, '');
  
  file.url = cdnBaseURL
    ? finalUrl.replace(normalizedServiceBaseURL, cdnBaseURL.replace(/\/$/, ''))
    : finalUrl;

  if (toBool(config.removeCN)) {
    // Only replace the first occurrence of the container name right after the host
    const urlObj = new URL(file.url);
    if (urlObj.pathname.startsWith(`/${containerName}/`)) {
      urlObj.pathname = urlObj.pathname.replace(`/${containerName}/`, '/');
      file.url = urlObj.toString();
    }
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
