import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Duration, Size } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import { IEnvConfigExtra } from "#cdk/types/index.js";

interface IAppCronProps {
  stackName: string;
  stage: string;
  moduleLayers: lambda.ILayerVersion[];
  environment: IEnvConfigExtra;
  lambdaRole: Role;
  warmUpFunctions: string[];
}

// https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html

export class AppCronJobs extends Construct {
  readonly jobHandler: lambda.Function;
  readonly warmUpHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: IAppCronProps) {
    super(scope, id);

    const { stackName, stage, moduleLayers, environment, lambdaRole, warmUpFunctions } = props;

    this.warmUpHandler = new lambda.Function(this, `warmUpHandler-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/warmUpHandler"),
      handler: "index.runWarmUp",
      functionName: `${stackName}-warmUpHandler`,
      layers: moduleLayers,
      role: lambdaRole,
      environment: { ...environment },
      timeout: Duration.seconds(6),
      memorySize: Size.mebibytes(128).toMebibytes(),
    });

    this.jobHandler = new lambda.Function(this, `jobHandler-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset("dist-func/jobHandler"),
      handler: "index.runJob",
      functionName: `${stackName}-jobHandler`,
      layers: moduleLayers,
      role: lambdaRole,
      environment: { ...environment },
      timeout: Duration.minutes(10),
      memorySize: Size.mebibytes(1024 + 128).toMebibytes(),
    });

    new events.Rule(this, `warmUpSchedule-${stage}`, {
      schedule: events.Schedule.expression("cron(1,12,24,36,48 5-20 * * ? *)"),
      targets: [
        new targets.LambdaFunction(this.warmUpHandler, {
          event: events.RuleTargetInput.fromObject({ jobsToRun: ["WARM_UP_FUNCTION_JOB"], warmUpFunctions }),
        }),
      ],
    });

    new events.Rule(this, `birtdaySmsToPatients-${stage}`, {
      schedule: events.Schedule.expression("cron(10 3 * * ? *)"),
      targets: [
        new targets.LambdaFunction(this.jobHandler, {
          event: events.RuleTargetInput.fromObject({ jobsToRun: ["BIRTHDAY_SMS_TO_PATIENT_JOB"] }),
        }),
      ],
    });
  }
}
