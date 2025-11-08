import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";
import { Role } from "aws-cdk-lib/aws-iam";
import { Duration, Size } from "aws-cdk-lib";
import { IEnvConfigExtra, IDomainMapOptions } from "#cdk/types/index.js";

interface IAppWebsocketProps {
  stackName: string;
  stage: string;
  moduleLayer_01: lambda.ILayerVersion;
  moduleLayer_02: lambda.ILayerVersion;
  environment: IEnvConfigExtra;
  lambdaRole: Role;
  webSocketDomainMapOption: IDomainMapOptions;
  webSocketDomainMappingKey: string;
}

export class AppWebsocket extends Construct {
  messageHandler: lambda.Function;
  apigatewayWebSocket: apigatewayv2.WebSocketStage;

  constructor(scope: Construct, id: string, props: IAppWebsocketProps) {
    super(scope, id);

    const {
      //
      stackName,
      stage,
      moduleLayer_01,
      moduleLayer_02,
      environment,
      lambdaRole,
      webSocketDomainMapOption,
      webSocketDomainMappingKey,
    } = props;

    const environment01 = { ...environment };

    const connectHandler = new lambda.Function(this, `connectHandler01-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/connectHandler"),
      handler: "index.run",
      functionName: `${stackName}-connectHandler`,
      layers: [moduleLayer_01, moduleLayer_02],
      role: lambdaRole,
      environment: { ...environment01 },
      timeout: Duration.seconds(6),
      memorySize: Size.mebibytes(1024).toMebibytes(),
    });

    const disconnectHandler = new lambda.Function(this, `disconnectHandler01-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/disconnectHandler"),
      handler: "index.run",
      functionName: `${stackName}-disconnectHandler`,
      layers: [moduleLayer_01, moduleLayer_02],
      role: lambdaRole,
      environment: { ...environment01 },
      timeout: Duration.seconds(5),
      memorySize: Size.mebibytes(1024).toMebibytes(),
    });

    const messageDefaultHandler = new lambda.Function(this, `messageDefaultHandler01-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/messageHandler"),
      handler: "index.run",
      functionName: `${stackName}-messageDefaultHandler`,
      layers: [moduleLayer_01, moduleLayer_02],
      role: lambdaRole,
      environment: { ...environment01 },
      timeout: Duration.seconds(6),
      memorySize: Size.mebibytes(1024).toMebibytes(),
    });

    this.messageHandler = new lambda.Function(this, `messageHandler01-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/messageHandler"),
      handler: "index.runMsg",
      functionName: `${stackName}-messageHandler`,
      layers: [moduleLayer_01, moduleLayer_02],
      role: lambdaRole,
      environment: { ...environment01 },
      timeout: Duration.seconds(6),
      memorySize: Size.mebibytes(1024).toMebibytes(),
    });

    const webSocketApi = new apigatewayv2.WebSocketApi(this, `webSocket01-${stage}`, {
      apiName: `${stackName}-webSocket`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(`websocketConnectIntegration-${stage}`, connectHandler),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(`websocketdisconnectIntegration-${stage}`, disconnectHandler),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(`websocketDefaultIntegration-${stage}`, messageDefaultHandler),
      },
      routeSelectionExpression: "$request.body.action",
    });

    webSocketApi.addRoute("sendChatMessage", {
      integration: new WebSocketLambdaIntegration(`websocketsendChatMessageIntegration-${stage}`, this.messageHandler),
    });

    const domainName = apigatewayv2.DomainName.fromDomainNameAttributes(this, `websocketDomainName01-${stage}`, {
      ...webSocketDomainMapOption,
    });

    this.apigatewayWebSocket = new apigatewayv2.WebSocketStage(this, `webSocketStage-${stage}`, {
      webSocketApi,
      stageName: stage,
      autoDeploy: true,
      domainMapping: {
        domainName,
        mappingKey: webSocketDomainMappingKey,
      },
    });
  }
}
