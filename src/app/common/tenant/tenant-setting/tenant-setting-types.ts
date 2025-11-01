import { ICoreEntityTenantModel } from "@/core/base-types";

export interface ITenantSetting extends ICoreEntityTenantModel {
  logoImage?: string;
  nameImage?: string;
  //
  canSendStaffDailyBirthdayMessage?: boolean;
  staffDailyBirthdayMessageTemplateId?: string;
  //
  dataEditLockPeriodInMunite?: number;
  emailSmtpOption?: {
    server: string;
    port: number;
    userName: string;
    senderEmail: string;
    password: string;
    authenticationMethod?: string;
  };
}
