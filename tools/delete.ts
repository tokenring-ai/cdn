import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import CDNService from "../CDNService.ts";

export const name = "cdn/delete";

export async function execute(
  {url}: {url?: string},
  registry: Registry,
): Promise<{success: boolean; message?: string}> {
  const chatService = registry.requireFirstServiceByType(ChatService);
  const cdnService = registry.requireFirstServiceByType(CDNService);

  if (!url) {
    throw new Error(`[${name}] 'url' parameter is required`);
  }

  chatService.infoLine(`[${name}] Deleting from CDN via ${cdnService.name}: ${url}`);

  const result = await cdnService.delete(url);

  if (result.success) {
    chatService.infoLine(`[${name}] Delete successful`);
  } else {
    chatService.infoLine(`[${name}] Delete failed: ${result.message}`);
  }

  return result;
}

export const description = "Delete a file from CDN by URL";

export const inputSchema = z.object({
  url: z.string().describe("URL of the file to delete from CDN"),
});