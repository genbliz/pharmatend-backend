import type { IEnvConfig } from "@/config/env.js";

export type IEnvConfigExtra = Record<keyof IEnvConfig, string>;

export interface IDomainMapOptions {
  name: string;
  regionalHostedZoneId: string;
  regionalDomainName: string;
}
