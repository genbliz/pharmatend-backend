import Joi from "joi";
import { JoiStringDefaultOrStrip, JoiStringCustomId, JoiStripWhenNull, JoiStringPhoneNumber, } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
export class StaffModel extends BaseTenantModelFunc() {
}
StaffModel.init({
    schema: {
        firstName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
        lastName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
        email: JoiStringDefaultOrStrip({ isEmail: true, lowercase: true, trim: true }),
        phone: JoiStringPhoneNumber({ isRequired: true }),
        address: JoiStringDefaultOrStrip({ lowercase: true, trim: true }),
        department: JoiStringDefaultOrStrip(),
        managerId: [JoiStripWhenNull(), JoiStringCustomId()],
        position: JoiStringDefaultOrStrip(),
        joinDate: JoiStringDefaultOrStrip(),
        roleIds: [JoiStripWhenNull(), Joi.array().items(Joi.string())],
    },
    tableName: "staffs",
    returnFields: "basic",
    fieldAliases: [
        ["email", "sk01"],
        ["phone", "sk02"],
        ["department", "sk03"],
        ["managerId", "targetId"],
    ],
});
//# sourceMappingURL=staff-model.js.map