import { LocalCacheService } from "@/services/local-cache-service.js";
import { LoggingService } from "@/services/logging-service.js";
class ConnectionLambdaCacheHelperServiceBase extends LocalCacheService {
    constructor() {
        super("connection_a502564ece5735e2676d3cf0");
    }
    async getConnection({ connectionId }) {
        const currentConnection01 = await super.readJsonFile({ fileId: connectionId });
        if (currentConnection01?.id) {
            LoggingService.log({ getConnection_Local_Cache: { fileId: connectionId, data: currentConnection01 } });
            return currentConnection01;
        }
        return null;
    }
    async setConnection({ connectionId, data }) {
        LoggingService.log({ setConnection_Local_Cache: { fileId: connectionId, data } });
        return await super.writeJson({ fileId: connectionId, data });
    }
    async removeConnection({ connectionId }) {
        LoggingService.log({ removeConnection_Local_Cache: { fileId: connectionId } });
        return await super.deleteJsonFile({ fileId: connectionId });
    }
    async listAllFiles() {
        return super.listAllFilesInFolder();
    }
}
export const ConnectionLambdaCacheHelperService = new ConnectionLambdaCacheHelperServiceBase();
//# sourceMappingURL=connection-lamda-cache-helper-service.js.map