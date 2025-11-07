import { ICoreEntityBaseModel } from "@/core/base-types.js";

export const AuthTokenCategoryEnum = {
  CONFIRM_EMAIL: "CONFIRM_EMAIL",
  RESET_PASSWORD: "RESET_PASSWORD",
  SESSION_SWITCH_HOLDER: "SESSION_SWITCH_HOLDER",
} as const;

export type AuthTokenCategoryEnum = (typeof AuthTokenCategoryEnum)[keyof typeof AuthTokenCategoryEnum];

export interface IAuthToken extends ICoreEntityBaseModel {
  targetId: string;
  code: string;
  expireInMunites: number;
  category: AuthTokenCategoryEnum;
}
