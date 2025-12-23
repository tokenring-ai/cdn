import {TokenRingService} from "@tokenring-ai/app/types";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import CDNProvider from "./CDNProvider.js";
import type {DeleteResult, UploadOptions, UploadResult} from './types.js';

/**
 * CDN is an abstract class that provides a unified interface
 * for CDN operations, allowing for different implementations of CDN services.
 */
export default class CDNService implements TokenRingService {
  name = "CDNService";
  description = "Abstract interface for CDN operations";

  private providers = new KeyedRegistry<CDNProvider>();

  registerProvider = this.providers.register;

  getCDNByName(cdnName: string): CDNProvider {
    const cdn = this.providers.getItemByName(cdnName);
    if (!cdn) throw new Error(
      `CDN ${cdnName} not found. Please register it first with registerCDN(cdnName, cdnProvider).`
    )

    return cdn;
  }


  async upload(cdnName: string, data: string | Buffer, options: UploadOptions): Promise<UploadResult> {
    if (!cdnName) throw new Error("No active CDN set. Please set an active CDN before uploading.");

    if (typeof data === "string") data = Buffer.from(data);

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
    if (!cdn) throw new Error(`No active CDN set. Please set an active CDN before deleting.`);

    if (!cdn.delete) throw new Error(`Active CDN does not support deletion`);
    return cdn.delete(url);
  }

  /**
   * Downloads a file from the CDN.
   * @param cdnName The name of the CDN to use for the download.
   * @param url The URL of the file to download.
   */

  async download(cdnName: string, url: string): Promise<Buffer> {
    const cdn = this.getCDNByName(cdnName)
    if (!cdn) throw new Error(`No active CDN set. Please set an active CDN before downloading.`);

    return cdn.download(url);
  }

  /**
   * Checks if a file exists in the CDN.
   * @param cdnName The name of the CDN to check.
   * @param url The URL of the file to check.
   */
  async exists(cdnName: string, url: string): Promise<boolean> {
    const cdn = this.getCDNByName(cdnName);
    if (!cdn) return false;

    return cdn.exists(url);
  }
}