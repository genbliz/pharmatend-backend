import "source-map-support/register.js";
import { LoggingService } from "@/services/logging-service.js";
import { LambdaHelperService } from "#func/lambda-helper.js";
import { getAWSCredentialCollection } from "@/config/env.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
const credential = getAWSCredentialCollection();
const lambda = new LambdaClient({ ...credential });
async function myWarmUpFunc(warmUpFunctions) {
    const functionsModel = {
        name: "",
        payload: JSON.stringify({ source: "serverless-my-app-warmup" }),
        concurrency: 1,
    };
    LoggingService.anyInfo({ warmUpFunctions });
    if (!warmUpFunctions?.length) {
        LoggingService.log(`Warm Up Functions NOT found or defined`);
        return;
    }
    const functionsData = warmUpFunctions.map((funcName) => ({ ...functionsModel, name: funcName }));
    const invokes = await Promise.all(functionsData.map(async (funcData) => {
        LoggingService.log(`Warming up function: ${funcData.name} with concurrency: ${funcData.concurrency}`);
        const params = {
            ClientContext: Buffer.from(JSON.stringify({ custom: funcData.payload })).toString("base64"),
            FunctionName: funcData.name,
            InvocationType: "RequestResponse",
            LogType: "None",
            Qualifier: process.env.SERVERLESS_ALIAS || "$LATEST",
            Payload: Buffer.from(funcData.payload),
        };
        try {
            await Promise.all(Array(funcData.concurrency)
                .fill(0)
                .map(async () => await lambda.send(new InvokeCommand(params))));
            LoggingService.log(`Warm Up Invoke Success: ${funcData.name}`);
            return true;
        }
        catch (e) {
            LoggingService.log(`Warm Up Invoke Error: ${funcData.name}`, e);
            return false;
        }
    }));
    LoggingService.log(`Warm Up Finished with ${invokes.filter((r) => !r).length} invoke errors`);
}
const runWarmUpFunc = async (event, context) => {
    const time = new Date().toISOString();
    LoggingService.log(`WarmUp Handler: "${context.functionName}"; ran @ ${time}`);
    LoggingService.log(JSON.stringify(event));
    if (event?.jobsToRun?.length) {
        if (event.jobsToRun.includes("WARM_UP_FUNCTION_JOB")) {
            LoggingService.log(`Running Job: WARM_UP_FUNCTION_JOB`);
            await myWarmUpFunc(event.warmUpFunctions).catch((e) => console.log(e));
        }
    }
    return LambdaHelperService.successfullResponse();
};
export const runWarmUp = runWarmUpFunc;
//# sourceMappingURL=warmUpHandler.js.map