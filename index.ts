import { z } from "zod";

export const CDNConfigSchema = z.object({}).exactOptional();

export { default as CDNProvider } from "./CDNProvider.ts";
export { default as CDNService } from "./CDNService.ts";
