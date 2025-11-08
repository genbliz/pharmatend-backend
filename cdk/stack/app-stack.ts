import { Stack, CfnOutput } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { RetentionDays, LogGroup } from "aws-cdk-lib/aws-logs";
import {
  //
  getExtensionLayer__Resource,
  getModuleLayer_01__Resource,
  getModuleLayer_02__Resource,
} from "#cdk/helpers/resources.js";
import { getAppCommonLambdaRole } from "#cdk/helpers/role.js";
import { Validator } from "#cdk/helpers/validator.js";
import { AppApi } from "#cdk/lib/api.js";
import { AppCronJobs } from "#cdk/lib/cron.js";
import { AppQueue } from "#cdk/lib/queue.js";
import { AppWebsocket } from "#cdk/lib/websocket.js";
import { StackProps } from "aws-cdk-lib";
import { IDomainMapOptions, IEnvConfigExtra } from "#cdk/types/index.js";

interface IRootStackProps extends StackProps {
  parsedEnv: IEnvConfigExtra;
  environmentalVariableKeys: IEnvConfigExtra;
  domainMapOption: IDomainMapOptions;
  webSocketDomainMapOption: IDomainMapOptions;
  webSocketDomainMappingKey: string;
  apiDomainMappingKey: string;
}

export class AppDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props: IRootStackProps) {
    const { parsedEnv, environmentalVariableKeys, domainMapOption, webSocketDomainMapOption, ...restProps } = props;
    super(scope, id, restProps);

    const webSocketDomainMappingKey = props.webSocketDomainMappingKey;
    const apiDomainMappingKey = props.apiDomainMappingKey;

    const { stage, stackName } = Validator.validateAndParseOptions({
      NODE_ENV: parsedEnv.NODE_ENV,
      stackName: this.stackName,
      stage: this.node.tryGetContext("stage"),
    });

    Validator.validateRequiredString({ APP_DOMAIN_BASE_NAME: parsedEnv.APP_DOMAIN_BASE_NAME });

    const environment = { ...parsedEnv };

    environment.APP_VAR_WEBSOCKET_DOMAIN_AND_PATH = [
      //
      environment.APP_DOMAIN_BASE_NAME_WEBSOCKET,
      webSocketDomainMappingKey,
    ].join("/");

    const moduleLayer01 = getModuleLayer_01__Resource();
    const moduleLayer02 = getModuleLayer_02__Resource();
    const extensionLayer01 = getExtensionLayer__Resource();

    environment.APP_VAR_AWS_ACCOUNT_ID = Stack.of(this).account;

    const lambdaRole = getAppCommonLambdaRole({ scope: this, stackName, stage });

    const moduleLayer_01 = lambda.LayerVersion.fromLayerVersionArn(this, `moduleLayer01-${stage}`, moduleLayer01);

    const moduleLayer_02 = lambda.LayerVersion.fromLayerVersionArn(this, `moduleLayer02-${stage}`, moduleLayer02);

    const extensionLayer = lambda.LayerVersion.fromLayerVersionArn(this, `extensionLayer01-${stage}`, extensionLayer01);

    const apigatewayLogGroup = new LogGroup(this, `appApigatewayLogGroupLogs-${stage}`, {
      retention: RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY,
      logGroupName: `${stackName}-ApiGatewayLog`,
    });

    const appApi = new AppApi(this, `appApi-${stage}`, {
      stackName,
      stage,
      lambdaRole,
      environment,
      apiDomainMappingKey,
      moduleLayers: [moduleLayer_01, moduleLayer_02],
      extensionLayer,
      domainMapOption,
      environmentalVariableKeys,
      apigatewayLogGroup,
    });

    environment.APP_VAR_MAIN_HANDLER_FUNCTION_NAME = appApi.mainHandler.functionName;

    const appQueue = new AppQueue(this, `appQueue-${stage}`, {
      stackName,
      stage,
      lambdaRole,
      environment,
      moduleLayers: [moduleLayer_01, moduleLayer_02],
    });

    environment.APP_VAR_QUEUE_RECIEVER_NAME = appQueue.messageReceiverQueque.queueName;

    appApi.mainHandler.addEnvironment(
      environmentalVariableKeys.APP_VAR_QUEUE_RECIEVER_NAME,
      appQueue.messageReceiverQueque.queueName,
    );

    appQueue.queueReceiverHandler01.addEnvironment(
      environmentalVariableKeys.APP_VAR_QUEUE_RECIEVER_NAME,
      appQueue.messageReceiverQueque.queueName,
    );

    const appWebsocket = new AppWebsocket(this, `appWebsockets-${stage}`, {
      stackName,
      stage,
      lambdaRole,
      environment,
      moduleLayer_01,
      moduleLayer_02,
      webSocketDomainMapOption,
      webSocketDomainMappingKey,
    });

    new AppCronJobs(this, `appCronJobs-${stage}`, {
      stackName,
      stage,
      lambdaRole,
      environment,
      moduleLayers: [moduleLayer_01, moduleLayer_02],
      warmUpFunctions: [appApi.mainHandler.functionName],
    });

    new CfnOutput(this, `domainNameOutput-${stage}`, {
      value: `https://${appApi.apiMapping.domainName.name}/${appApi.apiMapping.mappingKey}`,
    });

    new CfnOutput(this, `domainNameOutputTest01-${stage}`, {
      value: `https://${appApi.httpApi.apiEndpoint}/${appApi.apiMapping.mappingKey}`,
    });

    new CfnOutput(this, `domainNameWebsocket-${stage}`, {
      value: `https://${appWebsocket.apigatewayWebSocket.url}`,
    });
  }
}
