import Joi from "joi";
import { ValString } from "@/core/base-joi-helper.js";
import { IAuthToken } from "@/account/auth-token/auth-token-types.js";
import { BaseCoreModelFunc } from "@/core/base-schema-model.js";

export class AuthTokenModel extends BaseCoreModelFunc<IAuthToken>() {}

AuthTokenModel.init({
  schema: {
    code: ValString({ isRequired: true }),
    category: ValString({ isRequired: true }),
    expireInMunites: Joi.number().required().min(1),
  },
  tableName: "auth_tokens",
  returnFields: "basic",
});
