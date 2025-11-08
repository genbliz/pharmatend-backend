import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IStaff } from "@/common/staff/staff-types.js";

export class StaffModel extends BaseTenantModelFunc<IStaff>() {}

StaffModel.init({
  schema: {
    firstName: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    lastName: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    email: v.ValString({ isEmail: true, lowercase: true, trim: true }),
    phone: v.ValPhoneNumber({ isRequired: true }),
    //
    address: v.ValString({ lowercase: true, trim: true }),
    department: v.ValString(),
    managerId: v.ValStringCustomId(),
    position: v.ValString(),
    joinDate: v.ValString(),
    roleIds: [v.ValStripWhenNull(), v.ValArrayItems(v.ValString())],
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
