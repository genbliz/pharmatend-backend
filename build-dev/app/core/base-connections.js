import { MocodyInitializerCouch, MocodyInitializerPouch } from "mocody";
import { CommonConfig } from "../config/config-common.js";
import { envConfig } from "../config/env.js";
import { EncryptionService } from "../services/encryption-service.js";
import { GenericFriendlyError } from "../utils/errors.js";
import { DefinedIndexes } from "./base-constants.js";
class ConnectionsBase {
    _pouchConn;
    _couchConn;
    decodeTenantAuthProxyHeaders() {
        try {
            const encodedData = envConfig.LOCAL_SERVER_COUCH_DB_PROXY_AUTHORIZATION_ENC_TOKEN;
            const tenantId = envConfig.LOCAL_SERVER_LICENSED_TENANT_ID;
            const data01 = EncryptionService.decodeSync(encodedData, tenantId);
            const dataobj = JSON.parse(data01);
            return dataobj && typeof dataobj === "object" && Object.keys(dataobj).length ? dataobj : null;
        }
        catch (error) {
            return null;
        }
    }
    getCouchConnection() {
        if (!this._couchConn) {
            const indexes01 = [];
            Object.entries(DefinedIndexes).forEach(([_, val]) => {
                const val01 = { ...val };
                indexes01.push({
                    fields: [val01.partitionKeyFieldName, val01.sortKeyFieldName],
                    indexName: val01.indexName,
                });
            });
            this._couchConn = new MocodyInitializerCouch({
                authType: "basic",
                couchConfig: {
                    host: envConfig.COUCH_DB_HOST,
                    port: envConfig.COUCH_DB_PORT,
                    databaseName: `db_${envConfig.LOCAL_SERVER_LICENSED_TENANT_ID}`,
                    password: envConfig.COUCH_DB_PASS,
                    username: envConfig.COUCH_DB_USER,
                    protocol: "http",
                },
                indexes: indexes01,
            });
        }
        return this._couchConn;
    }
    getCouchConnection_00_00() {
        if (!this._couchConn) {
            const proxyHeaders = this.decodeTenantAuthProxyHeaders();
            if (!proxyHeaders) {
                throw new GenericFriendlyError("Auth headers not provided");
            }
            this._couchConn = new MocodyInitializerCouch({
                authType: "proxy",
                couchConfig: {
                    host: envConfig.COUCH_DB_HOST,
                    port: envConfig.COUCH_DB_PORT,
                    databaseName: envConfig.COUCH_DB_NAME,
                    proxyHeaders,
                },
            });
        }
        return this._couchConn;
    }
    getPouchConnection() {
        if (!this._pouchConn) {
            const indexes01 = [];
            if (CommonConfig) {
            }
            Object.entries(DefinedIndexes).forEach(([_, val]) => {
                const val01 = { ...val };
                indexes01.push({
                    fields: [val01.partitionKeyFieldName, val01.sortKeyFieldName],
                    indexName: val01.indexName,
                });
            });
            const envData = {
                host: envConfig.COUCH_DB_HOST,
                user: envConfig.COUCH_DB_USER,
                password: envConfig.COUCH_DB_PASS,
                port: envConfig.COUCH_DB_PORT,
                server_secret: envConfig.COUCH_DB_SERVER_SECRET,
            };
            console.log({ indexes01, envData });
            this._pouchConn = new MocodyInitializerPouch({
                configType: "REMOTE_FIRST",
                pouchConfig: {
                    databaseName: envConfig.COUCH_DB_NAME,
                    host: envConfig.COUCH_DB_HOST,
                    username: envConfig.COUCH_DB_USER,
                    password: envConfig.COUCH_DB_PASS,
                    port: envConfig.COUCH_DB_PORT,
                },
                indexes: indexes01,
            });
            try {
                if (indexes01?.length) {
                    for (const indexItem of indexes01) {
                        this._pouchConn
                            .createIndex({ ...indexItem })
                            .then((e) => console.log(e))
                            .catch((e) => console.log(e));
                    }
                }
            }
            catch (error) {
            }
        }
        return this._pouchConn;
    }
}
export const BaseConnections = new ConnectionsBase();
//# sourceMappingURL=base-connections.js.map