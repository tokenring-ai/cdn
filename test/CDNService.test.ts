import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CDNService from '../CDNService.js';
import CDNProvider from '../CDNProvider.js';
import type { UploadOptions, UploadResult, DeleteResult } from '../types.js';

// Mock CDN Provider for testing
class MockCDNProvider extends CDNProvider {
  private files: Map<string, Buffer> = new Map();
  private uploadCount = 0;
  private downloadCount = 0;
  private deleteCount = 0;
  private existsCount = 0;

  async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    this.uploadCount++;
    const url = options?.filename || `file-${this.uploadCount}.txt`;
    this.files.set(url, data);
    
    return {
      url,
      id: url,
      metadata: options?.metadata
    };
  }

  async download(url: string): Promise<Buffer> {
    this.downloadCount++;
    const data = this.files.get(url);
    if (!data) {
      throw new Error(`File not found: ${url}`);
    }
    return data;
  }

  async delete(url: string): Promise<DeleteResult> {
    this.deleteCount++;
    const exists = this.files.has(url);
    if (exists) {
      this.files.delete(url);
    }
    return {
      success: exists,
      message: exists ? 'File deleted successfully' : 'File not found'
    };
  }

  async exists(url: string): Promise<boolean> {
    this.existsCount++;
    return this.files.has(url);
  }

  // Test helpers
  getUploadCount() { return this.uploadCount; }
  getDownloadCount() { return this.downloadCount; }
  getDeleteCount() { return this.deleteCount; }
  getExistsCount() { return this.existsCount; }
  reset() {
    this.uploadCount = 0;
    this.downloadCount = 0;
    this.deleteCount = 0;
    this.existsCount = 0;
    this.files.clear();
  }
}

describe('CDNService', () => {
  let cdnService: CDNService;
  let mockProvider1: MockCDNProvider;
  let mockProvider2: MockCDNProvider;

  beforeEach(() => {
    cdnService = new CDNService();
    mockProvider1 = new MockCDNProvider();
    mockProvider2 = new MockCDNProvider();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Registration', () => {
    it('should register a provider successfully', () => {
      expect(() => {
        cdnService.registerProvider('provider1', mockProvider1);
      }).not.toThrow();
    });

    it('should throw error when getting non-existent provider', () => {
      expect(() => {
        cdnService.getCDNByName('non-existent');
      }).toThrow('CDN non-existent not found');
    });

    it('should get provider by name successfully', () => {
      cdnService.registerProvider('provider1', mockProvider1);
      const provider = cdnService.getCDNByName('provider1');
      expect(provider).toBe(mockProvider1);
    });
  });

  describe('Upload Operations', () => {
    beforeEach(() => {
      cdnService.registerProvider('provider1', mockProvider1);
    });

    it('should upload to specific provider', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      const data = Buffer.from('test data');
      const options: UploadOptions = {
        filename: 'test2.txt',
        contentType: 'text/plain'
      };

      const result = await cdnService.upload('provider2', data, options);
      
      expect(result).toEqual({
        url: 'test2.txt',
        id: 'test2.txt',
        metadata: undefined
      });
      expect(mockProvider2.getUploadCount()).toBe(1);
    });

    it('should throw error when uploading without active provider', async () => {
      const emptyService = new CDNService();
      const data = Buffer.from('test data');
      
      await expect(emptyService.upload(data)).rejects.toThrow();
    });

    it('should throw error when uploading to non-existent provider', async () => {
      const data = Buffer.from('test data');
      
      await expect(cdnService.upload('non-existent', data)).rejects.toThrow('CDN non-existent not found');
    });

    it('should handle complex upload options', async () => {
      const data = Buffer.from('complex test data');
      const options: UploadOptions = {
        filename: 'complex.txt',
        contentType: 'application/json',
        metadata: { author: 'test', version: '1.0' }
      };

      const result = await cdnService.upload("provider1", data, options);
      
      expect(result.url).toBe('complex.txt');
      expect(result.metadata).toEqual({ author: 'test', version: '1.0' });
      expect(mockProvider1.getUploadCount()).toBe(1);
    });
  });

  describe('Download Operations', () => {
    beforeEach(async () => {
      cdnService.registerProvider('provider1', mockProvider1);
      // Upload a file first
      const data = Buffer.from('test data for download');
      await cdnService.upload('provider1', data, { filename: 'download-test.txt' });
    });

    it('should download from specific provider', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      // Upload to provider2
      const data = Buffer.from('provider2 data');
      await cdnService.upload('provider2', data, { filename: 'provider2-test.txt' });
      
      const result = await cdnService.download('provider2', 'provider2-test.txt');
      
      expect(result).toEqual(Buffer.from('provider2 data'));
      expect(mockProvider2.getDownloadCount()).toBe(1);
    });

    it('should throw error when downloading non-existent file', async () => {
      cdnService.registerProvider('provider2', mockProvider2);

      await expect(cdnService.download('provider2','non-existent.txt')).rejects.toThrow('File not found');
    });

    it('should throw error when downloading from non-existent provider', async () => {
      await expect(cdnService.download('provider3', 'any-file.txt')).rejects.toThrow('CDN provider3 not found');
    });
  });

  describe('Delete Operations', () => {
    beforeEach(async () => {
      cdnService.registerProvider('provider1', mockProvider1);
      const data = Buffer.from('test data');
      await cdnService.upload('provider1', data, { filename: 'delete-test.txt' });
    });

    it('should delete from active provider', async () => {
      const result = await cdnService.delete('provider1','delete-test.txt');
      
      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully'
      });
      expect(mockProvider1.getDeleteCount()).toBe(1);
    });

    it('should delete from specific provider', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      const data = Buffer.from('provider2 data');
      await cdnService.upload('provider2', data, { filename: 'provider2-delete.txt' });
      
      const result = await cdnService.delete('provider2', 'provider2-delete.txt');
      
      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully'
      });
      expect(mockProvider2.getDeleteCount()).toBe(1);
    });

    it('should handle non-existent file deletion', async () => {
      const result = await cdnService.delete('provider1','non-existent.txt');
      
      expect(result).toEqual({
        success: false,
        message: 'File not found'
      });
      expect(mockProvider1.getDeleteCount()).toBe(1);
    });

    it('should throw error when deleting from non-existent provider', async () => {
      await expect(cdnService.delete('provider3', 'any-file.txt')).rejects.toThrow('CDN provider3 not found');
    });
  });

  describe('Exists Operations', () => {
    beforeEach(async () => {
      cdnService.registerProvider('provider1', mockProvider1);
      const data = Buffer.from('test data');
      await cdnService.upload('provider1', data, { filename: 'exists-test.txt' });
    });

    it('should check existence on specific provider', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      const data = Buffer.from('provider2 data');
      await cdnService.upload('provider2', data, { filename: 'provider2-exists.txt' });
      
      const exists = await cdnService.exists('provider2', 'provider2-exists.txt');
      
      expect(exists).toBe(true);
      expect(mockProvider2.getExistsCount()).toBe(1);
    });

    it('should return false for non-existent file', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      const exists = await cdnService.exists('provider2','non-existent.txt');
      
      expect(exists).toBe(false);
      expect(mockProvider2.getExistsCount()).toBe(1);
    });

    it('should throw error when checking existence on non-existent provider', async () => {
      await expect(cdnService.exists('provider3', 'any-file.txt')).rejects.toThrow('CDN provider3 not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle provider method errors', async () => {
      class FailingProvider extends CDNProvider {
        async upload(data: Buffer, options?: UploadOptions): Promise<UploadResult> {
          throw new Error('Upload failed');
        }
      }

      const failingProvider = new FailingProvider();
      cdnService.registerProvider('failing', failingProvider);
      
      await expect(cdnService.upload('failing', Buffer.from('test'), {})).rejects.toThrow('Upload failed');
    });
  });

  describe('Performance and Edge Cases', () => {
    beforeEach(() => {
      cdnService.registerProvider('provider1', mockProvider1);
    });

    it('should handle large file uploads', async () => {
      const largeData = Buffer.alloc(1024 * 1024, 'a'); // 1MB file
      const result = await cdnService.upload('provider1', largeData, { filename: 'large-file.txt' });
      
      expect(result.url).toBe('large-file.txt');
      expect(mockProvider1.getUploadCount()).toBe(1);
    });

    it('should handle concurrent operations', async () => {
      const data1 = Buffer.from('file1');
      const data2 = Buffer.from('file2');
      const data3 = Buffer.from('file3');
      
      const promises = [
        cdnService.upload('provider1', data1, { filename: 'concurrent1.txt' }),
        cdnService.upload('provider1', data2, { filename: 'concurrent2.txt' }),
        cdnService.upload('provider1', data3, { filename: 'concurrent3.txt' })
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results[0].url).toBe('concurrent1.txt');
      expect(results[1].url).toBe('concurrent2.txt');
      expect(results[2].url).toBe('concurrent3.txt');
      expect(mockProvider1.getUploadCount()).toBe(3);
    });

    it('should maintain operation isolation between providers', async () => {
      cdnService.registerProvider('provider2', mockProvider2);
      
      // Upload to provider1
      await cdnService.upload('provider1', Buffer.from('data1'), { filename: 'test1.txt' });
      
      // Upload to provider2  
      await cdnService.upload('provider2', Buffer.from('data2'), { filename: 'test2.txt' });
      
      // Check counts are separate
      expect(mockProvider1.getUploadCount()).toBe(1);
      expect(mockProvider2.getUploadCount()).toBe(1);
      
      // Verify files are separate
      expect(await cdnService.exists('provider1', 'test1.txt')).toBe(true);
      expect(await cdnService.exists('provider2', 'test2.txt')).toBe(true);
    });
  });
});