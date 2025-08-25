# strapi-provider-upload-azure-clean

Azure Blob Storage provider for Strapi with clean URLs (no SAS tokens appended to URLs).

## Features

- Upload files to Azure Blob Storage using SAS tokens for authentication
- Generate clean public URLs without SAS token query parameters
- Perfect for public containers where you want clean URLs
- Based on `strapi-provider-upload-azure-sa` with URL cleaning enhancement

## Installation

```bash
npm install strapi-provider-upload-azure-clean
```

## Configuration

Add to your `config/plugins.js` or `config/plugins.ts`:

```javascript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-azure-clean',
      providerOptions: {
        account: env('AZURE_STORAGE_ACCOUNT'),
        sasToken: env('AZURE_STORAGE_SAS_TOKEN'),
        containerName: env('AZURE_STORAGE_CONTAINER_NAME'),
        defaultPath: env('AZURE_STORAGE_DEFAULT_PATH', 'uploads'),
        cdnBaseURL: env('AZURE_STORAGE_CDN_BASE_URL'),
        serviceBaseURL: env('AZURE_STORAGE_SERVICE_BASE_URL'),
        defaultCacheControl: env('AZURE_STORAGE_DEFAULT_CACHE_CONTROL'),
        removeCN: env('AZURE_STORAGE_REMOVE_CN'),
      },
    },
  },
});
```

## Environment Variables

```
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_STORAGE_SAS_TOKEN=your_sas_token
AZURE_STORAGE_CONTAINER_NAME=your_container_name
AZURE_STORAGE_DEFAULT_PATH=uploads
AZURE_STORAGE_CDN_BASE_URL=https://your_storage_account.blob.core.windows.net
AZURE_STORAGE_SERVICE_BASE_URL=https://your_storage_account.blob.core.windows.net
```

## Key Difference

This provider strips SAS tokens from generated URLs while still using them for authentication:

- **Authentication**: Uses SAS token for upload/delete operations
- **URLs**: Generates clean URLs without SAS token parameters
- **Result**: `https://account.blob.core.windows.net/container/file.jpg` instead of `https://account.blob.core.windows.net/container/file.jpg?sv=...&sr=...`

## Credits

Based on [strapi-provider-upload-azure-sa](https://www.npmjs.com/package/strapi-provider-upload-azure-sa) by c1sar, with modifications to provide clean URLs without SAS token parameters.

## License

MIT - See LICENSE file for details