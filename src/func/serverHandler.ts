import "source-map-support/register.js";
import * as serverlessExpress from "@codegenie/serverless-express";
import type { Context, APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from "aws-lambda";
import { envConfig } from "@/config/env.js";
import app from "@/index.js";
import { LoggingService } from "@/services/logging-service.js";
import { FileOperationService } from "@/services/file-operation-service.js";

const canDoLog = envConfig.NODE_ENV === "staging";
let serverlessExpressInstance: any;

function doLog(event: APIGatewayProxyEventV2, context: Context) {
  if (canDoLog) {
    LoggingService.log({
      event,
      context: {
        remainingTimeInMillis: context.getRemainingTimeInMillis(),
        functionName: context.functionName,
        awsRequestId: context.awsRequestId,
        logGroupName: context.logGroupName,
        logStreamName: context.logStreamName,
        clientContext: context.clientContext,
        memoryLimitInMB: context.memoryLimitInMB,
        invokedFunctionArn: context.invokedFunctionArn,
        callbackWaitsForEmptyEventLoop: context.callbackWaitsForEmptyEventLoop,
      },
    });
  }
}

function asyncTask() {
  return new Promise((resolve) => setTimeout(() => resolve("connected to database"), 1));
}

async function setup(event, context) {
  await asyncTask();
  const binaryMimeTypes = FileOperationService.getSupportedMimeTypes();

  const configure = serverlessExpress?.configure || serverlessExpress?.default?.configure;

  serverlessExpressInstance = configure({ app, binaryMimeTypes });
  return serverlessExpressInstance(event, context);
}

const runServerBase: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (event && (event as any).source === "serverless-my-app-warmup") {
    LoggingService.log("@runServerBase WarmUp - Lambda is warm!");
    return "Lambda is warm!";
  }

  doLog(event, context);

  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }
  return setup(event, context);
};

export const mainHandler = runServerBase;
