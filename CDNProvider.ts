import type { DeleteResult, UploadOptions, UploadResult } from "./types.ts";

/**
 * Abstract base class for CDN operations. Subclasses must implement `upload`.
 */
export default abstract class CDNProvider {
  /**
   * Uploads a file to the CDN.
   */
  abstract upload(data: Buffer, options?: UploadOptions): Promise<UploadResult>;

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
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }
}
