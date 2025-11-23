import TokenRingApp from "@tokenring-ai/app";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {z} from "zod";
import CDNService from "./CDNService.ts";
import packageJSON from './package.json' with {type: 'json'};

export const CDNConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();


export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('cdn', CDNConfigSchema);
    if (config) {
      const service = new CDNService();
      app.addServices(service);
    }
  }
} as TokenRingPlugin;

export {default as CDNService} from "./CDNService.ts";
export {default as CDNProvider} from "./CDNProvider.ts";