import { AgentCommandService } from "@tokenring-ai/agent";
import type { TokenRingPlugin } from "@tokenring-ai/app";
import CDNService from "./CDNService.ts";
import agentCommands from "./commands.ts";
import packageJSON from "./package.json" with { type: "json" };

export default {
  name: packageJSON.name,
  displayName: "CDN Service",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app) {
    const service = new CDNService();
    app.addServices(service);
    app.waitForService(AgentCommandService, agentCommandService => agentCommandService.addAgentCommands(agentCommands));
  },
} satisfies TokenRingPlugin;
