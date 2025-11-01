import jwt from "jsonwebtoken";
import { ISystemPreference } from "@/services/system-service";
import { ITenantSetting } from "@/common/tenant/tenant-setting/tenant-setting-types";
import { ITenant } from "../admin/admin-types";
import { IUser } from "../user/user-types";

export interface ISessionUser {
  isAdmin?: boolean;
  tenantId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  userClaims?: string[] | null;
  dataEditLockPeriodInMunite?: number | null;
  allowedSchedules?: string[] | null;
}

export interface IAuthUserInfo extends Pick<jwt.JwtPayload, "iss" | "sub" | "exp"> {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  tenantId: string;
  isAdmin: boolean;
  //
  email?: string;
  phone?: string;
  address?: string;
  createdAtDate?: string | Date;
  dataEditLockPeriodInMunite?: number | null;
}

export interface IAuthUserResult extends IAuthUserInfo {
  claims?: string[] | null;
  allowedSchedules?: string[] | null;
}

export interface IUserChangeMyPasswordDto {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IAuthLoginDto {
  password: string;
  shortCode: number;
  userName: string;
  isAdmin: boolean;
}

export interface IAuthLoginBaseDto {
  user: IUser;
  tenantData: ITenant;
  password: string;
}

export interface IAuthLoginResult {
  user: IAuthUserResult;
  token: string;
  tenant: ITenant;
  setting: ITenantSetting | null;
  expireAt: string;
  systemPreference: ISystemPreference;
}
