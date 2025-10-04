import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {z} from "zod";
import CDNService from "./CDNService.ts";
import packageJSON from './package.json' with {type: 'json'};

export const CDNConfigSchema = z.object({
  providers: z.record(z.string(), z.any())
}).optional();


export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('cdn', CDNConfigSchema);
    if (config) {
      const service = new CDNService();
      agentTeam.services.register(service);
    }
  }
};

export {default as CDNService} from "./CDNService.ts";
export {default as CDNProvider} from "./CDNProvider.ts";