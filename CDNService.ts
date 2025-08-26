import {type Registry, Service} from "@token-ring/registry";
import CDNResource from "./CDNResource.js";

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

  private resources: Record<string,CDNResource> = {};

  registerCDN(name: string, resource: CDNResource) {
    this.resources[name] = resource;
  }

  /**
   * Returns a CDNResource by name.
   * @param cdnName
   * @returns CDNResource
   * @throws Error if CDN not found
   */
  getCDNByName(cdnName: string): CDNResource {
    if (this.resources[cdnName]) {
      return this.resources[cdnName];
    }
    throw new Error(
      `CDN ${cdnName} not found. Available CDNs: ${Object.keys(this.resources).join(", ")}`
    )
  }

  async upload(cdnName: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    return this.getCDNByName(cdnName).upload(data, options);
  }

  /**
   * Optional method to delete a file from the CDN.
   * @param cdnName
   * @param url The URL of the file to delete.
   * @returns A promise that resolves to a DeleteResult object indicating the success of the deletion.
   * @throws An error if the deletion fails.
   */
  async delete(cdnName: string, url: string): Promise<DeleteResult> {
    const cdn = this.getCDNByName(cdnName);
    if (! cdn.delete) throw new Error(`CDN ${cdnName} does not support deletion`);

    return cdn.delete(url);
  }

  /**
   * Downloads a file from the CDN.
   * @param cdnName
   * @param url
   */
  async download(cdnName: string, url: string): Promise<Buffer> {
    return this.getCDNByName(cdnName).download(url);
  }
  /**
   * Checks if a file exists in the CDN.
   * @param cdnName
   * @param url
   */
  async exists(cdnName: string, url: string): Promise<boolean> {
    return this.getCDNByName(cdnName).exists(url);
  }
}