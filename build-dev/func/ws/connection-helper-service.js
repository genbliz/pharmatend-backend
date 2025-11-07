import { SocketConnectionRepository } from "@/common/socket-connection/socket-connection-repository.js";
import { LoggingService } from "@/services/logging-service.js";
import { ConnectionLambdaCacheHelperService } from "#func/ws/connection-lamda-cache-helper-service.js";
import { ConnectionCacheHelper } from "#func/ws/websocket-helper.js";
class ConnectionHelperServiceBase {
    async getConnection({ connectionId }) {
        try {
            const currentConnection02 = await ConnectionCacheHelper.getCacheConnection({ connectionId });
            if (currentConnection02?.id) {
                return currentConnection02;
            }
            const currentConnection01 = await ConnectionLambdaCacheHelperService.getConnection({ connectionId });
            if (currentConnection01?.id) {
                return currentConnection01;
            }
            const currentConnection = await SocketConnectionRepository.getByConnectionId({ connectionId });
            if (currentConnection?.id) {
                await ConnectionLambdaCacheHelperService.setConnection({
                    connectionId,
                    data: currentConnection,
                });
                await ConnectionCacheHelper.setCacheConnection({
                    connectionId,
                    data: currentConnection,
                });
                return currentConnection;
            }
            return null;
        }
        catch (error) {
            LoggingService.anyError(error);
            return null;
        }
    }
    async setConnectionCache({ connectionId, data }) {
        try {
            if (data?.id) {
                await ConnectionLambdaCacheHelperService.setConnection({ connectionId, data });
                await ConnectionCacheHelper.setCacheConnection({ connectionId, data });
            }
        }
        catch (error) {
            LoggingService.anyError(error);
        }
    }
    async removeConnection({ connectionId }) {
        try {
            await SocketConnectionRepository.removeConnection({ connectionId });
            await ConnectionCacheHelper.deleteCacheConnection({ connectionId });
        }
        catch (error) {
            LoggingService.anyError(error);
        }
    }
}
export const ConnectionHelperService = new ConnectionHelperServiceBase();
//# sourceMappingURL=connection-helper-service.js.map