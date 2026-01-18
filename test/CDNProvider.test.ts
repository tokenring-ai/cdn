import {beforeEach, describe, expect, it, vi} from 'vitest';
import CDNProvider from '../CDNProvider.js';
import CDNService from "../CDNService";
import type {DeleteResult, UploadOptions, UploadResult} from '../types.js';

// Test implementation of CDNProvider
class TestCDNProvider extends CDNProvider {
  private files: Map<string, Buffer> = new Map();
  private uploadCalled = false;
  private downloadCalled = false;
  private existsCalled = false;
  private deleteCalled = false;

  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    this.uploadCalled = true;
    const url = options?.filename || 'default.txt';
    this.files.set(url, data);
    
    return {
      url,
      id: url,
      metadata: options?.metadata
    };
  }

  async download(url: string): Promise<Buffer> {
    this.downloadCalled = true;
    const data = this.files.get(url);
    if (!data) {
      throw new Error(`File not found: ${url}`);
    }
    return data;
  }

  async delete(url: string): Promise<DeleteResult> {
    this.deleteCalled = true;
    const exists = this.files.has(url);
    if (exists) {
      this.files.delete(url);
    }
    return {
      success: exists,
      message: exists ? 'Deleted successfully' : 'File not found'
    };
  }

  async exists(url: string): Promise<boolean> {
    this.existsCalled = true;
    return this.files.has(url);
  }

  // Test helpers
  wasUploadCalled() { return this.uploadCalled; }
  wasDownloadCalled() { return this.downloadCalled; }
  wasExistsCalled() { return this.existsCalled; }
  wasDeleteCalled() { return this.deleteCalled; }
  reset() {
    this.uploadCalled = false;
    this.downloadCalled = false;
    this.existsCalled = false;
    this.deleteCalled = false;
    this.files.clear();
  }
}

describe('CDNProvider', () => {
  let provider: CDNProvider;
  let testProvider: TestCDNProvider;

  beforeEach(() => {
    provider = new CDNProvider();
    testProvider = new TestCDNProvider();
  });

  describe('Abstract Base Class', () => {
    it('should be instantiable', () => {
      expect(provider).toBeInstanceOf(CDNProvider);
    });

    it('should have default download implementation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4))
      });
      
      global.fetch = mockFetch;
      
      const data = await provider.download('https://example.com/test.txt');
      expect(data).toBeInstanceOf(Buffer);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/test.txt');
    });

    it('should have default exists implementation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true
      });
      
      global.fetch = mockFetch;
      
      const exists = await provider.exists('https://example.com/test.txt');
      expect(exists).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/test.txt', { method: 'HEAD' });
    });

    it('should handle exists with network failure', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      global.fetch = mockFetch;
      
      const exists = await provider.exists('https://example.com/test.txt');
      expect(exists).toBe(false);
    });

    it('should handle download with HTTP error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      global.fetch = mockFetch;
      
      await expect(provider.download('https://example.com/test.txt')).rejects.toThrow('Failed to download file: Not Found');
    });
  });

  describe('Custom Provider Implementation', () => {
    it('should implement upload successfully', async () => {
      const data = Buffer.from('test data');
      const options: UploadOptions = {
        filename: 'test.txt',
        contentType: 'text/plain'
      };

      const result = await testProvider.upload(data, options);
      
      expect(result).toEqual({
        url: 'test.txt',
        id: 'test.txt',
        metadata: undefined
      });
      expect(testProvider.wasUploadCalled()).toBe(true);
    });

    it('should implement download successfully', async () => {
      // Upload first
      const data = Buffer.from('test data');
      await testProvider.upload(data, { filename: 'test.txt' });
      
      // Test download
      const downloadedData = await testProvider.download('test.txt');
      
      expect(downloadedData).toEqual(Buffer.from('test data'));
      expect(testProvider.wasDownloadCalled()).toBe(true);
    });

    it('should implement delete successfully', async () => {
      // Upload first
      const data = Buffer.from('test data');
      await testProvider.upload(data, { filename: 'test.txt' });
      
      // Test delete
      const result = await testProvider.delete('test.txt');
      
      expect(result).toEqual({
        success: true,
        message: 'Deleted successfully'
      });
      expect(testProvider.wasDeleteCalled()).toBe(true);
    });

    it('should implement exists successfully', async () => {
      // Upload first
      const data = Buffer.from('test data');
      await testProvider.upload(data, { filename: 'test.txt' });
      
      // Test exists
      const exists = await testProvider.exists('test.txt');
      
      expect(exists).toBe(true);
      expect(testProvider.wasExistsCalled()).toBe(true);
    });

    it('should handle non-existent file in exists check', async () => {
      const exists = await testProvider.exists('non-existent.txt');
      expect(exists).toBe(false);
      expect(testProvider.wasExistsCalled()).toBe(true);
    });

    it('should handle non-existent file in download', async () => {
      await expect(testProvider.download('non-existent.txt')).rejects.toThrow('File not found: non-existent.txt');
      expect(testProvider.wasDownloadCalled()).toBe(true);
    });

    it('should handle non-existent file in delete', async () => {
      const result = await testProvider.delete('non-existent.txt');
      expect(result).toEqual({
        success: false,
        message: 'File not found'
      });
      expect(testProvider.wasDeleteCalled()).toBe(true);
    });
  });

  describe('Upload Options Handling', () => {
    it('should handle filename in upload options', async () => {
      const data = Buffer.from('test data');
      const options: UploadOptions = {
        filename: 'custom-name.txt',
        contentType: 'text/plain',
        metadata: { author: 'test', version: '1.0' }
      };

      const result = await testProvider.upload(data, options);
      
      expect(result.url).toBe('custom-name.txt');
      expect(result.metadata).toEqual({ author: 'test', version: '1.0' });
    });

    it('should handle upload without options', async () => {
      const data = Buffer.from('test data');
      const result = await testProvider.upload(data);
      
      expect(result.url).toBe('default.txt');
      expect(result.id).toBe('default.txt');
    });

    it('should handle upload with minimal options', async () => {
      const data = Buffer.from('test data');
      const options: UploadOptions = {};
      const result = await testProvider.upload(data, options);
      
      expect(result.url).toBe('default.txt');
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle upload failures', async () => {
      class FailingProvider extends CDNProvider {
        async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
          throw new Error('Upload failed');
        }
      }

      const failingProvider = new FailingProvider();
      await expect(failingProvider.upload(Buffer.from('test'))).rejects.toThrow('Upload failed');
    });

    it('should handle download failures', async () => {
      class FailingProvider extends CDNProvider {
        async download(url: string): Promise<Buffer> {
          throw new Error('Download failed');
        }
      }

      const failingProvider = new FailingProvider();
      await expect(failingProvider.download('test.txt')).rejects.toThrow('Download failed');
    });

    it('should handle delete failures', async () => {
      class FailingProvider extends CDNProvider {
        async delete(url: string): Promise<DeleteResult> {
          throw new Error('Delete failed');
        }
      }

      const failingProvider = new FailingProvider();
      await expect(failingProvider.delete('test.txt')).rejects.toThrow('Delete failed');
    });
  });

  describe('Integration with CDNService', () => {
    it('should work with CDNService integration', async () => {
      const cdnService = new CDNService();
      
      cdnService.registerProvider('test', testProvider);
      
      // Test upload integration
      const data = Buffer.from('integration test');
      const result = await cdnService.upload('test', data, { filename: 'integration.txt' });
      
      expect(result.url).toBe('integration.txt');
      expect(testProvider.wasUploadCalled()).toBe(true);
    });

    it('should handle CDNService error propagation', async () => {
      class FailingProvider extends CDNProvider {
        async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
          throw new Error('Service unavailable');
        }
      }

      const cdnService = new CDNService();
      const failingProvider = new FailingProvider();
      
      cdnService.registerProvider('failing', failingProvider);
      
      await expect(cdnService.upload('failing', Buffer.from('test'), {})).rejects.toThrow('Service unavailable');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large file operations', async () => {
      const largeData = Buffer.alloc(1024 * 1024, 'a'); // 1MB
      
      const result = await testProvider.upload(largeData, { filename: 'large.txt' });
      expect(result.url).toBe('large.txt');
      
      const downloaded = await testProvider.download('large.txt');
      expect(downloaded).toEqual(largeData);
    });

    it('should handle empty file operations', async () => {
      const emptyData = Buffer.from('');
      
      const result = await testProvider.upload(emptyData, { filename: 'empty.txt' });
      expect(result.url).toBe('empty.txt');
      
      const downloaded = await testProvider.download('empty.txt');
      expect(downloaded).toEqual(Buffer.from(''));
    });

    it('should handle binary data correctly', async () => {
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF]);
      
      const result = await testProvider.upload(binaryData, { filename: 'binary.dat' });
      expect(result.url).toBe('binary.dat');
      
      const downloaded = await testProvider.download('binary.dat');
      expect(downloaded).toEqual(binaryData);
    });

    it('should handle special characters in filenames', async () => {
      const data = Buffer.from('test');
      const specialNames = [
        'file with spaces.txt',
        'file-with-dashes_and_underscores.txt',
        'file.with.dots.txt',
        'file@with#special$chars%.txt'
      ];

      for (const filename of specialNames) {
        const result = await testProvider.upload(data, { filename });
        expect(result.url).toBe(filename);
      }
    });
  });
});