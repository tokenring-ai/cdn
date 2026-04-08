import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {z} from "zod";
import CDNService from "./CDNService.ts";
import agentCommands from "./commands.ts";
import {CDNConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};

const packageConfigSchema = z.object({
  cdn: CDNConfigSchema.optional(),
});

export default {
  name: packageJSON.name,
  displayName: "CDN Service",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    const service = new CDNService();
    app.addServices(service);
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(agentCommands)
    );
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
