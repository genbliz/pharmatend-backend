import os from "os";
import { UtilService } from "@/services/util-service";
import { GenericFriendlyError } from "../../utils/errors";
import { LoggingService } from "@/services/logging-service";
import { HttpService } from "@/services/http-service";
import { ConfigService } from "../../config/config-service";
import { ISessionUser } from "../../account/auth/auth-types";
import { envConfig } from "@/config/env";
import { ISuperAdminRemoteLoginResult } from "@/account/admin/admin-types";
import { IRemoteParams, ISmsSenderToRemote, IRemoteResult, ISmsSendExchangeResult } from "../remote-type";
import { CommonConfig } from "../../config/config-common";
import { CreateFriendlyError } from "../../helper/response-model";
import { ResponseMessage } from "../../helper/response-message";

class RemoteParentHttpServiceBase {
  private getApplicationHeaders(sessionUser?: ISessionUser) {
    const headers01: string[][] = [];
    //
    const headersKeys = ConfigService.RemoteServerHeaderKeys;
    const currUserAuthToken = this.getToken();
    //
    if (headersKeys && currUserAuthToken && sessionUser?.userId) {
      headers01.push([headersKeys.tenantId, sessionUser.tenantId]);

      headers01.push([headersKeys.userId, sessionUser.userId]);

      headers01.push([headersKeys.authorization, `Bearer ${currUserAuthToken}`]);
    }
    return headers01 && headers01.length ? headers01 : undefined;
  }

  private getToken() {
    return "";
  }

  private getAccessKey() {
    return envConfig.HOSPIMAN_MANAGEMANT_ACCESS_KEY;
  }

  private getSmsSendUrl() {
    return CommonConfig.PARENT_SERVER_SMS_POST_URL;
  }

  private async postSms({ data, user }: { data: ISmsSenderToRemote[]; user?: ISessionUser }) {
    const url: string = this.getSmsSendUrl();
    if (!url) {
      throw GenericFriendlyError.createValidationError("Invalid Sms Send Url... Server NOT configured.");
    }

    const accessKey = this.getAccessKey();
    if (!accessKey) {
      throw GenericFriendlyError.createValidationError("SMS:Invalid accessKey... Server NOT configured.");
    }

    const params: IRemoteParams = { accessKey };
    if (user) {
      params.tenantId = user.tenantId;
      params.userId = user.userId;
    }

    try {
      const data01 = data.map((f) => {
        f.recipients = UtilService.removeDuplicatesInArray(f.recipients);
        return f;
      });

      const remoteSmsResult = await HttpService.post<IRemoteResult<ISmsSendExchangeResult[]>>({
        url,
        data: data01,
        params,
      });

      const resultValue: string[] = [];
      const endOfLine = os.EOL;

      if (!remoteSmsResult?.success) {
        if (remoteSmsResult.isHospimanAdmin && remoteSmsResult.message) {
          throw CreateFriendlyError(remoteSmsResult.message);
        }
        throw CreateFriendlyError("Unknown error occured");
      }

      if (remoteSmsResult?.data && remoteSmsResult.isHospimanAdmin) {
        const smsResult = [...remoteSmsResult.data];
        smsResult.forEach((result) => {
          const currentMsg: string[] = [];
          //
          const msgStatus = result.success ? "SENT" : "NOT SENT";
          currentMsg.push(`Status: ${msgStatus}`);

          if (result.success) {
            if (result?.smsMessage) {
              currentMsg.push(`Sent Sms: ${result.smsMessage.split(endOfLine).join(" ")}`);
            } else if (result.infoMessage) {
              currentMsg.push(`Info Message: ${result.infoMessage.split(endOfLine).join(" ")}`);
            }
          } else {
            if (result?.errorMessage) {
              currentMsg.push(`Error Message: ${result.errorMessage.split(endOfLine).join(" ")}`);
            }
          }

          resultValue.push(currentMsg.join(endOfLine), endOfLine);
        });
      }
      return resultValue.length ? resultValue.join(endOfLine) : null;
    } catch (error) {
      LoggingService.logConsoleNative({ postSms_ERROR: error });
      const msg = this.tryGetDecodeParentError(error);
      if (msg) {
        throw CreateFriendlyError(msg);
      }
      throw GenericFriendlyError.createInternalServerError("Unknow error occured from the parent server.");
    }
  }

  async sendSms({ data, user }: { data: ISmsSenderToRemote[]; user: ISessionUser }) {
    return await this.postSms({ data, user });
  }

  async sendSmsJobs({ data, user }: { data: ISmsSenderToRemote[]; user?: ISessionUser }) {
    return await this.postSms({ data, user });
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

    const accessKey = this.getAccessKey();

    if (!accessKey) {
      throw CreateFriendlyError("ADMIN_LOGIN:Invalid accessKey... Server NOT configured.");
    }

    const data = {
      email,
      password,
      shortCode,
    };

    if (envConfig.NODE_ENV === "development") {
      // TODO remove
      // This is just to avoid connection to internet
      const statisTenant: ISuperAdminRemoteLoginResult = require(`D:\\projects\\main-projects\\tend-pos-backend\\dumps\\tenent.json`);
      return statisTenant;
    }

    try {
      const headers = this.getApplicationHeaders(sessionUser);
      const params: IRemoteParams = { accessKey };
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

  async getUserChatToken({
    userName,
    firstName,
    lastName,
    tenantId,
    userId,
    tokenExpireAt,
    sessionUser,
  }: {
    firstName: string;
    userName: string;
    lastName: string;
    tenantId: string;
    userId: string;
    tokenExpireAt?: string | Date;
    sessionUser?: ISessionUser;
  }): Promise<string | null> {
    //
    const accessKey = this.getAccessKey();
    const url = CommonConfig.PARENT_SERVER_GET_CHAT_TOKEN;

    if (!url) {
      throw CreateFriendlyError("Invalid url... Server NOT configured.");
    }

    if (!accessKey) {
      throw CreateFriendlyError("USER_LOGIN:Invalid accessKey... Server NOT configured.");
    }

    const data = {
      userName,
      firstName,
      lastName,
      tenantId,
      userId,
      expireAt: tokenExpireAt ? new Date(tokenExpireAt).toISOString() : null,
    } as const;

    try {
      const headers = this.getApplicationHeaders(sessionUser);
      const params: IRemoteParams = { accessKey };
      const loginResult = await HttpService.post<IRemoteResult<string>>({
        url,
        headers,
        params,
        data,
      });
      return loginResult?.data ? loginResult.data : null;
    } catch (error) {
      if (error instanceof CreateFriendlyError) {
        throw error;
      } else {
        const msg = this.tryGetDecodeParentError(error);
        if (msg) {
          throw CreateFriendlyError(msg);
        }
        throw error;
      }
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
