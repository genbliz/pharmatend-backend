import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export function getAppCommonLambdaRole({
  scope,
  stackName,
  stage,
}: {
  scope: Construct;
  stackName: string;
  stage: string;
}) {
  const lambdaPolicyDocument = new iam.PolicyDocument({
    statements: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sns:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sqs:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["bedrock:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["transcribe:*"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        resources: ["*"],
      }),

      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["execute-api:Invoke", "execute-api:ManageConnections"],
        resources: ["arn:aws:execute-api:*:*:**/@connections/*"],
      }),
    ],
  });

  const lambdaRole = new iam.Role(scope, `appLambdaFunctionRole-${stage}`, {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")],
    inlinePolicies: {
      appLambdaPolicyDocument: lambdaPolicyDocument,
    },
    roleName: `${stackName}-appLambdaRole`,
  });
  return lambdaRole;
}
