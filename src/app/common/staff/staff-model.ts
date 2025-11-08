import Joi from "joi";
import { ValString, ValStringCustomId, ValStripWhenNull, ValPhoneNumber } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IStaff } from "@/common/staff/staff-types.js";

export class StaffModel extends BaseTenantModelFunc<IStaff>() {}

StaffModel.init({
  schema: {
    firstName: ValString({ isRequired: true, lowercase: true, trim: true }),
    lastName: ValString({ isRequired: true, lowercase: true, trim: true }),
    email: ValString({ isEmail: true, lowercase: true, trim: true }),
    phone: ValPhoneNumber({ isRequired: true }),
    //
    address: ValString({ lowercase: true, trim: true }),
    department: ValString(),
    managerId: [ValStripWhenNull(), ValStringCustomId()],
    position: ValString(),
    joinDate: ValString(),
    roleIds: [ValStripWhenNull(), Joi.array().items(Joi.string())],
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
