import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import type apigatewayv2Type from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Duration, Size } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import { IDomainMapOptions, IEnvConfigExtra } from "#cdk/types/index.js";

interface IAppProps {
  stage: string;
  domainMapOption: IDomainMapOptions;
  stackName: string;
  moduleLayers: lambda.ILayerVersion[];
  extensionLayer: lambda.ILayerVersion;
  environment: IEnvConfigExtra;
  lambdaRole: iam.Role;
  environmentalVariableKeys: IEnvConfigExtra;
  apigatewayLogGroup: LogGroup;
  apiDomainMappingKey: string;
}

export class AppApi extends Construct {
  readonly mainHandler: lambda.Function;

  readonly apiMapping: apigatewayv2.ApiMapping;
  readonly httpApi: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: IAppProps) {
    super(scope, id);

    const {
      stage,
      domainMapOption,
      environment,
      lambdaRole,
      moduleLayers,
      extensionLayer,
      stackName,
      apigatewayLogGroup,
      apiDomainMappingKey,
    } = props;

    this.mainHandler = new lambda.Function(this, `mainHandler-${stage}`, {
      functionName: `${stackName}-mainHandler`,
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/serverHandler"),
      handler: "index.mainHandler",
      layers: [...moduleLayers, extensionLayer],
      role: lambdaRole,
      environment: { ...environment },
      ephemeralStorageSize: Size.mebibytes(512 * 2),
      timeout: Duration.seconds(15),
      memorySize: Size.gibibytes(2).toMebibytes(),
    });

    this.httpApi = new apigatewayv2.HttpApi(this, `httpApi-${stage}`, {
      apiName: `${stackName}-httpApi`,
      corsPreflight: {
        allowOrigins: ["*"],
        allowHeaders: [
          "Content-Type",
          "Accept",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowCredentials: false,
        maxAge: Duration.minutes(30),
      },
      disableExecuteApiEndpoint: false,
    });

    if (this.httpApi?.defaultStage?.node?.defaultChild) {
      (this.httpApi.defaultStage.node.defaultChild as apigatewayv2Type.CfnStage).accessLogSettings = {
        destinationArn: apigatewayLogGroup.logGroupArn,
        format: JSON.stringify({
          userAgent: "$context.identity.userAgent",
          sourceIp: "$context.identity.sourceIp",
          path: "$context.path",
          requestId: "$context.requestId",
          requestTime: "$context.requestTime",
          httpMethod: "$context.httpMethod",
          routeKey: "$context.routeKey",
          status: "$context.status",
          protocol: "$context.protocol",
          responseLength: "$context.responseLength",
          integrationErrorMessage: "$context.integrationErrorMessage",
        }),
      };
      apigatewayLogGroup.grantWrite(new iam.ServicePrincipal("apigateway.amazonaws.com"));
    }

    this.httpApi.addRoutes({
      path: "/main/{proxy+}",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: new HttpLambdaIntegration(`lambdaApiMainIntegration-${stage}`, this.mainHandler),
    });

    const domainNameOption = apigatewayv2.DomainName.fromDomainNameAttributes(this, `httpApiDomainName01-${stage}`, {
      ...domainMapOption,
    });

    this.apiMapping = new apigatewayv2.ApiMapping(this, `apiMapping-${stage}`, {
      domainName: domainNameOption,
      api: this.httpApi,
      apiMappingKey: apiDomainMappingKey,
    });
  }
}
