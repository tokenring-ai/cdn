import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CDNService from "../../../CDNService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const available = agent.requireServiceByType(CDNService).getAvailableProviders();
  if (available.length === 0) return "No CDN providers are registered.";
  return available.join("\n");
}

export default {
  name: "cdn provider list",
  description: "List all registered CDN providers",
  inputSchema,
  execute,
  help: `List all registered CDN providers.\n\n## Example\n\n/cdn provider list`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
