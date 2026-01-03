# @tokenring-ai/cdn

## Overview

A CDN abstraction service for the Token Ring platform, providing a unified interface for managing content delivery networks. This package enables seamless integration with multiple CDN providers through a consistent API, designed as a Token Ring plugin that integrates with the Token Ring application framework using the service registry pattern.

## Features

- **Multi-Provider Support**: Register and manage multiple CDN providers with a unified interface
- **Unified API**: Consistent interface across different CDN implementations
- **Core Operations**: Upload, download, delete, and check file existence
- **Type-Safe Configuration**: Zod-based schema validation for configuration
- **Service Registry**: Built on Token Ring's KeyedRegistry for provider management
- **Plugin Integration**: Seamless integration with Token Ring applications via service registry
- **Comprehensive Error Handling**: Clear error messages for common scenarios
- **Flexible Configuration**: Customizable options for different CDN providers

## Installation

```bash
bun install @tokenring-ai/cdn
```

## Core Components

### CDNService

The main service class that manages CDN operations and provider registration. Implements `TokenRingService` interface.

```typescript
import CDNService from "./CDNService.ts";

const cdnService = new CDNService();
```

#### Methods

- **registerProvider(name: string, provider: CDNProvider): void**
  - Register a CDN provider with a unique name
  - Example: `cdnService.registerProvider('s3', new S3CDNProvider())`

- **getCDNByName(cdnName: string): CDNProvider**
  - Retrieves a registered CDN provider by name
  - Throws an error if the provider is not found
  - Example: `const provider = cdnService.getCDNByName('s3')`

- **upload(cdnName: string, data: string | Buffer, options: UploadOptions): Promise<UploadResult>**
  - Upload data to a specific CDN provider
  - Converts string data to Buffer automatically
  - Parameters:
    - `cdnName`: The name of the registered CDN provider
    - `data`: The file content as string or Buffer
    - `options`: Optional upload parameters (filename, contentType, metadata)
  - Returns: Promise resolving to `UploadResult`
  - Throws: Error if no CDN is set or provider not found

- **delete(cdnName: string, url: string): Promise<DeleteResult>**
  - Delete a file from a specific CDN provider
  - Parameters:
    - `cdnName`: The name of the registered CDN provider
    - `url`: The URL of the file to delete
  - Returns: Promise resolving to `DeleteResult`
  - Throws: Error if CDN not found or delete method not supported

- **download(cdnName: string, url: string): Promise<Buffer>**
  - Download a file from a specific CDN provider
  - Parameters:
    - `cdnName`: The name of the registered CDN provider
    - `url`: The URL of the file to download
  - Returns: Promise resolving to Buffer containing file data
  - Throws: Error if CDN not found or download fails

- **exists(cdnName: string, url: string): Promise<boolean>**
  - Check if a file exists in a specific CDN provider
  - Parameters:
    - `cdnName`: The name of the registered CDN provider
    - `url`: The URL of the file to check
  - Returns: Promise resolving to boolean indicating file existence
  - Returns false if CDN not found (does not throw)

### CDNProvider

Abstract base class for implementing CDN providers.

```typescript
import CDNProvider from "./CDNProvider.ts";

class MyCDNProvider extends CDNProvider {
  // Implementation here
}
```

#### Required Methods

- **upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>**
  - Implement upload logic for your CDN provider
  - Parameters:
    - `data`: The file content as Buffer
    - `options`: Optional upload parameters
  - Returns: Promise resolving to `UploadResult` with url, optional id, and metadata
  - Throws: Must be implemented by subclass

#### Optional Methods

- **delete?(url: string): Promise<DeleteResult>**
  - Delete a file from the CDN
  - Default: Throws "Method 'delete' must be implemented" if not overridden
  - Parameters:
    - `url`: The URL of the file to delete
  - Returns: Promise resolving to `DeleteResult`

- **download(url: string): Promise<Buffer>**
  - Download a file from the CDN
  - Default: Uses HTTP GET via fetch, throws on HTTP errors
  - Parameters:
    - `url`: The URL of the file to download
  - Returns: Promise resolving to Buffer containing file data
  - Throws: "Failed to download file: {statusText}" on HTTP errors

- **exists(url: string): Promise<boolean>**
  - Check if a file exists in the CDN
  - Default: Uses HTTP HEAD via fetch, returns false on errors
  - Parameters:
    - `url`: The URL of the file to check
  - Returns: Promise resolving to boolean

### Types

#### UploadOptions

```typescript
export interface UploadOptions {
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}
```

#### UploadResult

```typescript
export interface UploadResult {
  url: string;
  id?: string;
  metadata?: Record<string, any>;
}
```

#### DeleteResult

```typescript
export interface DeleteResult {
  success: boolean;
  message?: string;
}
```

### CDNConfigSchema

Zod schema for validating CDN configuration:

```typescript
export const CDNConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();
```

## Configuration

Configure the CDN service through the Token Ring application configuration:

```typescript
// In your app configuration
const config = {
  cdn: {
    providers: {
      // Your CDN provider configurations here
    }
  }
};
```

Each provider can define its own configuration schema, but typically includes:
- `type`: Provider type identifier
- Provider-specific parameters (e.g., bucket name for S3, API keys for Cloudflare)

## Plugin Integration

As a Token Ring plugin, the CDN service automatically:
- Registers the CDN service when the plugin is installed
- Reads CDN configurations from the app's configuration slice using Zod validation
- Makes the service available through the Token Ring application registry

```typescript
import plugin from "./plugin.ts";

// In your app setup
app.use(plugin, {
  cdn: {
    providers: {
      // Provider configurations
    }
  }
});

// Access the CDN service from the app
const cdnService = app.getService('CDNService');
```

## Usage Examples

### Basic Integration

```typescript
import TokenRingApp from "@tokenring-ai/app";
import CDNPlugin from "@tokenring-ai/cdn";

const app = new TokenRingApp();
app.use(CDNPlugin);
app.start();
```

### Working with Multiple Providers

```typescript
// Register multiple providers
cdnService.registerProvider('s3', new S3CDNProvider());
cdnService.registerProvider('cloudflare', new CloudflareCDNProvider());

// Upload to specific provider
const s3Result = await cdnService.upload('s3', fileBuffer);
const cloudflareResult = await cdnService.upload('cloudflare', fileBuffer);

// Download from specific provider
const s3Data = await cdnService.download('s3', s3Result.url);
const cloudflareData = await cdnService.download('cloudflare', cloudflareResult.url);

// Check if file exists
const s3Exists = await cdnService.exists('s3', s3Result.url);
```

### Custom CDN Provider

```typescript
import CDNProvider from "@tokenring-ai/cdn";
import type { UploadOptions, UploadResult, DeleteResult } from "./types.ts";

class MyCustomCDNProvider extends CDNProvider {
  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Implement your upload logic
    const url = await this.uploadToCustomCDN(data, options);
    return {
      url,
      id: options?.filename,
      metadata: options?.metadata
    };
  }

  async delete?(url: string): Promise<DeleteResult> {
    // Implement your delete logic
    const success = await this.deleteFromCustomCDN(url);
    return {
      success,
      message: success ? 'File deleted successfully' : 'Failed to delete file'
    };
  }
}

// Register the provider
cdnService.registerProvider('custom', new MyCustomCDNProvider());
```

### Using Default Provider Implementations

CDNProvider provides default implementations for `download` and `exists` using fetch:

```typescript
class HTTPCDNProvider extends CDNProvider {
  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Implement only upload - download and exists use defaults
    const url = `https://my-cdn.com/${options?.filename || 'default.txt'}`;
    return { url };
  }
  // download() uses default fetch implementation
  // exists() uses default HEAD implementation
}
```

## Error Handling

The CDN service provides clear error handling for common scenarios:

- **Provider Not Found**: `CDN {name} not found. Please register it first with registerCDN(cdnName, cdnProvider).`
- **No Active CDN**: `No active CDN set. Please set an active CDN before {operation}.`
- **Method Not Implemented**: `Method '{method}' must be implemented by subclasses`
- **Download Failures**: `Failed to download file: {statusText}`
- **Configuration Errors**: Validation errors for invalid provider configurations
- **Delete Not Supported**: `Active CDN does not support deletion`

## Development

### Package Structure

```
pkg/cdn/
├── index.ts              # Main exports and Zod schema
├── types.ts              # TypeScript type definitions
├── CDNService.ts         # Main CDN service implementation
├── CDNProvider.ts        # Abstract CDN provider base class
├── plugin.ts             # Token Ring plugin integration
├── package.json
├── LICENSE
├── test/                 # Test files
│   ├── CDNProvider.test.ts
│   ├── CDNService.test.ts
│   └── types.test.ts
└── vitest.config.ts      # Test configuration
```

### Testing

Run tests with:

```bash
bun run test
bun run test:coverage
```

### Building

```bash
bun run build
```

### Contribution Guidelines

- Follow existing code style and patterns
- Add unit tests for new functionality
- Update documentation for new features
- Ensure all changes work with Token Ring agent framework

## License

MIT License - see [LICENSE](./LICENSE) file for details.
