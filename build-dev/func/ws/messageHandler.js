import "source-map-support/register.js";
import { LoggingService } from "@/services/logging-service.js";
import { WebsocketManagementService } from "@/common/socket-connection/ws-management-service.js";
import { successfullResponse, failureResponse, formatChatRequestData, ConnectionCacheHelper } from "#func/ws/websocket-helper.js";
import { UtilService } from "@/services/util-service.js";
import { SocketConnectionRepository } from "@/common/socket-connection/socket-connection-repository.js";
import { ChatItemRepository } from "@/common/chat/chat-item/chat-item-repository.js";
import { ChatGroupRepository } from "@/common/chat/chat-group/chat-group-repository.js";
import { StatusCode } from "@/helpers/response-status-codes.js";
import { SocketBodyKindEnum } from "@/common/chat/chat-types.js";
import { ConnectionHelperService } from "#func/ws/connection-helper-service.js";
import { ChatInstantRepository } from "@/common/chat/chat-instant/chat-instant-repository.js";
async function sendSocketMessage({ myRequestParams, connectionIds, msgTypeKind, data, chatRequestId, }) {
    const { domainName, stage } = myRequestParams;
    const socketBody = {
        msgTypeKind,
        bodyData: data,
    };
    LoggingService.logConsoleInfo({ sendChatMessage_socketBody: socketBody });
    const connectionIds01 = UtilService.removeDuplicatesInArray(connectionIds);
    const postCalls = connectionIds01.map(async (connectionId) => {
        try {
            const data01 = { ...socketBody };
            if (connectionId === myRequestParams.connectionId) {
                data01.chatRequestId = chatRequestId;
            }
            await WebsocketManagementService.send({
                stage,
                domainName: domainName,
                connectionId,
                data: JSON.stringify(data01),
            });
        }
        catch (e) {
            if (e && e.statusCode === StatusCode.Unauthorized_401) {
                await SocketConnectionRepository.removeConnection({ connectionId });
                await ConnectionCacheHelper.deleteCacheConnection({ connectionId });
            }
            else {
                throw e;
            }
        }
    });
    try {
        await Promise.all(postCalls);
    }
    catch (e) {
        LoggingService.anyError({ postCalls_err2: e });
    }
}
async function sendInstantChatToRoom({ myRequestParams, data, chatRequestId, currentConnection, }) {
    try {
        if (!data?.receiverId) {
            LoggingService.anyInfo({
                at: "sendInstantChatToRoom",
                mesage: "data.receiverId found",
                data: data,
                chatRequestId,
            });
            return;
        }
        const connection01 = await SocketConnectionRepository.getByTenantIdAndOptions({
            fields: ["id"],
            userId: data.receiverId,
            tenantId: currentConnection.tenantId,
            category: currentConnection.category,
        });
        if (!connection01?.length) {
            LoggingService.anyInfo({
                at: "sendChatToRoom",
                mesage: "usersToSendTo found",
                usersToSendTo: connection01,
                chatRequestId,
            });
            return;
        }
        const connectionIds = connection01.filter((f) => f.userId === data.receiverId).map((f) => f.id);
        LoggingService.anyInfo({ connectionIds });
        await sendSocketMessage({
            data,
            connectionIds,
            chatRequestId,
            myRequestParams,
            msgTypeKind: SocketBodyKindEnum.INSTANT_CHAT_SEND,
        });
    }
    catch (error) {
        LoggingService.info("@sendChatToRooms error data");
        LoggingService.anyError(error);
    }
}
export async function handleInstantChatSendFromClient({ myRequestParams, data, chatRequestId, currentConnection, }) {
    try {
        LoggingService.anyInfo({ chat_sent_data: data });
        if (!data?.receiverId) {
            LoggingService.log({
                at: "handleInstantChatSendFromClient",
                message: "data.receiverId NOT available",
            });
            return;
        }
        if (!currentConnection?.userId) {
            LoggingService.log({
                at: "handleInstantChatSendFromClient",
                message: "currentConnection.participantId NOT available",
            });
            return;
        }
        try {
            const data01 = await ChatInstantRepository.create({
                message: data.message,
                receiverId: data.receiverId,
                sessionUser: { ...currentConnection, organizationId: "" },
            });
            await sendInstantChatToRoom({
                myRequestParams,
                chatRequestId,
                data: data01,
                currentConnection,
            });
        }
        catch (error) {
            LoggingService.anyError(error);
        }
    }
    catch (error) {
        LoggingService.anyError(error);
    }
}
async function sendChatToRoom({ myRequestParams, chatGroupId, data, chatRequestId, currentConnection, }) {
    try {
        const connectionsByGroupMembers = await SocketConnectionRepository.getByTenantIdAndOptions({
            groupId: chatGroupId,
            fields: ["id"],
            tenantId: currentConnection.tenantId,
            category: currentConnection.category,
        });
        if (!connectionsByGroupMembers?.length) {
            LoggingService.anyInfo({
                at: "sendChatToRoom",
                mesage: "usersToSendTo found",
                usersToSendTo: connectionsByGroupMembers,
                chatGroupId,
                chatRequestId,
            });
            return;
        }
        const connectionIds = connectionsByGroupMembers.map((f) => f.id);
        LoggingService.anyInfo({ connectionIds });
        await sendSocketMessage({
            connectionIds,
            chatRequestId,
            data,
            myRequestParams,
            msgTypeKind: SocketBodyKindEnum.CHAT_SEND,
        });
    }
    catch (error) {
        LoggingService.info("@sendChatToRooms error data");
        LoggingService.anyError(error);
    }
}
async function handleChatItemSendFromClient({ myRequestParams, data, chatRequestId, currentConnection, }) {
    try {
        LoggingService.anyInfo({ chat_sent_data: data });
        if (!data?.chatGroupId) {
            LoggingService.log({
                at: "handleChatItemSendFromClient",
                message: "data.chatGroupId NOT available",
            });
            return;
        }
        if (!currentConnection?.userId) {
            LoggingService.log({
                at: "handleChatItemSendFromClient",
                message: "currentConnection.participantId NOT available",
            });
            return;
        }
        if (!currentConnection?.chatGroupIds?.includes(data.chatGroupId)) {
            LoggingService.log({
                at: "handleChatItemSendFromClient",
                message: "data.chatGroupId NOT found in currentConnection.chatGroupIds",
                chatGroupId: data.chatGroupId,
                chatGroupIds: currentConnection.chatGroupIds,
            });
            return;
        }
        try {
            const chatItem = await ChatItemRepository.create({
                chatGroupId: data.chatGroupId,
                message: data.message,
                sessionUser: { ...currentConnection, organizationId: "" },
            });
            if (chatItem?.chatGroupId) {
                if (!chatItem?.displayName) {
                    chatItem.displayName = currentConnection.displayName;
                }
                await sendChatToRoom({
                    myRequestParams,
                    chatRequestId,
                    chatGroupId: chatItem.chatGroupId,
                    data: chatItem,
                    currentConnection,
                });
            }
            else {
                LoggingService.log({
                    at: "handleChatItemSendFromClient",
                    message: "chatItem NOT validly created",
                });
            }
        }
        catch (err) {
            LoggingService.anyError(err);
        }
    }
    catch (err) {
        LoggingService.anyError(err);
    }
}
async function handleChatSendActiveUsersIds({ myRequestParams, chatRequestId, currentConnection, }) {
    let currentActiveUsersIds = [];
    const { connectionId } = myRequestParams;
    try {
        const currentActiveUsers = await SocketConnectionRepository.getByTenantIdAndOptions({
            fields: ["id", "userId"],
            tenantId: currentConnection.tenantId,
            category: currentConnection.category,
        });
        if (currentActiveUsers?.length) {
            currentActiveUsersIds = currentActiveUsers.map((x) => x.userId);
        }
    }
    catch (err) {
        LoggingService.anyError(err);
        currentActiveUsersIds = [];
    }
    finally {
        await sendSocketMessage({
            connectionIds: [connectionId],
            myRequestParams,
            chatRequestId,
            msgTypeKind: SocketBodyKindEnum.ACTIVE_USERS_IDS,
            data: currentActiveUsersIds || [],
        });
    }
}
async function notifyPlainMessageToOtherConnectedUsers({ myRequestParams, chatRequestId, currentConnection, userIds, message, msgTypeKind, }) {
    try {
        if (!currentConnection?.tenantId) {
            return;
        }
        if (!userIds?.length || !message) {
            LoggingService.anyError("@notifyOtherConnectedUsers::: participantIds or message not defined");
            return;
        }
        const currentActiveUsers = await SocketConnectionRepository.getByUserIds({
            userIds,
            tenantId: currentConnection.tenantId,
            category: currentConnection.category,
        });
        if (currentActiveUsers?.length) {
            const connectionIds = currentActiveUsers
                .filter((f) => f.id !== currentConnection.id && f.userId !== currentConnection.userId)
                .map((x) => x.id);
            if (connectionIds?.length) {
                await sendSocketMessage({
                    connectionIds,
                    myRequestParams,
                    chatRequestId,
                    msgTypeKind,
                    data: { message },
                });
            }
        }
    }
    catch (err) {
        LoggingService.anyError(err);
    }
}
async function handleSendNotificationToParticipantsOrGroup({ myRequestParams, chatRequestId, currentConnection, chatGroupId, participantIds, }) {
    try {
        if (!currentConnection?.tenantId) {
            return;
        }
        let participantIdsValues = [];
        if (participantIds?.length) {
            participantIdsValues = [...participantIds];
        }
        if (chatGroupId) {
            const result = await ChatGroupRepository.findSingle({
                dataId: chatGroupId,
                tenantId: currentConnection.tenantId,
            });
            if (result?.participantIds?.length) {
                participantIdsValues = [...participantIdsValues, ...result.participantIds];
            }
        }
        if (participantIdsValues?.length) {
            const currentActiveUsers = await SocketConnectionRepository.getByUserIds({
                userIds: participantIdsValues,
                tenantId: currentConnection.tenantId,
                category: currentConnection.category,
            });
            if (currentActiveUsers?.length) {
                const connectionIds = currentActiveUsers
                    .filter((f) => f.id !== currentConnection.id && f.userId !== currentConnection.userId)
                    .map((x) => x.id);
                if (connectionIds?.length) {
                    await sendSocketMessage({
                        connectionIds,
                        myRequestParams,
                        chatRequestId,
                        msgTypeKind: SocketBodyKindEnum.NOTIFY_CONNECTED_USERS,
                        data: {
                            chatGroupId,
                            message: [currentConnection.displayName || currentConnection.userName || "User", "is chatting with you"].join(" "),
                        },
                    });
                }
            }
        }
    }
    catch (err) {
        LoggingService.anyError(err);
    }
}
async function handleHeartBeat({ myRequestParams, heartBeat, chatRequestId, }) {
    await sendSocketMessage({
        connectionIds: [myRequestParams.connectionId],
        myRequestParams,
        msgTypeKind: SocketBodyKindEnum.HEART_BEAT,
        data: `Seen sent: ${heartBeat}`,
        chatRequestId: chatRequestId,
    });
}
async function handleAnyMessage({ msgTypeKind, myRequestParams, data, chatRequestId, }) {
    await sendSocketMessage({
        connectionIds: [myRequestParams.connectionId],
        myRequestParams,
        msgTypeKind,
        data,
        chatRequestId: chatRequestId,
    });
}
async function handleChatGroupCreated({ myRequestParams, chatGroupId, chatRequestId, currentConnection, }) {
    try {
        LoggingService.info("IN @@handleChatGroupCreated");
        const chatGroup = await ChatGroupRepository.findSingle({
            dataId: chatGroupId,
            tenantId: currentConnection.tenantId,
        });
        LoggingService.anyInfo({ at: "handleChatGroupCreated", chatGroup });
        if (!chatGroup?.id) {
            LoggingService.info("chatGroupId NOT found");
            return;
        }
        if (!chatGroup?.participantIds?.length) {
            LoggingService.anyInfo({
                at: "handleChatGroupCreated",
                mesage: "chatGroup.participantIds empty",
                chatGroupId,
                tenantId: chatGroup.tenantId,
            });
            return;
        }
        const tenantConnectedActiveUsers = await SocketConnectionRepository.getByTenantIdAndOptions({
            liteFields: false,
            tenantId: currentConnection.tenantId,
            category: currentConnection.category,
            userIds: chatGroup.participantIds,
        });
        if (!tenantConnectedActiveUsers?.length) {
            LoggingService.anyInfo({ at: "handleChatGroupCreated", mesage: "tenantConnectedActiveUsers not found" });
            return;
        }
        LoggingService.anyInfo({
            at: "handleChatGroupCreated",
            tenantConnectedActiveUsers,
        });
        const activeUserInGroupUpdated = [];
        for (const activeUserInGroup of tenantConnectedActiveUsers) {
            if (activeUserInGroup?.id) {
                activeUserInGroup.chatGroupIds = [...(activeUserInGroup?.chatGroupIds || []), chatGroup.id];
                const updatedData = await SocketConnectionRepository.update(activeUserInGroup);
                activeUserInGroupUpdated.push(updatedData);
                await ConnectionHelperService.setConnectionCache({
                    connectionId: updatedData.id,
                    data: updatedData,
                });
            }
        }
        const connectionIds = activeUserInGroupUpdated.map((f) => f.id);
        await sendSocketMessage({
            chatRequestId,
            myRequestParams,
            connectionIds,
            data: chatGroup,
            msgTypeKind: SocketBodyKindEnum.CHAT_GROUP_CREATED,
        });
    }
    catch (error) {
        LoggingService.anyError(error);
    }
}
const runHandle = async (event) => {
    const currentSessionRequestParams = {
        connectionId: event.requestContext.connectionId,
        domainName: event.requestContext.domainName,
        stage: event.requestContext.stage,
        apiId: event.requestContext.apiId,
        connectedAt: event.requestContext.connectedAt,
    };
    LoggingService.anyInfo({ currentSessionRequestParams });
    const socketBody = formatChatRequestData(event.body);
    LoggingService.info(`chat msg received`);
    LoggingService.anyInfo({ socketBody: JSON.stringify(socketBody, null, 1) });
    const { connectionId } = currentSessionRequestParams;
    if (!connectionId) {
        LoggingService.error("No Connection connectionId");
        return failureResponse({ body: "connectionId not found" });
    }
    if (!socketBody?.msgTypeKind) {
        LoggingService.info("msgTypeKind NOT specified; will Not Response");
        return successfullResponse({ body: `No Response` });
    }
    const currentConnection = await ConnectionHelperService.getConnection({ connectionId });
    if (!currentConnection?.id) {
        LoggingService.info(`Connection with connectionId: ${connectionId}, NOT found`);
        await WebsocketManagementService.disconnect(currentSessionRequestParams);
        return failureResponse({ body: "connection data not found" });
    }
    const isValidConnection = !!(currentConnection.dangerouslyExpireAt && new Date(currentConnection.dangerouslyExpireAt).getTime() > new Date().getTime());
    if (!isValidConnection) {
        await handleAnyMessage({
            msgTypeKind: SocketBodyKindEnum.SESSION_EXPIRED_WARNING,
            myRequestParams: currentSessionRequestParams,
            data: "connection expired",
            chatRequestId: socketBody.chatRequestId,
        });
        LoggingService.anyInfo({ message: "connection expired", chatRequestId: socketBody.chatRequestId });
        await ConnectionHelperService.removeConnection({ connectionId });
        return successfullResponse();
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.HEART_BEAT) {
        try {
            const socketBodyHeartBeat = formatChatRequestData(event.body);
            await handleHeartBeat({
                myRequestParams: currentSessionRequestParams,
                chatRequestId: socketBodyHeartBeat.chatRequestId,
                heartBeat: socketBodyHeartBeat.bodyData,
            });
            return successfullResponse();
        }
        catch (err) {
            LoggingService.log({ handleHeartBeat__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.CHAT_SEND) {
        try {
            await handleChatItemSendFromClient({
                myRequestParams: currentSessionRequestParams,
                data: socketBody.bodyData,
                chatRequestId: socketBody.chatRequestId,
                currentConnection,
            });
            return successfullResponse();
        }
        catch (err) {
            LoggingService.anyError({ handleChatItemSendFromClient__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.INSTANT_CHAT_SEND) {
        try {
            const socketBody01 = formatChatRequestData(event.body);
            await handleInstantChatSendFromClient({
                myRequestParams: currentSessionRequestParams,
                data: socketBody01.bodyData,
                chatRequestId: socketBody.chatRequestId,
                currentConnection,
            });
            return successfullResponse();
        }
        catch (error) {
            LoggingService.anyError({ handleInstantChatSendFromClient__ERROR: error });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(error)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.CHAT_GROUP_CREATED) {
        try {
            if (socketBody.bodyData?.chatGroupId) {
                await handleChatGroupCreated({
                    myRequestParams: currentSessionRequestParams,
                    chatGroupId: socketBody.bodyData.chatGroupId,
                    chatRequestId: socketBody.chatRequestId,
                    currentConnection,
                });
            }
            else {
                LoggingService.anyError("Will NOT notify CHAT_GROUP_CREATED: socketBody.bodyData.chatGroupId not defined");
            }
            return successfullResponse();
        }
        catch (error) {
            LoggingService.anyError({ handleChatGroupCreated__ERROR: error });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(error)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.ACTIVE_USERS_IDS) {
        try {
            await handleChatSendActiveUsersIds({
                myRequestParams: currentSessionRequestParams,
                chatRequestId: socketBody.chatRequestId,
                currentConnection,
            });
            return successfullResponse();
        }
        catch (err) {
            LoggingService.anyError({ handleSendActiveUsersIds__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.NOTIFY_CONNECTED_USERS) {
        try {
            await handleSendNotificationToParticipantsOrGroup({
                myRequestParams: currentSessionRequestParams,
                chatGroupId: socketBody.bodyData?.chatGroupId,
                chatRequestId: socketBody.chatRequestId,
                currentConnection,
                participantIds: socketBody.bodyData?.participantIds,
            });
            return successfullResponse();
        }
        catch (err) {
            LoggingService.anyError({ handleChatGroupCreated__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.NOTIFY_QUEQUE_ASSIGNED) {
        try {
            const { userIds, message } = socketBody.bodyData || {};
            if (userIds && message) {
                await notifyPlainMessageToOtherConnectedUsers({
                    myRequestParams: currentSessionRequestParams,
                    chatRequestId: socketBody.chatRequestId,
                    currentConnection,
                    message,
                    userIds,
                    msgTypeKind: SocketBodyKindEnum.NOTIFY_QUEQUE_ASSIGNED,
                });
            }
            else {
                LoggingService.anyError("Will NOT notify NOTIFY_QUEQUE_ASSIGNED: socketBody.bodyData.userIds || message not defined");
            }
            return successfullResponse();
        }
        catch (err) {
            LoggingService.anyError({ notifyPlainMessageToOtherConnectedUsers__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    if (socketBody.msgTypeKind === SocketBodyKindEnum.NOTIFY_LAB_TEST_RECOMMENDATION) {
        try {
            const { userIds, message } = socketBody.bodyData || {};
            if (userIds && message) {
                await notifyPlainMessageToOtherConnectedUsers({
                    myRequestParams: currentSessionRequestParams,
                    chatRequestId: socketBody.chatRequestId,
                    currentConnection,
                    message,
                    userIds,
                    msgTypeKind: SocketBodyKindEnum.NOTIFY_LAB_TEST_RECOMMENDATION,
                });
            }
            else {
                LoggingService.anyError("Will NOT notify NOTIFY_QUEQUE_ASSIGNED: socketBody.bodyData.userIds || message not defined");
            }
            return successfullResponse();
        }
        catch (err) {
            LoggingService.anyError({ notifyPlainMessageToOtherConnectedUsers__ERROR: err });
            return failureResponse({ body: `Could not send chat: ${JSON.stringify(err)}` });
        }
    }
    return successfullResponse({ body: `No Response` });
};
export const run = runHandle;
export const runMsg = runHandle;
//# sourceMappingURL=messageHandler.js.map