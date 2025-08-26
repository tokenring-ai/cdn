import fetch from 'node-fetch';

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
export default class CDNResource {
  /**
   * Uploads a file to the CDN.
   * @param _data
   * @param _options
   */
  async upload(_data: Buffer, _options?: UploadOptions): Promise<UploadResult> {
    throw new Error("Method 'upload' must be implemented by subclasses");
  }

  /**
   * Optional method to delete a file from the CDN.
   * @param url The URL of the file to delete.
   * @returns A promise that resolves to a DeleteResult object indicating the success of the deletion.
   * @throws An error if the deletion fails.
   */
  async delete?(url: string): Promise<DeleteResult>;

  /**
   * Downloads a file from the CDN.
   * @param url
   */
  async download(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Checks if a file exists in the CDN.
   * @param url
   */
  async exists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {method: 'HEAD'});
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}