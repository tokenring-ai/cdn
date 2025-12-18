import {z} from "zod";

export const CDNConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();


export {default as CDNService} from "./CDNService.ts";
export {default as CDNProvider} from "./CDNProvider.ts";