import TokenRingApp from "@tokenring-ai/app";
import {TokenRingPlugin} from "@tokenring-ai/app";
import CDNService from "./CDNService.ts";
import {CDNConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};


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
