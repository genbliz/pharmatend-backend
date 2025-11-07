import "source-map-support/register.js";
import { successfullResponse, failureResponse } from "#func/ws/websocket-helper.js";
import { LoggingService } from "@/services/logging-service.js";
import { ConnectionHelperService } from "#func/ws/connection-helper-service.js";
export const run = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        if (connectionId) {
            LoggingService.log(`USER: ${connectionId}, DIS_CONNECTED!`);
            await ConnectionHelperService.removeConnection({ connectionId });
        }
        return successfullResponse();
    }
    catch (err) {
        LoggingService.log(`Disconnection Error: ${JSON.stringify(err)}`);
        return failureResponse({ body: `Failed to disconnect: ${JSON.stringify(err)}` });
    }
};
//# sourceMappingURL=disconnectHandler.js.map