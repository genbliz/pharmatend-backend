import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { IAuthToken } from "./auth-token-types.js";
import { BaseCoreModelFunc } from "@/core/base-schema-model.js";

export class AuthTokenModel extends BaseCoreModelFunc<IAuthToken>() {}

AuthTokenModel.init({
  schema: {
    code: JoiStringDefaultOrStrip({ isRequired: true }),
    category: JoiStringDefaultOrStrip({ isRequired: true }),
    expireInMunites: Joi.number().required().min(1),
  },
  tableName: "auth_tokens",
  returnFields: "basic",
});
