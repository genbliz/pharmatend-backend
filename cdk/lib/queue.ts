import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { Duration, Size } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import { IEnvConfigExtra } from "#cdk/types/index.js";

interface IAppQueueProps {
  stackName: string;
  stage: string;
  moduleLayers: lambda.ILayerVersion[];
  environment: IEnvConfigExtra;
  lambdaRole: Role;
}

export class AppQueue extends Construct {
  readonly queueReceiverHandler01: lambda.Function;
  readonly messageReceiverQueque: sqs.Queue;

  constructor(scope: Construct, id: string, props: IAppQueueProps) {
    super(scope, id);

    const { stackName, stage, moduleLayers, environment, lambdaRole } = props;

    const lambdaTimeoutInMinute = 5;
    const lambdaTimeout = Duration.minutes(lambdaTimeoutInMinute);
    const queueVisibilityTimeout = Duration.minutes(lambdaTimeoutInMinute * 6);

    const messageReceiverDLQ = new sqs.Queue(this, `queueReceiverDLQ-${stage}`, {
      queueName: `${stackName}-queueReceiverDLQ.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
      retentionPeriod: Duration.days(4),
      visibilityTimeout: queueVisibilityTimeout,
    });

    this.messageReceiverQueque = new sqs.Queue(this, `queueReceiver-${stage}`, {
      queueName: `${stackName}-queueReceiver.fifo`,
      deadLetterQueue: messageReceiverDLQ.deadLetterQueue,
      fifo: true,
      contentBasedDeduplication: true,
      retentionPeriod: Duration.days(2),
      visibilityTimeout: queueVisibilityTimeout,
    });

    this.queueReceiverHandler01 = new lambda.Function(this, `queueReceiverFunc01-${stage}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      functionName: `${stackName}-queueReceiver01`,
      code: lambda.Code.fromAsset("dist-func/queueHandler"),
      handler: "index.receiver01",
      layers: moduleLayers,
      role: lambdaRole,
      environment: { ...environment },
      timeout: lambdaTimeout,
      memorySize: Size.gibibytes(2).toMebibytes(),
    });

    new lambda.EventSourceMapping(this, `queueReceiverFunc01EventSourceMapping-${stage}`, {
      target: this.queueReceiverHandler01,
      batchSize: 10,
      maxBatchingWindow: Duration.seconds(0),
      eventSourceArn: this.messageReceiverQueque.queueArn,
    });
  }
}
