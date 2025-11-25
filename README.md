# @tokenring-ai/cdn

A CDN abstraction service for the Token Ring platform, providing a unified interface for managing content delivery networks.

## Overview

This package provides a flexible and extensible CDN management system that allows you to work with multiple CDN providers through a consistent API. It's designed as a Token Ring plugin that integrates seamlessly with the Token Ring application framework.

## Features

- **Multi-Provider Support**: Register and manage multiple CDN providers
- **Unified API**: Consistent interface across different CDN implementations
- **Provider Selection**: Choose between active provider or specific CDN by name
- **Core Operations**: Upload, download, delete, and check file existence
- **Plugin Integration**: Seamless integration with Token Ring applications
- **TypeScript Support**: Full type safety with comprehensive type definitions

## Installation

```bash
npm install @tokenring-ai/cdn
```

## Dependencies

- `@tokenring-ai/agent` ^0.1.0
- `@tokenring-ai/utility` ^0.1.0
- `uuid` ^13.0.0

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

##### `registerProvider(name: string, provider: CDNProvider)`

Register a CDN provider with a unique name.

```typescript
cdnService.registerProvider('s3', new S3CDNProvider());
cdnService.registerProvider('cloudflare', new CloudflareCDNProvider());
```

##### `upload(cdnName: string, data: Buffer, options?: UploadOptions): Promise<UploadResult>`

Upload data to a specific CDN provider.

```typescript
const result = await cdnService.upload('s3', fileBuffer, {
  filename: 'example.jpg',
  contentType: 'image/jpeg',
  metadata: { author: 'John Doe' }
});
```

##### `upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>`

Upload data using the active CDN provider.

```typescript
const result = await cdnService.upload(fileBuffer, {
  filename: 'example.jpg',
  contentType: 'image/jpeg'
});
```

##### `download(cdnName: string, url: string): Promise<Buffer>`
##### `download(url: string): Promise<Buffer>`

Download a file from the CDN.

```typescript
// From specific provider
const data = await cdnService.download('s3', 'https://example.com/file.jpg');

// From active provider
const data = await cdnService.download('https://example.com/file.jpg');
```

##### `delete(cdnName: string, url: string): Promise<DeleteResult>`
##### `delete(url: string): Promise<DeleteResult>`

Delete a file from the CDN (if supported by the provider).

```typescript
// From specific provider
const result = await cdnService.delete('s3', 'https://example.com/file.jpg');

// From active provider
const result = await cdnService.delete('https://example.com/file.jpg');
```

##### `exists(cdnName: string, url: string): Promise<boolean>`
##### `exists(url: string): Promise<boolean>`

Check if a file exists in the CDN.

```typescript
// From specific provider
const exists = await cdnService.exists('s3', 'https://example.com/file.jpg');

// From active provider
const exists = await cdnService.exists('https://example.com/file.jpg');
```

### CDNProvider

Abstract base class for implementing CDN providers.

#### Required Methods

##### `upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>`

Upload data to the CDN.

#### Optional Methods

##### `delete(url: string): Promise<DeleteResult>`

Delete a file from the CDN.

##### `download(url: string): Promise<Buffer>`

Download a file from the CDN (default implementation uses HTTP fetch).

##### `exists(url: string): Promise<boolean>`

Check if a file exists in the CDN (default implementation uses HTTP HEAD request).

### Types

#### UploadOptions

```typescript
interface UploadOptions {
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}
```

#### UploadResult

```typescript
interface UploadResult {
  url: string;
  id?: string;
  metadata?: Record<string, any>;
}
```

#### DeleteResult

```typescript
interface DeleteResult {
  success: boolean;
  message?: string;
}
```

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

  async delete(url: string): Promise<DeleteResult> {
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

### Setting Active Provider

```typescript
// Set active provider
cdnService.setActiveProvider('s3');

// Use active provider (no CDN name needed)
const result = await cdnService.upload(fileBuffer);
const data = await cdnService.download(result.url);
```

## Error Handling

The CDN service provides clear error messages for common scenarios:

- **Provider not found**: When trying to use a CDN that hasn't been registered
- **Method not implemented**: When trying to use an optional method that isn't supported by a provider
- **Download failures**: When HTTP requests to CDN URLs fail

## Integration with Token Ring

As a Token Ring plugin, the CDN service integrates with the application lifecycle:

- **Installation**: Automatically registers the CDN service when the plugin is installed
- **Configuration**: Reads CDN configurations from the app's configuration slice
- **Service Management**: Available as a service through the Token Ring application

```typescript
// Access the CDN service from the app
const cdnService = app.getService('CDNService');
```

## License

MIT