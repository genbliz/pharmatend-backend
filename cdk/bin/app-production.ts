#!/usr/bin/env node
import { loadEnvironmentalVariable } from "#cdk/helpers/env-loader.js";
import { loadCheckDomain } from "#cdk/helpers/load-check-domain.js";
import { AppDeploymentStack } from "#cdk/stack/app-stack.js";
import * as cdk from "aws-cdk-lib";
import { DefaultStackSynthesizer } from "aws-cdk-lib";

async function starter() {
  const app = new cdk.App();

  const stackName = "tendpos-backend-v2-production";

  const { parsedEnv, environmentalVariableKeys } = await loadEnvironmentalVariable("production");

  const domainMapOption = await loadCheckDomain({
    domainName: parsedEnv.APP_DOMAIN_BASE_NAME,
    region: parsedEnv.APP_AWS_REGION,
  });

  if (!domainMapOption) {
    throw new Error("apigateway domain (production) not found. You MUST create it manually");
  }

  const webSocketDomainMapOption = await loadCheckDomain({
    domainName: parsedEnv.APP_DOMAIN_BASE_NAME_WEBSOCKET,
    region: parsedEnv.APP_AWS_REGION,
  });

  if (!webSocketDomainMapOption) {
    throw new Error("apigateway websocket domain (production) not found. You MUST create it manually");
  }

  new AppDeploymentStack(app, stackName, {
    env: {
      region: parsedEnv.APP_AWS_REGION,
    },
    stackName,
    description: stackName,
    parsedEnv,
    environmentalVariableKeys,
    domainMapOption,
    webSocketDomainMapOption,
    apiDomainMappingKey: "tendpos",
    webSocketDomainMappingKey: "tendpos-websocket",
    terminationProtection: false,
    synthesizer: new DefaultStackSynthesizer({
      bucketPrefix: `${stackName}/`,
    }),
  });
}

starter().catch((e) => console.error(e));
