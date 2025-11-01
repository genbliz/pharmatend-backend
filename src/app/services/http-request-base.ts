import { URLSearchParams, URL } from "node:url";
import fetch from "node-fetch";

type IParams = Record<string, string | boolean | undefined | null> | undefined | null;

type IMethod = "GET" | "POST" | "PUT" | "DELETE";

export type IRequestBaseOptions = {
  url: string;
  data?: Record<string, any> | Record<string, any>[];
  form?: Record<string, any>;
  method: IMethod;
  params?: IParams;
  headers?: Record<string, string> | string[][] | null | undefined;
};

class MyHeaders {
  private readonly _headers: Map<string, string[]>;

  constructor() {
    this._headers = new Map();
  }

  append(name: string, value: string) {
    if (!name) {
      return;
    }
    const name01 = name.toLowerCase().trim();
    this._headers.set(name01, [name, value]);
  }

  remove(name: string) {
    if (!name) {
      return;
    }
    this._headers.delete(name.toLowerCase().trim());
  }

  has(name: string) {
    return this._headers.has(name.toLowerCase().trim());
  }

  toJSON() {
    const serialized: { [header: string]: string } = {};
    this._headers.forEach((values, _) => {
      if (values?.length === 2) {
        serialized[values[0]] = values[1];
      }
    });
    return serialized;
  }
}

export class HttpRequestBase {
  async request({ url, data, form, method, params, headers }: IRequestBaseOptions) {
    const appHeaders = new MyHeaders();

    appHeaders.append("Content-Type", "application/json; charset=utf-8");
    appHeaders.append("Accept", "application/json");

    let body01: string | undefined = undefined;

    if (method !== "GET") {
      if (data) {
        body01 = JSON.stringify(data);
      } else if (form && typeof form === "object") {
        // let bodyData = `username=${name}&password=${password}`
        body01 = Object.entries(form)
          .map(([key, val]) => `${key}=${val}`)
          .join("&");
        appHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
      }
    }

    if (headers && Array.isArray(headers) && headers.length) {
      headers.forEach(([name, value]) => {
        appHeaders.append(name, value);
      });
    } else if (headers && typeof headers === "object" && Object.keys(headers).length) {
      Object.entries(headers).forEach(([name, value]) => {
        appHeaders.append(name, value);
      });
    }

    if (body01) {
      // appHeaders.append("Accept-Encoding", "deflate, gzip");
      // appHeaders.append("Content-Length", Buffer.byteLength(body01).toString());
    }

    const params01 = this.formatParams(params);
    const fullUrl = this.joinUrlAndParams({ url, params: params01 });
    const requestHeaders = appHeaders.toJSON();

    const requestData = {
      fullUrl,
      headers: requestHeaders,
      parsedParams: params01,
      body: body01,
      method,
    };

    console.log({ requestData });

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body01,
      // keepalive: true,
    });

    return {
      response,
      requestData,
    };
  }

  async requestStrict({ url, data, form, method, params, headers }: IRequestBaseOptions) {
    const { response } = await this.request({
      url,
      data,
      form,
      method,
      params,
      headers,
    });
    if (!response.ok) {
      const r = await response.json();
      return await Promise.reject(r);
    }
    return response;
  }

  async requestJson<T = unknown>({ url, data, form, method, params, headers }: IRequestBaseOptions): Promise<T> {
    const { response } = await this.request({
      url,
      data,
      form,
      method,
      params,
      headers,
    });
    if (!response.ok) {
      const r = await response.json();
      return await Promise.reject(r);
    }
    return (await response.json()) as T;
  }

  private formatParams(params: IParams) {
    try {
      if (params && typeof params === "object" && Object.keys(params).length) {
        const params01: Record<string, string> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params01[key] = String(value);
          }
        });
        if (Object.keys(params01).length) {
          return params01;
        }
      }
    } catch (error) {
      // LoggingService.error(error);
    }
    return undefined;
  }

  private joinUrlAndParams({ url, params }: { url: string; params: Record<string, string> | undefined }) {
    if (!(params && typeof params === "object" && Object.keys(params).length)) {
      return url;
    }
    const param01 = new URLSearchParams(params);

    const url01 = new URL(url);

    param01.forEach((value, name) => {
      url01.searchParams.append(name, value);
    });

    return url01.toString();
  }
}
