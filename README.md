# @token-ring/cdn

This package provides an abstract CDN service interface for uploading and managing files in content delivery networks.

## Core Components

### CDNService (Abstract Base Class)

The abstract `CDNService` class defines a standardized interface for CDN operations. Concrete implementations should extend this class.

**Key Methods:**
- `upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>` - Upload data to CDN
- `delete(url: string): Promise<DeleteResult>` - Delete file from CDN by URL
- `exists(url: string): Promise<boolean>` - Check if file exists in CDN
- `getMetadata(url: string): Promise<Record<string, any> | null>` - Get file metadata

### Tools

- **`upload`** - Upload base64 encoded data to CDN and return public URL
- **`delete`** - Delete a file from CDN by URL

## Usage

Concrete implementations (e.g., AWS S3, Cloudflare, etc.) should extend `CDNService` and implement the abstract methods.