#!/usr/bin/env node
import { AppExtensionStack } from "#cdk/stack/extension.js";
import * as cdk from "aws-cdk-lib";
import { DefaultStackSynthesizer } from "aws-cdk-lib";

const stackName = "tendpos-backend-v2-extensionLayer";

const app = new cdk.App();

new AppExtensionStack(app, stackName, {
  env: { region: "us-east-1" },
  stackName,
  description: stackName,
  terminationProtection: false,
  synthesizer: new DefaultStackSynthesizer({
    bucketPrefix: `${stackName}/`,
  }),
});
