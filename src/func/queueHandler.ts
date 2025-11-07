import "source-map-support/register.js";
import { DataSummaryJobService } from "@/common/data-summary/data-summary-job.js";
import type { IJobTask_DebtorOrCreditorGenerator } from "@/job-scheduler/job-scheduler-types.js";
import { SqsQueueJobService } from "@/job-scheduler/sqs-job-queue-scheduler.js";
import { LoggingService } from "@/services/logging-service.js";
import { UtilService } from "@/services/util-service.js";
import type { SQSHandler } from "aws-lambda";

type IJobTask = IJobTask_DebtorOrCreditorGenerator;

function decodeTaskType(body: string): IJobTask {
  const body01 = JSON.parse(body || JSON.stringify({}));
  return body01;
}

const receiverBase: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const payload = decodeTaskType(record.body);
      if (payload?.kind === "debtors") {
        await DataSummaryJobService.generateDebtorsReport({ ...payload });
      } else if (payload?.kind === "creditors") {
        await DataSummaryJobService.generateCreditorsReport({ ...payload });
      }
      await SqsQueueJobService.deleteQueReciever({ receiptHandle: record.receiptHandle });
      await UtilService.waitUntilMilliseconds(3000);
    }
    return await Promise.resolve();
  } catch (error) {
    LoggingService.anyError(error);
    return await Promise.resolve();
  }
};

export const receiver01 = receiverBase;
