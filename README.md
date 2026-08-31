# @tokenring-ai/cdn

A CDN abstraction service for the Token Ring platform, providing a unified interface for managing content delivery networks.

## Overview

The `@tokenring-ai/cdn` package provides a flexible CDN management system that allows Token Ring applications to work with multiple CDN providers through a unified API. It implements the Token Ring service pattern and integrates seamlessly with the application framework via plugins.

### Key Features

- **Multi-Provider Support**: Register and manage multiple CDN providers with a unified interface
- **Unified API**: Consistent interface across different CDN implementations
- **Core Operations**: Upload, download, delete, and check file existence
- **Service Registry**: Built on Token Ring's `KeyedRegistry` for provider management
- **Plugin Integration**: Seamless integration with Token Ring applications via service registry
- **Comprehensive Error Handling**: Clear error messages for common scenarios
- **Default Implementations**: Built-in HTTP-based `download` and `exists` operations using `fetch`
- **String to Buffer Conversion**: Automatic conversion of string data to `Buffer` on upload

### Integration Points

- Integrates with `@tokenring-ai/app` for plugin and service registration
- Uses `@tokenring-ai/agent` for chat command registration via `AgentCommandService`
- Uses `@tokenring-ai/utility` for `KeyedRegistry`-based provider management

## Installation

```bash
bun add @tokenring-ai/cdn
```

## Chat Commands

| Command              | Description                       |
|----------------------|-----------------------------------|
| `/cdn provider list` | List all registered CDN providers |

### /cdn provider list

List all registered CDN providers.

**Example:**

```bash
/cdn provider list
```

**Output:**

```text
s3
cloudflare
custom
```

If no providers are registered, the command returns: `No CDN providers are registered.`

## Tools

This package does not define any tools.

## Configuration

This package does not define a configuration schema. Installing the plugin always registers `CDNService`. Provider implementations must be registered programmatically with `registerProvider(name, provider)`.

## Core Components

### CDNService

The main service class that manages CDN operations and provider registration. Implements `TokenRingService` and is registered with the Token Ring application when the plugin is installed.

```typescript
import { CDNService } from "@tokenring-ai/cdn";

const cdnService = new CDNService();
```

#### State properties

| Property | Type | Description |
|---|---|---|
| `name` | `string` | Service identifier: `"CDNService"` |
| `description` | `string` | Human-readable description: `"Abstract interface for CDN operations"` |

#### Provider management methods

| Method | Description |
|---|---|
| `registerProvider(name: string, provider: CDNProvider): void` | Register a CDN provider with an explicit unique name (delegates to `KeyedRegistry.set`) |
| `unregisterProvider(name: string): CDNProvider \| undefined` | Unregister a CDN provider by name; returns the removed provider or `undefined` (delegates to `KeyedRegistry.unregister`) |
| `getAvailableProviders(): string[]` | Returns an array of registered provider names (delegates to `KeyedRegistry.keysArray`) |
| `requireCDNByName(cdnName: string): CDNProvider` | Retrieves a registered CDN provider by name; throws `ConfigurationError` if not found |

#### Operation methods

| Method | Description |
|---|---|
| `upload(cdnName: string, data: string \| Buffer, options: UploadOptions): Promise<UploadResult>` | Upload data to a specific CDN provider; converts string data to `Buffer` automatically |
| `delete(cdnName: string, url: string): Promise<DeleteResult>` | Delete a file from a specific CDN provider |
| `download(cdnName: string, url: string): Promise<Buffer>` | Download a file from a specific CDN provider |
| `exists(cdnName: string, url: string): Promise<boolean>` | Check if a file exists in a specific CDN provider |

#### Method details

**`upload(cdnName, data, options)`**

Upload data to a specific CDN provider. String data is automatically converted to `Buffer`. The `options` parameter is required, but all fields within `UploadOptions` are optional.

- Throws `ConfigurationError` with message `"A non-empty CDN name is required for upload."` if `cdnName` is empty.
- Throws `ConfigurationError` if no provider is found with the given name.

**`delete(cdnName, url)`**

Delete a file from a specific CDN provider.

- Throws `ConfigurationError` if no provider is found with the given name.
- Throws `Error` with message `` `CDN '${cdnName}' does not support deletion` `` if the provider has no `delete` method.

**`download(cdnName, url)`**

Download a file from a specific CDN provider.

- Throws `ConfigurationError` if no provider is found with the given name.
- Delegates to the provider's `download` method; the default implementation throws `Error` with message `` `Failed to download file: ${response.statusText}` `` on HTTP errors.

**`exists(cdnName, url)`**

Check if a file exists in a specific CDN provider.

- Throws `ConfigurationError` if no provider is found with the given name.
- Delegates to the provider's `exists` method; the default implementation returns `false` on network errors.

**`requireCDNByName(cdnName)`**

Retrieves a registered CDN provider by name.

- Throws `ConfigurationError` with message `` `CDN ${cdnName} not found. Please register it first with registerProvider(cdnName, cdnProvider).` `` if the provider is not found.

### CDNProvider

Abstract base class for implementing CDN providers. All CDN providers must extend this class and implement the required `upload` method. Default implementations are provided for `download` and `exists` using HTTP `fetch`.

```typescript
import { CDNProvider } from "@tokenring-ai/cdn";

class MyCDNProvider extends CDNProvider {
  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Implementation here
  }
}
```

#### CDNProvider methods

| Method | Description |
|---|---|
| `abstract upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>` | Upload data to the CDN; must be implemented by subclasses |
| `delete?(url: string): Promise<DeleteResult>` | Optional: delete a file from the CDN; no default implementation |
| `download(url: string): Promise<Buffer>` | Download a file via HTTP GET using `fetch`; default implementation provided |
| `exists(url: string): Promise<boolean>` | Check if a file exists via HTTP HEAD using `fetch`; default implementation provided, returns `false` on network errors |

#### Provider implementation example

```typescript
import { CDNProvider } from "@tokenring-ai/cdn";
import type { UploadOptions, UploadResult, DeleteResult } from "@tokenring-ai/cdn";

class CustomCDNProvider extends CDNProvider {
  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Implement upload logic — must return UploadResult with at least a url property
  }

  async delete(url: string): Promise<DeleteResult> {
    // Optional: implement delete logic
  }

  // download() and exists() use default fetch-based implementations
}
```

#### Provider registration

Providers are registered with the `CDNService` using explicit names:

```typescript
const cdnService = new CDNService();
const provider = new CustomCDNProvider();

// Register provider with explicit name
cdnService.registerProvider("custom", provider);

// Retrieve by name
const retrievedProvider = cdnService.requireCDNByName("custom");

// List all providers
const providerNames = cdnService.getAvailableProviders();

// Unregister a provider
cdnService.unregisterProvider("custom");
```

### Types

#### UploadOptions

```typescript
export interface UploadOptions {
  filename?: string | undefined;
  contentType?: string | undefined;
  metadata?: Record<string, string> | undefined;
}
```

#### UploadResult

```typescript
export interface UploadResult {
  url: string;
  id?: string | undefined;
  /** May include provider-enriched values beyond the string-only UploadOptions.metadata. */
  metadata?: Record<string, any> | undefined;
}
```

`UploadResult.metadata` is wider than `UploadOptions.metadata` so providers can return additional non-string values (size, timestamps, and similar).

#### DeleteResult

```typescript
export interface DeleteResult {
  success: boolean;
  message?: string | undefined;
}
```

## Services

### Service Registration

```typescript
import TokenRingApp from "@tokenring-ai/app";
import PluginManager from "@tokenring-ai/app/PluginManager";
import CDNPlugin from "@tokenring-ai/cdn/plugin";

const app = new TokenRingApp({ app: { workingDirectory, workspaceDirectory, configDirectories } });
const pluginManager = app.addService(new PluginManager(app));

await pluginManager.installPlugins([CDNPlugin]);

const cdnService = app.getService("CDNService");
```

### Plugin Lifecycle

This plugin defines no agent lifecycle hooks. It registers a service and chat commands at install time.

| Field | Value |
|---|---|
| `name` | `@tokenring-ai/cdn` |
| `displayName` | `CDN Service` |
| `version` | `0.2.0` |
| `description` | `A CDN abstraction for Token Ring` |
| `configSchema` | (none) |

**`install(app)`** performs the following steps:

1. Registers `CDNService` via `app.addService(new CDNService())`.
2. Waits for `AgentCommandService` to become available, then registers the `cdn provider list` command via `agentCommandService.addAgentCommands(agentCommands)`.

## RPC

This package does not define RPC endpoints. CDN operations are accessed through the service registry.

## Usage Examples

### Registering and Using Providers

```typescript
import { CDNService } from "@tokenring-ai/cdn";

const cdnService = new CDNService();

// Register multiple providers with explicit names
cdnService.registerProvider("provider1", new CustomCDNProvider());
cdnService.registerProvider("provider2", new AnotherCDNProvider());

// List all providers
const providers = cdnService.getAvailableProviders(); // ["provider1", "provider2"]

// Upload to a specific provider
const result = await cdnService.upload("provider1", Buffer.from("data"), {
  filename: "file.txt",
  contentType: "text/plain",
});

// Download from a specific provider
const data = await cdnService.download("provider1", result.url);

// Check if a file exists
const exists = await cdnService.exists("provider1", result.url);

// Delete a file
const deleteResult = await cdnService.delete("provider1", result.url);

// Unregister a provider
cdnService.unregisterProvider("provider2");
```

### String to Buffer Conversion

The `CDNService.upload` method automatically converts string data to `Buffer`:

```typescript
// String data is automatically converted to Buffer
const result = await cdnService.upload("provider", "Hello, World!", {
  filename: "hello.txt",
  contentType: "text/plain",
});

// Buffer data works directly
const bufferResult = await cdnService.upload("provider", Buffer.from("Hello, World!"), {
  filename: "hello.txt",
});
```

### Agent System Integration

The `CDNService` is registered with the Token Ring agent system, allowing agents to perform CDN operations through the service registry:

```typescript
import { CDNService } from "@tokenring-ai/cdn";

// In an agent command or tool
const cdnService = agent.requireService(CDNService);
const result = await cdnService.upload("provider-name", fileBuffer, {
  filename: "file.txt",
  contentType: "text/plain",
});
```

### Using Default Provider Implementations

`CDNProvider` provides default implementations for `download` and `exists` using `fetch`:

```typescript
import { CDNProvider } from "@tokenring-ai/cdn";

class HTTPCDNProvider extends CDNProvider {
  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // Implement only upload — download and exists use defaults
    const url = `https://my-cdn.com/${options?.filename || "default.txt"}`;
    return { url };
  }

  // download() uses default fetch implementation
  // exists() uses default HEAD implementation
}

const cdnService = new CDNService();
cdnService.registerProvider("http", new HTTPCDNProvider());
```

## Dependencies

| Package | Purpose |
|---|---|
| `@tokenring-ai/agent` | Agent system integration, chat command registration via `AgentCommandService` |
| `@tokenring-ai/app` | Token Ring application framework, service registration |
| `@tokenring-ai/utility` | `KeyedRegistry` for provider management |

## Testing

```bash
bun run test
bun run test:watch
bun run test:coverage
```

Tests use `bun test` and cover:

- `CDNService` provider registration, retrieval, and unregistration
- `CDNProvider` default `download` and `exists` implementations
- Type definitions and schemas
- Upload, download, delete, and exists operations
- Error handling scenarios (missing providers, unsupported deletion, empty CDN name)

## License

MIT License — see [LICENSE](./LICENSE) file for details.
