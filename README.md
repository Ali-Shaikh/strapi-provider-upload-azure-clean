# strapi-provider-upload-azure-clean

Azure Blob Storage provider for Strapi with smart URL handling - clean URLs for public containers, authenticated URLs for private containers.

## Features

- **Upload Files to Azure Blob Storage**: Seamlessly upload files from your Strapi application to Azure Blob Storage
- **Delete Files**: Remove files from Azure Blob Storage when they are deleted from Strapi
- **TypeScript Support**: Written in TypeScript for type safety and better maintainability
- **Configuration Options**: Customize various aspects of the provider, including paths, cache control, and URLs
- **Supports SAS Tokens and Account Keys**: Authenticate using either an account key or a SAS token
- **Smart URL Generation**: Clean URLs for public containers, authenticated URLs for private containers

## Requirements

- **Strapi v4-v5**: This provider is compatible with Strapi version 4.x and 5.x
- **Node.js v14 or higher**: Ensure you have Node.js version 14 or newer
- **Azure Blob Storage Account**: An Azure storage account with a Blob container

## Installation

```bash
npm install strapi-provider-upload-azure-clean
```

## Configuration

### Provider Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `account` | string | **Yes** | | Your Azure storage account name |
| `accountKey` | string | **Conditional** | | Your Azure storage account key. Required if `sasToken` is not provided |
| `sasToken` | string | **Conditional** | | Shared Access Signature token for your storage account. Required if `accountKey` is not provided |
| `containerName` | string | **Yes** | | The name of the Blob container where files will be stored |
| `defaultPath` | string | No | `'uploads'` | The default path inside the container where files will be uploaded |
| `cdnBaseURL` | string | No | | If you're using a CDN or custom domain, specify the base URL here |
| `serviceBaseURL` | string | No | | Custom base URL for the Azure Blob service (e.g., if using a sovereign cloud) |
| `defaultCacheControl` | string | No | | Set the `Cache-Control` header for uploaded files |
| `removeCN` | string | No | | Set to `'true'` to remove the container name from the file URL |
| `publicContainer` | string | No | | Set to `'true'` for public containers with clean URLs |

### Configure the Provider in Strapi

Create or update the `config/plugins.js` or `config/plugins.ts` file in your Strapi project:

```javascript
// config/plugins.js

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-azure-clean',
      providerOptions: {
        account: env('AZURE_ACCOUNT_NAME'),
        accountKey: env('AZURE_ACCOUNT_KEY'),
        sasToken: env('AZURE_SAS_TOKEN'),
        containerName: env('AZURE_CONTAINER_NAME'),
        defaultPath: env('AZURE_DEFAULT_PATH', 'uploads'),
        cdnBaseURL: env('AZURE_CDN_BASE_URL'),
        serviceBaseURL: env('AZURE_SERVICE_BASE_URL'),
        defaultCacheControl: env('AZURE_DEFAULT_CACHE_CONTROL'),
        removeCN: env('AZURE_REMOVE_CN'),
        publicContainer: env('AZURE_PUBLIC_CONTAINER'),
      },
    },
  },
});
```

### Set Environment Variables

Create or update your .env file at the root of your Strapi project:

```bash
# Azure Storage Account Credentials
AZURE_ACCOUNT_NAME=your_account_name
AZURE_ACCOUNT_KEY=your_account_key

# Optional: SAS Token (if not using account key)
AZURE_SAS_TOKEN=your_sas_token

# Azure Blob Storage Configuration
AZURE_CONTAINER_NAME=your_container_name
AZURE_DEFAULT_PATH=uploads

# Optional: CDN Base URL
AZURE_CDN_BASE_URL=https://cdn.yourdomain.com

# Optional: Custom Service Base URL
AZURE_SERVICE_BASE_URL=https://your_custom_service_base_url

# Optional: Cache Control Header
AZURE_DEFAULT_CACHE_CONTROL=public, max-age=31536000, immutable

# Optional: Remove Container Name from URL
AZURE_REMOVE_CN=true

# Optional: Public Container (for clean URLs)
AZURE_PUBLIC_CONTAINER=true
```

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware, you need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. Replace the `"strapi::security"` string with the object below, as explained in the middleware configuration documentation.

To allow the Azure storage content to be displayed, edit the file at `./config/middlewares.js`. Replace the `"strapi::security"` string with the following object:

```javascript
// ./config/middlewares.js

module.exports = [
  // ...
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com", // Required for Strapi < 4.10.6; you can remove it otherwise
            "https://market-assets.strapi.io", // Required for Strapi >= 4.10.6; you can remove it otherwise
            /**
             * Note: If using a STORAGE_URL, replace `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net` with `process.env.STORAGE_URL`.
             * If using a CDN URL, make sure to include that URL in the CSP headers, e.g., `process.env.AZURE_CDN_BASE_URL`.
             */
            `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com", // Required for Strapi < 4.10.6; you can remove it otherwise
            /**
             * Note: If using a STORAGE_URL, replace `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net` with `process.env.STORAGE_URL`.
             * If using a CDN URL, make sure to include that URL in the CSP headers, e.g., `process.env.AZURE_CDN_BASE_URL`.
             */
            `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```

### Additional Configuration Options

- **`serviceBaseURL`** (optional): Useful when connecting to Azure Storage API compatible services, like the official emulator Azurite. The `serviceBaseURL` would then look like `http://localhost:10000/your-storage-account-name`. When `serviceBaseURL` is not provided, the default `https://${account}.blob.core.windows.net` will be used.

- **`cdnBaseURL`** (optional): Useful when using a CDN in front of your storage account. Images will be returned with the CDN URL instead of the storage account URL.

- **`defaultCacheControl`** (optional): Useful when you want to allow clients to use a cached version of the file. Azure Storage will return this value in the `Cache-Control` HTTP header of the response.

- **`removeCN`** (optional): Some Azure account configurations exclude the 'container name' from the URL where data is saved. By default, it's set to `false`. If you want to remove the container name from the URL, set it to `'true'`.

- **`publicContainer`** (optional): Set to `'true'` for public containers to generate clean URLs without SAS token parameters.

## Usage Examples

### Example 1: Using SAS Token Authentication

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-azure-clean',
      providerOptions: {
        account: 'mystorageaccount',
        sasToken: 'sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=...',
        containerName: 'uploads',
        defaultPath: 'media',
      },
    },
  },
});
```

**Result URLs (Private Container)**: `https://mystorageaccount.blob.core.windows.net/uploads/media/image.jpg?sv=2022-11-02&ss=bfqt...`

### Example 2: Clean URLs for Public Containers

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-azure-clean',
      providerOptions: {
        account: 'mystorageaccount',
        sasToken: 'sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=...',
        containerName: 'public-uploads',
        publicContainer: 'true', // This enables clean URLs
        defaultPath: 'images',
      },
    },
  },
});
```

**Result URLs (Public Container)**: `https://mystorageaccount.blob.core.windows.net/public-uploads/images/image.jpg`

## Key Features

### Smart URL Generation
This provider intelligently handles URLs based on container privacy:

**For Public Containers** (`publicContainer: 'true'`):
- **Authentication**: Uses anonymous access for operations
- **URLs**: Generates clean URLs without SAS token parameters
- **Result**: `https://account.blob.core.windows.net/container/file.jpg`

**For Private Containers** (default):
- **Authentication**: Uses SAS token or account key for operations  
- **URLs**: Keeps SAS tokens in URLs for private access
- **Result**: `https://account.blob.core.windows.net/container/file.jpg?sv=...&sr=...`

## Authentication Priority

The provider uses authentication in this order:
1. **Public Container**: If `publicContainer: 'true'` → Anonymous access
2. **SAS Token**: If `sasToken` provided → SAS token authentication  
3. **Account Key**: If `accountKey` provided → Account key authentication

## Credits

Based on [strapi-provider-upload-azure-sa](https://www.npmjs.com/package/strapi-provider-upload-azure-sa) by c1sar, with modifications to provide clean URLs without SAS token parameters.

## License

MIT - See LICENSE file for details