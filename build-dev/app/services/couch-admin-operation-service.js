import { FileOperationService } from "./file-operation-service.js";
import { HttpRequestBase } from "./http-request-base.js";
import { UtilService } from "./util-service.js";
import os from "node:os";
import path from "node:path";
import { createHmac } from "crypto";
import { envConfig } from "../config/env.js";
import { EncryptionService } from "./encryption-service.js";
export class CouchAdminOperationServiceBase extends HttpRequestBase {
    auth;
    host;
    commonHeaders = {};
    constructor({ host, auth }) {
        super();
        this.host = host;
        this.auth = auth;
    }
    validateRequiredString(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && typeof value === "string")) {
                errors.push(`${key} is required`);
            }
        });
        if (errors.length) {
            throw new Error(`${errors.join("; ")}.`);
        }
    }
    getUrl(urlParts) {
        const urlParts01 = Array.isArray(urlParts) ? urlParts : [urlParts];
        return [this.host, ...urlParts01].join("/");
    }
    getTenantAuthProxyHeaders(tenantId) {
        this.validateRequiredString({ tenantId });
        const headers = {};
        const token = createHmac("sha1", envConfig.COUCH_DB_SERVER_SECRET).update(tenantId).digest("hex");
        headers["X-Auth-CouchDB-UserName"] = tenantId;
        headers["X-Auth-CouchDB-Roles"] = [`db_${tenantId}_admin`, `db_${tenantId}_member`].join(",");
        headers["X-Auth-CouchDB-Token"] = token;
        return headers;
    }
    encodeTenantAuthProxyHeaders({ tenantId }) {
        const headers = this.getTenantAuthProxyHeaders(tenantId);
        return EncryptionService.encodeSync(JSON.stringify(headers), tenantId);
    }
    decodeTenantAuthProxyHeaders({ encodedData, tenantId }) {
        return EncryptionService.decodeSync(encodedData, tenantId);
    }
    async getCookieAuthHeaders() {
        const loginData = await this.login();
        if (loginData?.cookie) {
            const { cookieData, cookie } = loginData;
            if (cookieData?.Expires && cookieData.Expires > new Date().toISOString()) {
                const headers = { ...this.commonHeaders };
                headers["X-CouchDB-WWW-Authenticate"] = "Cookie";
                headers.cookie = cookie;
                return headers;
            }
        }
        return null;
    }
    async getAuthHeadersStrict() {
        const headers = await this.getCookieAuthHeaders();
        if (!headers) {
            throw new Error("Could not authenticate");
        }
        return headers;
    }
    async login() {
        const cookieStorePath = path.resolve(os.tmpdir(), `cookie-pp-fbf1-0ef6-2623-32bae6548c09.txt`);
        try {
            if (FileOperationService.fileOrDirectoryExists(cookieStorePath)) {
                const cookie01 = await FileOperationService.readFile(cookieStorePath);
                if (cookie01) {
                    const { cookieData, cookie, auth } = JSON.parse(cookie01);
                    if (cookie && cookieData?.Expires && cookieData.Expires > new Date().toISOString()) {
                        const auth01 = JSON.stringify(auth);
                        const auth02 = JSON.stringify(this.auth);
                        console.log({ auth01, auth02 });
                        if (auth01 === auth02) {
                            return {
                                cookieData,
                                cookie,
                            };
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        const response = await this.requestStrict({
            url: this.getUrl(`_session`),
            method: "POST",
            data: { ...this.auth },
            headers: { ...this.commonHeaders },
        });
        const cookie = response.headers.get("set-cookie");
        if (cookie) {
            const cookieData = UtilService.parseCookieString(cookie);
            await FileOperationService.writeFile({
                absolutefileNameWithExtention: cookieStorePath,
                data: JSON.stringify({ cookie, cookieData, auth: this.auth }),
            });
            return {
                cookieData,
                cookie,
            };
        }
        return null;
    }
    async logout() {
        const response = await this.requestJson({
            url: this.getUrl(`_session`),
            method: "DELETE",
        });
        return response;
    }
    async loginInfo() {
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl(`_session`),
            method: "GET",
            headers,
        });
        return response;
    }
    async dbInfo({ dbname }) {
        this.validateRequiredString({ dbname });
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl(dbname),
            method: "GET",
            headers,
        });
        return response;
    }
    async dbCreate({ dbname }) {
        this.validateRequiredString({ dbname });
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl(dbname),
            method: "PUT",
            params: { partitioned: true },
            headers,
        });
        return response;
    }
    async dbDelete({ dbname }) {
        this.validateRequiredString({ dbname });
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl(dbname),
            method: "DELETE",
            headers,
        });
        return response;
    }
    async createDatabaseForTenantAndGrantAccess({ tenantId }) {
        this.validateRequiredString({ tenantId });
        const dbname = `db_${tenantId}`;
        const dbCreated = await this.dbCreate({ dbname });
        if (!dbCreated.ok) {
            return false;
        }
        const response = await this.grantTenantDatabaseAdminRole({ dbname });
        return response.ok;
    }
    async grantTenantDatabaseAdminRole({ dbname }) {
        this.validateRequiredString({ dbname });
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl([dbname, `_security`]),
            method: "PUT",
            headers,
            data: {
                admins: { names: [], roles: [`${dbname}_admin`] },
                members: { names: [], roles: [`${dbname}_member`] },
            },
        });
        return response;
    }
    async userGetInfo({ username }) {
        this.validateRequiredString({ username });
        const headers = await this.getAuthHeadersStrict();
        const response = await this.requestJson({
            url: this.getUrl(["_users", `org.couchdb.user:${username}`]),
            method: "GET",
            headers,
        });
        return response;
    }
    async userCreate({ user }) {
        const headers = await this.getAuthHeadersStrict();
        const userInfo = await this.userGetInfo({ username: user.name });
        if (userInfo?._id) {
            throw new Error("User already exists");
        }
        const response = await this.requestJson({
            url: this.getUrl(["_users", `org.couchdb.user:${user.name}`]),
            method: "PUT",
            headers,
            data: {
                name: user.name,
                password: user.password,
                roles: user.roles || [],
                type: "user",
            },
        });
        return response;
    }
    async userPasswordChange({ user }) {
        this.validateRequiredString({
            username: user?.name,
            newPassword: user?.newPassword,
        });
        const userInfo = await this.userGetInfo({ username: user.name });
        if (!userInfo?._rev) {
            throw new Error("User not found");
        }
        const headers = await this.getAuthHeadersStrict();
        headers["If-Match"] = userInfo._rev;
        const response = await this.requestJson({
            url: this.getUrl(["_users", `org.couchdb.user:${user.name}`]),
            method: "PUT",
            headers,
            data: {
                name: userInfo.name,
                password: user.newPassword,
                roles: userInfo.roles || [],
                type: "user",
            },
        });
        return response;
    }
}
//# sourceMappingURL=couch-admin-operation-service.js.map