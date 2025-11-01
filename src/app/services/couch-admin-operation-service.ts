import { FileOperationService } from "./file-operation-service";
import { HttpRequestBase } from "./http-request-base";
import { UtilService } from "./util-service";
import os from "node:os";
import path from "node:path";

import { createHmac } from "crypto";
import { envConfig } from "../config/env";
import { EncryptionService } from "./encryption-service";

interface IUserInfo {
  _id: `org.couchdb.user:${string}`;
  _rev: string;
  derived_key: string;
  iterations: number;
  name: string;
  password_scheme: "pbkdf2";
  roles: string[];
  salt: string;
  type: "user";
}

type IAuth = { name: string; password: string };

export class CouchAdminOperationServiceBase extends HttpRequestBase {
  // http://localhost:5984/_session

  private readonly auth: IAuth;
  private readonly host: string;
  private readonly commonHeaders: Record<string, string> = {
    // "User-Agent": "X-Tend-Pos-001",
  };

  constructor({ host, auth }: { host: string; auth: IAuth }) {
    super();
    this.host = host;
    this.auth = auth;
  }

  private validateRequiredString(keyValueValidates: { [key: string]: string | null | undefined }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw new Error(`${errors.join("; ")}.`);
    }
  }

  private getUrl(urlParts: string | string[]) {
    const urlParts01 = Array.isArray(urlParts) ? urlParts : [urlParts];
    return [this.host, ...urlParts01].join("/");
  }

  getTenantAuthProxyHeaders(tenantId: string) {
    this.validateRequiredString({ tenantId });
    const headers: Record<string, string> = {};

    const token = createHmac("sha1", envConfig.COUCH_DB_SERVER_SECRET).update(tenantId).digest("hex");

    headers["X-Auth-CouchDB-UserName"] = tenantId;
    headers["X-Auth-CouchDB-Roles"] = [`db_${tenantId}_admin`, `db_${tenantId}_member`].join(",");
    headers["X-Auth-CouchDB-Token"] = token;

    return headers;
  }

  encodeTenantAuthProxyHeaders({ tenantId }: { tenantId: string }) {
    const headers = this.getTenantAuthProxyHeaders(tenantId);
    return EncryptionService.encodeSync(JSON.stringify(headers), tenantId);
  }

  decodeTenantAuthProxyHeaders({ encodedData, tenantId }: { encodedData: string; tenantId: string }) {
    return EncryptionService.decodeSync(encodedData, tenantId);
  }

  private async getCookieAuthHeaders() {
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

  private async getAuthHeadersStrict() {
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
    } catch (error) {
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
      // params: { basic: true },
      headers,
    });
    return response;
  }

  async dbInfo({ dbname }: { dbname: string }) {
    this.validateRequiredString({ dbname });

    const headers = await this.getAuthHeadersStrict();

    const response = await this.requestJson({
      url: this.getUrl(dbname),
      method: "GET",
      headers,
    });
    return response;
  }

  async dbCreate({ dbname }: { dbname: string }) {
    this.validateRequiredString({ dbname });

    const headers = await this.getAuthHeadersStrict();

    const response = await this.requestJson<{ ok: boolean }>({
      url: this.getUrl(dbname),
      method: "PUT",
      params: { partitioned: true },
      headers,
    });
    return response;
  }

  async dbDelete({ dbname }: { dbname: string }) {
    this.validateRequiredString({ dbname });

    const headers = await this.getAuthHeadersStrict();

    const response = await this.requestJson({
      url: this.getUrl(dbname),
      method: "DELETE",
      headers,
    });
    return response;
  }

  async createDatabaseForTenantAndGrantAccess({ tenantId }: { tenantId: string }) {
    this.validateRequiredString({ tenantId });

    const dbname = `db_${tenantId}`;

    const dbCreated = await this.dbCreate({ dbname });

    if (!dbCreated.ok) {
      return false;
    }

    const response = await this.grantTenantDatabaseAdminRole({ dbname });
    return response.ok;
  }

  private async grantTenantDatabaseAdminRole({ dbname }: { dbname: string }) {
    this.validateRequiredString({ dbname });

    const headers = await this.getAuthHeadersStrict();

    const response = await this.requestJson<{ ok: boolean }>({
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

  async userGetInfo({ username }: { username: string }) {
    this.validateRequiredString({ username });

    const headers = await this.getAuthHeadersStrict();

    const response = await this.requestJson<IUserInfo | null>({
      url: this.getUrl(["_users", `org.couchdb.user:${username}`]),
      method: "GET",
      headers,
    });
    return response;
  }

  async userCreate({ user }: { user: { name: string; password: string; roles?: string[] } }) {
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

  async userPasswordChange({ user }: { user: { name: string; newPassword: string } }) {
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

//
//
// const CouchAdminOperationService = new CouchAdminOperationServiceBase({
//   host: "http://127.0.0.1:5984",
//   auth: { name: "admin", password: "xtn42u" },
// });

// CouchAdminOperationService.loginInfo()
//   .then((e) => {
//     console.log(e);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// CouchAdminOperationService.grantUserDatabaseAdminRole({
//   dbname: "sale_pay_point",
//   username: "chris_02",
// })
//   .then((e) => {
//     console.log(e);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// CouchAdminOperationService.createDatabaseForTenantAndGrantAccess({
//   tenantId: "20170301-204602655-9ce4db3f-c50a-4d5c-b800-04ba2544947c",
// })
//   .then((e) => {
//     console.log(e);
//   })
//   .catch((e) => {
//     console.log({ e });
//   });

// CouchAdminOperationService.encodeTenantAuthProxyHeaders({
//   tenantId: "20170301-204602655-9ce4db3f-c50a-4d5c-b800-04ba2544947c",
// });

// console.log({
//   proxy: CouchAdminOperationService.encodeTenantAuthProxyHeaders({
//     tenantId: "20170301-204602655-9ce4db3f-c50a-4d5c-b800-04ba2544947c",
//   }),
// });
