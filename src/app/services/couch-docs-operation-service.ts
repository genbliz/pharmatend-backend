import { JsonWebTokenService } from "./jsonwebtoken-service.js";
import { HttpRequestBase } from "./http-request-base.js";
import { UtilService } from "./util-service.js";
import { envConfig } from "../config/env.js";
import { EncryptionService } from "./encryption-service.js";

export class CouchDocsOperationServiceBase extends HttpRequestBase {
  // http://localhost:5984/_session

  private readonly userName: string;
  private readonly host: string;
  private readonly dbname: string;
  private readonly commonHeaders: Record<string, string> = {
    // "User-Agent": "X-Tend-Pos-002",
  };

  constructor({ host, userName, dbname }: { host: string; dbname: string; userName: string }) {
    super();
    this.host = host;
    this.userName = userName;
    this.dbname = dbname;
  }

  private getUrl(urlParts: string | string[]) {
    const urlParts01 = Array.isArray(urlParts) ? urlParts : [urlParts];
    return [this.host, ...urlParts01].join("/");
  }

  async getAuthJwtHeaders() {
    const headers = { ...this.commonHeaders };

    const authTokenData = await JsonWebTokenService.signTokenWithSecret({
      authSecret: "foo",
      audience: this.userName,
      authData: {
        auth_data: { "_couchdb.roles": [`${this.dbname}_admin`, `${this.dbname}_member`] },
        kid: "foo",
      },
      expiresInSeconds: 60 * 120,
    });
    headers["authorization"] = ["Bearer", authTokenData].join(" ");

    const tkData = await JsonWebTokenService.verifyToken(authTokenData);

    console.log({ tkData });
    return headers;
  }

  private getAuthProxyHeaders() {
    try {
      const encodedData = envConfig.LOCAL_SERVER_COUCH_DB_PROXY_AUTHORIZATION_ENC_TOKEN;
      const tenantId = envConfig.LOCAL_SERVER_LICENSED_TENANT_ID;
      const data01 = EncryptionService.decodeSync(encodedData, tenantId);
      const dataobj = JSON.parse(data01) as { [key: string]: string };
      return dataobj && typeof dataobj === "object" && Object.keys(dataobj).length ? dataobj : null;
    } catch (error) {
      return null;
    }
  }

  async docCreate() {
    const headers = this.getAuthProxyHeaders();

    const newId = UtilService.getUUID();

    const { response } = await this.request({
      url: this.getUrl(this.dbname),
      method: "POST",
      headers,
      data: {
        _id: ["person", newId].join(":"),
        id: newId,
        name: "Chris",
        title: "Software Engineer Expert",
      },
    });

    return await response.json();
  }
}

const CouchDocsOperationService = new CouchDocsOperationServiceBase({
  host: "http://127.0.0.1:5984",
  dbname: "sale_pay_point",
  userName: "chris_03",
});

CouchDocsOperationService.docCreate()
  .then((e) => {
    console.log(e);
  })
  .catch((e) => {
    console.log(e);
  });
