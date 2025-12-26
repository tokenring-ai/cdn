import {TokenRingPlugin} from "@tokenring-ai/app";
import {z} from "zod";
import CDNService from "./CDNService.ts";
import {CDNConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};

const packageConfigSchema = z.object({
  cdn: CDNConfigSchema.optional(),
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    // const config = app.getConfigSlice('cdn', CDNConfigSchema);
    if (config.cdn) {
      const service = new CDNService();
      app.addServices(service);
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
