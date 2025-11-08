import { HttpService } from "@/services/http-service.js";
import { ConfigService } from "@/config/config-service.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { envConfig } from "@/config/env.js";
import { ISuperAdminRemoteLoginResult } from "@/account/admin/admin-types.js";
import { IRemoteParams, IRemoteResult } from "@/remote/remote-type.js";
import { CommonConfig } from "@/config/config-common.js";
import { CreateFriendlyError } from "@/helper/response-model.js";
import { ResponseMessage } from "@/helper/response-message.js";

class RemoteParentHttpServiceBase {
  private getApplicationHeaders(sessionUser?: ISessionUser) {
    const headers01: string[][] = [];
    //
    const headersKeys = ConfigService.RemoteServerHeaderKeys;
    const currUserAuthToken = this.getToken();
    //
    if (headersKeys && currUserAuthToken && sessionUser?.userId) {
      headers01.push([headersKeys.authorization, `Bearer ${currUserAuthToken}`]);
    }
    return headers01 && headers01.length ? headers01 : undefined;
  }

  private getToken() {
    return "";
  }

  async adminUserRemoteLogin({
    email,
    password,
    shortCode,
    sessionUser,
  }: {
    email: string;
    password: string;
    shortCode: number;
    sessionUser?: ISessionUser;
  }): Promise<ISuperAdminRemoteLoginResult | null> {
    //
    if (!(password && email && shortCode)) {
      return await Promise.reject(ResponseMessage.requiredParameterUndefined);
    }
    const url = CommonConfig.PARENT_SERVER_LOGIN_URL;

    if (!url) {
      throw CreateFriendlyError("Invalid url... Server NOT configured.");
    }

    const data = {
      email,
      password,
      shortCode,
    };

    if (envConfig.NODE_ENV === "development") {
      // TODO remove
      // This is just to avoid connection to internet
      // return statisTenant;
    }

    try {
      const headers = this.getApplicationHeaders(sessionUser);
      const params: IRemoteParams = { accessKey: "" };
      const loginResult = await HttpService.post<IRemoteResult<ISuperAdminRemoteLoginResult>>({
        url,
        data,
        params,
        headers,
      });
      return loginResult?.data ? loginResult.data : null;
    } catch (error) {
      const msg = this.tryGetDecodeParentError(error);
      if (msg) {
        throw CreateFriendlyError(msg);
      }
      throw error;
    }
  }

  private tryGetDecodeParentError(error?: any) {
    type IResError = {
      success: boolean;
      message: string | null;
      data: any;
      isHospimanAdmin: boolean;
      debug: any;
    };
    if (error) {
      const err: IResError = error;
      if (err?.isHospimanAdmin && err?.message) {
        return err.message;
      }
    }
    return null;
  }
}

export const RemoteParentService = new RemoteParentHttpServiceBase();
