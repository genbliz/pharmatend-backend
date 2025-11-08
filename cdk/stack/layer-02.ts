import { DefinedResourceIdentifiers } from "#cdk/helpers/resources.js";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface IStackProps extends StackProps {
  stackName: string;
}

export class AppLayer02Stack extends Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, `${props.stackName}-Layer`, {
      code: lambda.Code.fromAsset("modules-layer/layer02"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      layerVersionName: `${props.stackName}-LY`,
    });

    new CfnOutput(this, `${props.stackName}-Output`, {
      value: layer.layerVersionArn,
      exportName: DefinedResourceIdentifiers.MODULES_LAYER_02,
    });
  }
}
