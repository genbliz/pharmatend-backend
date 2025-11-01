import { GenderEnum, ICoreEntityTenantModel } from "@/core/base-types";

export interface IUser extends ICoreEntityTenantModel {
  firstName: string;
  lastName: string;
  middleName?: string;
  address?: string;
  email?: string;
  userName: string;
  isEmailConfirmed: boolean;
  isLockOutEnabled: boolean;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender: GenderEnum;
  //
  isPhoneConfirmed: boolean;
  lastChangedString: string;
  accessFailedCount: number;
  roleClaimIds?: string[];
  userKind?: UserKindsEnum[];
  enablePrivacy?: boolean;
  sanboxedUser?: boolean;
  staffIdentificationId?: string;
  //
  countryCallingCode?: string;
}

export interface IRegisterUser {
  firstName: string;
  lastName: string;
  middleName?: string;
  address?: string;
  email?: string;
  userName: string;
  password: string;
  phone: string;
  userKind?: UserKindsEnum[];
}

export const UserKindsEnum = {
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  CONSULTANT: "CONSULTANT",
  ACCOUNTANT: "ACCOUNTANT",
  ADMIN: "ADMIN",
  LAB_SCIENTIST: "LAB_SCIENTIST",
  PHARMACIST: "PHARMACIST",
  MIDWIFE: "MIDWIFE",
  OTHER: "OTHER",
} as const;

export type UserKindsEnum = (typeof UserKindsEnum)[keyof typeof UserKindsEnum];

export function getUserKindsArray() {
  return Object.values(UserKindsEnum);
}
