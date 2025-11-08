import { DefinedResourceIdentifiers } from "#cdk/helpers/resources.js";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class AppExtensionStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, `appExtension01`, {
      code: lambda.Code.fromAsset("extension/layer01"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      layerVersionName: `${props.stackName}-01`,
    });

    new CfnOutput(this, `appExtensionOutput01`, {
      value: layer.layerVersionArn,
      exportName: DefinedResourceIdentifiers.EXTENSION_LAYER,
    });
  }
}
