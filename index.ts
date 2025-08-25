import packageJSON from './package.json' with {type: 'json'};

export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export {default as CDNService} from "./CDNService.ts";
export * as tools from "./tools.ts";