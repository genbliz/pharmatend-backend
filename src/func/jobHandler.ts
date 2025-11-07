import "source-map-support/register.js";
import { LoggingService } from "@/services/logging-service.js";
import { JobsForSystemService } from "@/jobs/job-for-system-service.js";
import { LambdaHelperService } from "#func/lambda-helper.js";
import type { Context } from "aws-lambda";
import type { IJobNameParams } from "@/jobs/job-types.js";

const runJobFunc = async (event: { jobsToRun?: IJobNameParams[] }, context: Context) => {
  const time = new Date().toISOString();
  LoggingService.log(`Cron function jobHandler: "${context.functionName}"; ran @ ${time}`);
  LoggingService.log(JSON.stringify(event));
  if (event?.jobsToRun?.length) {
    if (event.jobsToRun.includes("APPOINTMENT_REMINDER_SMS_TO_USER_AND_PATIENT_JOB")) {
      LoggingService.log(`Running Job: APPOINTMENT_REMINDER_SMS_TO_USER_AND_PATIENT_JOB`);
      await JobsForSystemService.sendAppointmentReminderSmsToUserAndPatient().catch((e) => console.log(e));
    }

    if (event.jobsToRun.includes("BIRTHDAY_SMS_TO_PATIENT_JOB")) {
      LoggingService.log(`Running Job: BIRTHDAY_SMS_TO_PATIENT_JOB`);
      await JobsForSystemService.sendPatientBirthdaySmsToday().catch((e) => console.log(e));
    }

    if (event.jobsToRun.includes("NEXT_DAY_SMS_TO_FIRST_TIMER_PATIENT_JOB")) {
      LoggingService.log(`Running Job: NEXT_DAY_SMS_TO_FIRST_TIMER_PATIENT_JOB`);
      await JobsForSystemService.sendNextDaySmsToFirstTimerPatient().catch((e) => console.log(e));
    }

    if (event.jobsToRun.includes("NEXT_DAY_SMS_TO_PATIENT_AFTER_VISIT_JOB")) {
      LoggingService.log(`Running Job: NEXT_DAY_SMS_TO_PATIENT_AFTER_VISIT_JOB`);
      await JobsForSystemService.sendNextDaySmsToPatientAfterVisit().catch((e) => console.log(e));
    }
  }
  return LambdaHelperService.successfullResponse();
};

export const runJob = runJobFunc;
