import { JoiStringDefaultOrStrip, JoiStripWhenNull } from "@/core/base-joi-helper.js";
import Joi from "joi";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
export class TenantSettingModel extends BaseTenantModelFunc() {
}
TenantSettingModel.init({
    schema: {
        logoImage: JoiStringDefaultOrStrip({ trim: true }),
        nameImage: JoiStringDefaultOrStrip({ trim: true }),
        canSendStaffDailyBirthdayMessage: [Joi.boolean().default(false), Joi.any().strip()],
        staffDailyBirthdayMessageTemplateId: JoiStringDefaultOrStrip({ trim: true }),
        dataEditLockPeriodInMunite: [Joi.number().integer(), Joi.any().strip()],
        emailSmtpOption: [
            JoiStripWhenNull(),
            Joi.object({
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
//# sourceMappingURL=tenant-setting-model.js.map