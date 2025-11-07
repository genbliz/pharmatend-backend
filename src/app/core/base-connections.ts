import { LoggingService } from "@/services/logging-service.js";
import { MocodyInitializerDynamo } from "mocody";
import { SystemService } from "@/services/system-service.js";
import { getAWSCredentialCollection } from "../config/env.js";

class ConnectionsBase {
  private _dynamoConn: MocodyInitializerDynamo | undefined;
  // private _mongoConn: MocodyInitializerMongo | undefined;

  constructor() {
    if (SystemService.isLocalDeploy()) {
      // this.getCouchConnection();
      // this.getDynamoConnection();
    } else {
      // this.getDynamoConnection();
    }
  }

  getDynamoConnection() {
    if (!this._dynamoConn) {
      const credentialData = getAWSCredentialCollection();

      LoggingService.log({ credentialData });
      LoggingService.logToJsonFile({ credentialData });

      this._dynamoConn = new MocodyInitializerDynamo({
        accountId: credentialData?.credentials?.accountId,
        credentials: credentialData?.credentials,
        region: credentialData.region,
      });

      LoggingService.log({ getDynamoConnection_INITIALIZED: true });
    } else {
      // LoggingService.log({ getDynamoConnection_RE_USED: true });
    }
    return this._dynamoConn;
  }
}

export const BaseConnections = new ConnectionsBase();
