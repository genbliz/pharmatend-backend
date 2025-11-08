import { ValString, ValStripWhenNull } from "@/core/base-joi-helper.js";
import Joi from "joi";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { ITenantSetting } from "@/common/tenant/tenant-setting/tenant-setting-types.js";

export class TenantSettingModel extends BaseTenantModelFunc<ITenantSetting>() {}

TenantSettingModel.init({
  schema: {
    logoImage: ValString({ trim: true }),
    nameImage: ValString({ trim: true }),
    canSendStaffDailyBirthdayMessage: [Joi.boolean().default(false), Joi.any().strip()],
    staffDailyBirthdayMessageTemplateId: ValString({ trim: true }),
    dataEditLockPeriodInMunite: [Joi.number().integer(), Joi.any().strip()],
    emailSmtpOption: [
      ValStripWhenNull(),
      Joi.object<ITenantSetting["emailSmtpOption"]>({
        server: Joi.string().trim().required(),
        port: Joi.number().integer().required(),
        userName: Joi.string().trim().required(),
        password: Joi.string().trim().required(),
        senderEmail: Joi.string().trim().required(),
        authenticationMethod: Joi.string().trim().required(),
      }),
    ],
  },
  tableName: "tenant_settings",
  returnFields: "basic",
});
