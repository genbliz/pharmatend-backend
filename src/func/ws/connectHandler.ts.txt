import "source-map-support/register.js";
import { LoggingService } from "@/services/logging-service.js";
import { APIGatewayProxyHandler } from "aws-lambda";
import { failureResponse, successfullResponse } from "#func/ws/websocket-helper.js";
import { SocketConnectionRepository } from "@/common/socket-connection/socket-connection-repository.js";
import { ChatGroupRepository } from "@/common/chat/chat-group/chat-group-repository.js";
import { StatusCode } from "@/helpers/response-status-codes.js";
import { AuthSessionHelperService } from "@/account/auth/auth-session-helper-service.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { SocketConnectionCategoryEnum } from "@/common/socket-connection/socket-connection-types.js";
import { ConnectionHelperService } from "#func/ws/connection-helper-service.js";
import { AdminService } from "@/account/admin/admin-service.js";
import { createEnumFromObjectKeys } from "@/core/base-types.js";

export const SocketAuthKeys = createEnumFromObjectKeys({
  token: "",
  connection_kind: "",
  applicationId: "",
  platform: "",
  app_version: "",
});

async function registerNotificationClientsConnection({
  sessionUser,
  connectionId,
}: {
  sessionUser: ISessionUser;
  connectionId: string;
}) {
  if (!(sessionUser.userId && sessionUser.tenantId)) {
    return await Promise.reject("Invalid Params");
  }

  await SocketConnectionRepository.addNotificationConnection({
    connectionId,
    sessionUser,
  });
  return await Promise.resolve();
}

async function registerChatClientsConnection({ sessionUser, connectionId }: { sessionUser: ISessionUser; connectionId: string }) {
  let chatGroupIds: string[] = [];

  const groupIds = await ChatGroupRepository.getChatGroupIdsParticipantBelongTo({
    tenantId: sessionUser.tenantId,
    participantId: sessionUser.userId,
  });

  if (groupIds && groupIds.length) {
    chatGroupIds = [...chatGroupIds, ...groupIds];
  }

  const result = await SocketConnectionRepository.addChatConnection({
    connectionId,
    sessionUser,
    chatGroupIds,
  });

  await ConnectionHelperService.setConnectionCache({ connectionId, data: result });
  return await Promise.resolve();
}

const runHandle: APIGatewayProxyHandler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;

    LoggingService.anyInfo({ connectionId, queryStringParameters: event.queryStringParameters });
    if (!connectionId) {
      LoggingService.error("RES: connectionId NOT defined");
      return failureResponse({
        statusCode: StatusCode.BadRequest_400,
        body: "connectionId NOT defined",
      });
    }

    const token: string | undefined | null = event?.queryStringParameters?.[SocketAuthKeys.token];

    if (!token) {
      LoggingService.error(`RES: Token NOT found`);
      return failureResponse({
        statusCode: StatusCode.BadRequest_400,
        body: "Token NOT found",
      });
    }

    try {
      const sessionUser = await AuthSessionHelperService.getRequireSessionUserDataByToken({ token });
      const connectionKind: string | undefined | null = event?.queryStringParameters?.[SocketAuthKeys.connection_kind];
      const applicationId: string | undefined | null = event?.queryStringParameters?.[SocketAuthKeys.applicationId];
      const platform: string | undefined | null = event?.queryStringParameters?.[SocketAuthKeys.platform];
      const appVersion: string | undefined | null = event?.queryStringParameters?.[SocketAuthKeys.app_version];

      if (applicationId && !sessionUser.applicationId) {
        sessionUser.applicationId = applicationId;
      }

      if (platform && !sessionUser.platform) {
        sessionUser.platform = platform;
      }

      if (appVersion && !sessionUser.appVersion) {
        sessionUser.appVersion = appVersion;
      }

      try {
        const tenantData = await AdminService.getCachedTenant_ByTenantId({ tenantId: sessionUser.tenantId });
        if (tenantData?.id && tenantData.name) {
          sessionUser.tenantName = tenantData.name;
        }
      } catch (error) {
        LoggingService.anyError(error);
      }

      LoggingService.anyInfo({ connectionId, sessionUser });

      if (connectionKind === SocketConnectionCategoryEnum.CHAT) {
        try {
          await registerChatClientsConnection({ connectionId, sessionUser });

          LoggingService.log({ registerClientsConnection_CHAT: "SUCCESSS" });
          return successfullResponse();
        } catch (err) {
          LoggingService.anyError({ registerClientsConnection_ERROR: err });
          return failureResponse({
            statusCode: StatusCode.BadRequest_400,
            body: "Error could NOT register connection",
          });
        }
      }

      if (connectionKind === SocketConnectionCategoryEnum.NOTIFICATION) {
        try {
          await registerNotificationClientsConnection({ connectionId, sessionUser });

          LoggingService.log({ registerClientsConnection_NOTIFICATION: "SUCCESSS" });
          return successfullResponse();
        } catch (err) {
          LoggingService.anyError({ registerClientsConnection_ERROR: err });
          return failureResponse({
            statusCode: StatusCode.BadRequest_400,
            body: "Error could NOT register connection",
          });
        }
      }

      return failureResponse({
        statusCode: StatusCode.BadRequest_400,
        body: "Invalid connection kind",
      });
    } catch (err) {
      LoggingService.anyError({ verifyUserToken_ERROR: err });
      return failureResponse({
        statusCode: StatusCode.Unauthorized_401,
        body: "Could not verify connection kind",
      });
    }
  } catch (err) {
    LoggingService.anyError(err);
    return failureResponse({ body: `Failed to connect: ${JSON.stringify(err)}` });
  }
};

export const run = runHandle;
