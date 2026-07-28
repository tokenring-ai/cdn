import { describe, expect, it } from "bun:test";
import type { DeleteResult, UploadOptions, UploadResult } from "../types.ts";

describe("CDN Types and Schemas", () => {
  describe("UploadOptions", () => {
    it("should define correct structure", () => {
      const options: UploadOptions = {
        filename: "test.txt",
        contentType: "text/plain",
        metadata: { key: "value" },
      };

      expect(options.filename).toBe("test.txt");
      expect(options.contentType).toBe("text/plain");
      expect(options.metadata).toEqual({ key: "value" });
    });

    it("should allow optional fields", () => {
      const options1: UploadOptions = {};
      const options2: UploadOptions = {
        filename: "test.txt",
      };
      const options3: UploadOptions = {
        contentType: "text/plain",
      };

      expect(options1).toBeDefined();
      expect(options2.filename).toBe("test.txt");
      expect(options3.contentType).toBe("text/plain");
    });

    it("should allow undefined metadata", () => {
      const options: UploadOptions = {
        filename: "test.txt",
        metadata: undefined,
      };

      expect(options.metadata).toBeUndefined();
    });
  });

  describe("UploadResult", () => {
    it("should define correct structure", () => {
      const result: UploadResult = {
        url: "https://example.com/test.txt",
        id: "test-id",
        metadata: { author: "test" },
      };

      expect(result.url).toBe("https://example.com/test.txt");
      expect(result.id).toBe("test-id");
      expect(result.metadata).toEqual({ author: "test" });
    });

    it("should allow optional id", () => {
      const result: UploadResult = {
        url: "https://example.com/test.txt",
      };

      expect(result.id).toBeUndefined();
    });

    it("should allow optional metadata", () => {
      const result: UploadResult = {
        url: "https://example.com/test.txt",
        id: "test-id",
      };

      expect(result.metadata).toBeUndefined();
    });
  });

  describe("DeleteResult", () => {
    it("should define correct structure", () => {
      const result: DeleteResult = {
        success: true,
        message: "File deleted successfully",
      };

      expect(result.success).toBe(true);
      expect(result.message).toBe("File deleted successfully");
    });

    it("should allow optional message", () => {
      const result: DeleteResult = {
        success: false,
      };

      expect(result.message).toBeUndefined();
    });

    it("should handle success and failure cases", () => {
      const successResult: DeleteResult = {
        success: true,
        message: "Success message",
      };

      const failureResult: DeleteResult = {
        success: false,
        message: "Failure message",
      };

      expect(successResult.success).toBe(true);
      expect(failureResult.success).toBe(false);
    });
  });


  describe("Type Compatibility", () => {
    it("should maintain type compatibility across operations", () => {
      const options: UploadOptions = {
        filename: "test.txt",
        contentType: "text/plain",
      };

      const result: UploadResult = {
        url: "https://example.com/test.txt",
        id: "test-id",
      };

      const deleteResult: DeleteResult = {
        success: true,
        message: "Deleted",
      };

      // These should compile without TypeScript errors
      expect(options.filename).toBe("test.txt");
      expect(result.url).toBe("https://example.com/test.txt");
      expect(deleteResult.success).toBe(true);
    });

    it("should handle undefined optional properties correctly", () => {
      const options: UploadOptions = {};
      const result: UploadResult = { url: "https://example.com/test.txt" };

      expect(options.filename).toBeUndefined();
      expect(options.contentType).toBeUndefined();
      expect(options.metadata).toBeUndefined();

      expect(result.id).toBeUndefined();
      expect(result.metadata).toBeUndefined();
    });
  });
});
