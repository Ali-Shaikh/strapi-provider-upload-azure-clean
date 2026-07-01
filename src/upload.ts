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

  if (toBool(config.createContainerIfNotExist)) {
    const publicAccessType = trimParam(config.publicAccessType);
    await containerClient.createIfNotExists({
      access:
        publicAccessType === 'blob' || publicAccessType === 'container'
          ? publicAccessType
          : undefined,
    });
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
