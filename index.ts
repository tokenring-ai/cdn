import {TokenRingPackage} from "@tokenring-ai/agent";
import packageJSON from './package.json' with {type: 'json'};


export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description
};


export {default as CDNService} from "./CDNService.ts";
export {default as CDNResource} from "./CDNResource.ts";