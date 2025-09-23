import {TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistryWithSingleSelection from "@tokenring-ai/utility/KeyedRegistryWithSingleSelection";
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
export default class CDNService implements TokenRingService {
  name = "CDNService";
  description = "Abstract interface for CDN operations";

  private cdnResourceRegistry = new KeyedRegistryWithSingleSelection<CDNResource>();

  registerCDN = this.cdnResourceRegistry.register;
  getActiveCDN = this.cdnResourceRegistry.getActiveItem;

  getCDNByName(cdnName: string): CDNResource {
    const cdn = this.cdnResourceRegistry.getItemByName(cdnName);
    if (! cdn) throw new Error(
      `CDN ${cdnName} not found. Please register it first with registerCDN(cdnName, cdnResource).`
    )

    return cdn;
  }

  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>;
  async upload(cdnName: string, data: Buffer, options?: UploadOptions): Promise<UploadResult>;
  async upload(cdnNameOrData: string | Buffer, dataOrOptions?: Buffer | UploadOptions, options?: UploadOptions): Promise<UploadResult> {
    if (Buffer.isBuffer(cdnNameOrData)) {
      // First overload: use active CDN
      return this.getActiveCDN().upload(cdnNameOrData, dataOrOptions as UploadOptions);
    } else {
      // Second overload: use specified CDN
      return this.getCDNByName(cdnNameOrData).upload(dataOrOptions as Buffer, options);
    }
  }

  /**
   * Optional method to delete a file from the CDN.
   * @param url The URL of the file to delete.
   * @returns A promise that resolves to a DeleteResult object indicating the success of the deletion.
   * @throws An error if the deletion fails.
   */
  async delete(url: string): Promise<DeleteResult>;
  async delete(cdnName: string, url: string): Promise<DeleteResult>;
  async delete(cdnNameOrUrl: string, url?: string): Promise<DeleteResult> {
    if (url === undefined) {
      // First overload: use active CDN
      const cdn = this.getActiveCDN();
      if (!cdn.delete) throw new Error(`Active CDN does not support deletion`);
      return cdn.delete(cdnNameOrUrl);
    } else {
      // Second overload: use specified CDN
      const cdn = this.getCDNByName(cdnNameOrUrl);
      if (!cdn.delete) throw new Error(`CDN ${cdnNameOrUrl} does not support deletion`);
      return cdn.delete(url);
    }
  }

  /**
   * Downloads a file from the CDN.
   * @param url
   */
  async download(url: string): Promise<Buffer>;
  async download(cdnName: string, url: string): Promise<Buffer>;
  async download(cdnNameOrUrl: string, url?: string): Promise<Buffer> {
    if (url === undefined) {
      // First overload: use active CDN
      return this.getActiveCDN().download(cdnNameOrUrl);
    } else {
      // Second overload: use specified CDN
      return this.getCDNByName(cdnNameOrUrl).download(url);
    }
  }

  /**
   * Checks if a file exists in the CDN.
   * @param url
   */
  async exists(url: string): Promise<boolean>;
  async exists(cdnName: string, url: string): Promise<boolean>;
  async exists(cdnNameOrUrl: string, url?: string): Promise<boolean> {
    if (url === undefined) {
      // First overload: use active CDN
      return this.getActiveCDN().exists(cdnNameOrUrl);
    } else {
      // Second overload: use specified CDN
      return this.getCDNByName(cdnNameOrUrl).exists(url);
    }
  }
}