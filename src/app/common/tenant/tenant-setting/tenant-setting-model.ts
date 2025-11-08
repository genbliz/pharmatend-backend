import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { ITenantSetting } from "@/common/tenant/tenant-setting/tenant-setting-types.js";

export class TenantSettingModel extends BaseTenantModelFunc<ITenantSetting>() {}

TenantSettingModel.init({
  schema: {
    logoImage: v.ValString({ trim: true }),
    nameImage: v.ValString({ trim: true }),
    canSendStaffDailyBirthdayMessage: [
      //
      v.ValBoolean({ defaultVal: false }),
      v.ValStripAnyField(),
    ],
    staffDailyBirthdayMessageTemplateId: v.ValString({ trim: true }),
    dataEditLockPeriodInMunite: v.ValNumber({ isInteger: true }),
    emailSmtpOption: [
      v.ValStripWhenNull(),
      v.ValObject<ITenantSetting["emailSmtpOption"]>({
        port: v.ValNumber({ isInteger: true }),
        server: v.ValString({ isRequired: true }),
        userName: v.ValString({ trim: true, isRequired: true }),
        password: v.ValString({ isRequired: true }),
        senderEmail: v.ValString({ isEmail: true, isRequired: true }),
        authenticationMethod: v.ValString({ trim: true, isRequired: true }),
      }),
    ],
  },
  tableName: "tenant_settings",
  returnFields: "basic",
});
