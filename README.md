# @tokenring-ai/cdn

A CDN abstraction service for the Token Ring platform, providing a unified interface for managing content delivery networks.

## Overview

This package provides a flexible and extensible CDN management system that allows you to work with multiple CDN providers through a consistent API. It's designed as a Token Ring plugin that integrates seamlessly with the Token Ring application framework using the service registry pattern.

## Features

- **Multi-Provider Support**: Register and manage multiple CDN providers with a unified interface
- **Unified API**: Consistent interface across different CDN implementations
- **Core Operations**: Upload, download, delete, and check file existence
- **Plugin Integration**: Seamless integration with Token Ring applications via service registry
- **TypeScript Support**: Full type safety with comprehensive type definitions
- **Zod Validation**: Configuration validation using Zod schemas
- **Service Registry**: Built on Token Ring's KeyedRegistry for provider management

## Installation

```bash
bun install @tokenring-ai/cdn
```

## Dependencies

- `@tokenring-ai/app` ^0.2.0 (Application framework)
- `@tokenring-ai/agent` ^0.2.0 (Agent orchestration)
- `@tokenring-ai/utility` ^0.2.0 (Registry utilities)
- `@tokenring-ai/chat` ^0.2.0 (Chat system)
- `uuid` ^13.0.0 (Unique identifier generation)
- `zod` (Configuration validation)

## Quick Start

### Basic Integration

The CDN package integrates as a Token Ring plugin:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import CDNPlugin from "@tokenring-ai/cdn";

const app = new TokenRingApp();
app.use(CDNPlugin);
app.start();
```

### Configuration

Configure the CDN service through the Token Ring configuration:

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

## API Reference

### CDNService

The main service class that manages CDN operations and provider registration.

#### Core Methods

##### `registerProvider(name: string, provider: CDNProvider): void`

Register a CDN provider with a unique name.

```typescript
cdnService.registerProvider('s3', new S3CDNProvider());
cdnService.registerProvider('cloudflare', new CloudflareCDNProvider());
```

##### `upload(cdnName: string, data: string | Buffer, options?: UploadOptions): Promise<UploadResult>`

Upload data to a specific CDN provider.

```typescript
const result = await cdnService.upload('s3', fileBuffer, {
  filename: 'example.jpg',
  contentType: 'image/jpeg',
  metadata: { author: 'John Doe' }
});
```

##### `delete(cdnName: string, url: string): Promise<DeleteResult>`

Delete a file from a specific CDN provider.

```typescript
const result = await cdnService.delete('s3', 'https://example.com/file.jpg');
```

##### `download(cdnName: string, url: string): Promise<Buffer>`

Download a file from a specific CDN provider.

```typescript
const data = await cdnService.download('s3', 'https://example.com/file.jpg');
```

##### `exists(cdnName: string, url: string): Promise<boolean>`

Check if a file exists in a specific CDN provider.

```typescript
const exists = await cdnService.exists('s3', 'https://example.com/file.jpg');
```

### CDNProvider

Abstract base class for implementing CDN providers.

#### Required Methods

##### `upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>`

Upload data to the CDN.

#### Optional Methods

##### `delete?(url: string): Promise<DeleteResult>`

Delete a file from the CDN (optional).

##### `download(url: string): Promise<Buffer>`

Download a file from the CDN (default implementation uses HTTP fetch).

##### `exists(url: string): Promise<boolean>`

Check if a file exists in the CDN (default implementation uses HTTP HEAD request).

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

## Package Structure

```
pkg/cdn/
├── index.ts              # Main exports and Zod schema
├── types.ts              # TypeScript type definitions
├── CDNService.ts         # Main CDN service implementation
├── CDNProvider.ts        # Abstract CDN provider base class
├── plugin.ts             # Token Ring plugin integration
├── test/                 # Test files
│   ├── CDNProvider.test.ts
│   ├── CDNService.test.ts
│   └── types.test.ts
└── vitest.config.ts      # Test configuration
```

## Integration with Token Ring

As a Token Ring plugin, the CDN service integrates with the application lifecycle:

- **Installation**: Automatically registers the CDN service when the plugin is installed
- **Configuration**: Reads CDN configurations from the app's configuration slice using Zod validation
- **Service Management**: Available as a service through the Token Ring application registry

```typescript
// Access the CDN service from the app
const cdnService = app.getService('CDNService');
```

## Usage Examples

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
```

### Error Handling

The CDN service provides clear error messages for common scenarios:

- **Provider not found**: When trying to use a CDN that hasn't been registered
- **Method not implemented**: When trying to use an optional method that isn't supported by a provider
- **Download failures**: When HTTP requests to CDN URLs fail

## Creating Custom CDN Providers

To create a custom CDN provider, extend the `CDNProvider` class:

```typescript
import CDNProvider from "@tokenring-ai/cdn";

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

## License

MIT