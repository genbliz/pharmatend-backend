#!/usr/bin/env node
import { AppLayer02Stack } from "#cdk/stack/layer-02.js";
import * as cdk from "aws-cdk-lib";
import { DefaultStackSynthesizer } from "aws-cdk-lib";

// change here
const deployVersion = `d01`;

// Don't change here
const stackName = `tendpos-backend-v2-moduleLayer-02-${deployVersion}`;

const app = new cdk.App();

new AppLayer02Stack(app, stackName, {
  env: { region: "us-east-1" },
  stackName,
  description: stackName,
  terminationProtection: false,
  synthesizer: new DefaultStackSynthesizer({
    bucketPrefix: `${stackName}/`,
  }),
});
