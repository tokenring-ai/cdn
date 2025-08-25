import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import CDNService from "../CDNService.ts";

export const name = "cdn/upload";

export async function execute(
  {data, filename, contentType, metadata}: {
    data?: string;
    filename?: string;
    contentType?: string;
    metadata?: Record<string, string>;
  },
  registry: Registry,
): Promise<{url: string; id?: string; metadata?: Record<string, any>}> {
  const chatService = registry.requireFirstServiceByType(ChatService);
  const cdnService = registry.requireFirstServiceByType(CDNService);

  if (!data) {
    throw new Error(`[${name}] 'data' parameter is required`);
  }

  chatService.infoLine(`[${name}] Uploading to CDN via ${cdnService.name}`);

  // Convert base64 data to Buffer
  const buffer = Buffer.from(data, 'base64');

  const result = await cdnService.upload(buffer, {
    filename,
    contentType,
    metadata,
  });

  chatService.infoLine(`[${name}] Upload successful: ${result.url}`);

  return result;
}

export const description = "Upload data to CDN and return the public URL";

export const inputSchema = z.object({
  data: z.string().describe("Base64 encoded data to upload"),
  filename: z.string().describe("Optional filename for the uploaded file").optional(),
  contentType: z.string().describe("Optional MIME type of the file").optional(),
  metadata: z.record(z.string()).describe("Optional metadata key-value pairs").optional(),
});