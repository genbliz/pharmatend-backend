import Joi from "joi";
import {
  JoiStringDefaultOrStrip,
  JoiStringCustomId,
  JoiStripWhenNull,
  JoiStringPhoneNumber,
} from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IStaff } from "@/common/staff/staff-types.js";

export class StaffModel extends BaseTenantModelFunc<IStaff>() {}

StaffModel.init({
  schema: {
    firstName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    lastName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    email: JoiStringDefaultOrStrip({ isEmail: true, lowercase: true, trim: true }),
    phone: JoiStringPhoneNumber({ isRequired: true }),
    //
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
    { source: "email", dest: "sk01" },
    { source: "phone", dest: "sk02" },
    { source: "department", dest: "sk03" },
    { source: "managerId", dest: "targetId" },
  ],
});
