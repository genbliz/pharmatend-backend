import { ICoreEntityTargetModel } from "@/core/base-types";

export const UserLoginStatusEnum = {
  FAILED: "FAILED",
  SUCCEEDED: "SUCCEEDED",
  LOCKED_OUT: "LOCKED_OUT",
  INVALID_LICENSE: "INVALID_LICENSE",
} as const;

export type UserLoginStatusEnum = (typeof UserLoginStatusEnum)[keyof typeof UserLoginStatusEnum];

export interface IUserLogin extends ICoreEntityTargetModel {
  userId: string;
  status: UserLoginStatusEnum;
  remark?: string;
}
