import ChatService from "@token-ring/chat/ChatService";
import {type Registry, Service} from "@token-ring/registry";

export interface UploadOptions {
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  id?: string;
  metadata?: Record<string, any>;
}

export interface DeleteResult {
  success: boolean;
  message?: string;
}

/**
 * CDN is an abstract class that provides a unified interface
 * for CDN operations, allowing for different implementations of CDN services.
 */
export default class CDNService extends Service {
  name = "CDN";
  description = "Abstract interface for CDN operations";
  protected registry!: Registry;

  constructor() {
    super();
  }

  /** Starts the service. */
  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  /** Stops the service. */
  async stop(_registry: Registry): Promise<void> {
    // Base implementation does nothing
  }

  // ABSTRACT INTERFACE
  async upload(_data: Buffer, _options?: UploadOptions): Promise<UploadResult> {
    throw new Error("Method 'upload' must be implemented by subclasses");
  }

  async delete(_url: string): Promise<DeleteResult> {
    throw new Error("Method 'delete' must be implemented by subclasses");
  }

  async exists(_url: string): Promise<boolean> {
    throw new Error("Method 'exists' must be implemented by subclasses");
  }

  async getMetadata(_url: string): Promise<Record<string, any> | null> {
    throw new Error("Method 'getMetadata' must be implemented by subclasses");
  }
}