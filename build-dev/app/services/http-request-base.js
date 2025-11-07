import { URLSearchParams, URL } from "node:url";
class MyHeaders {
    _headers;
    constructor() {
        this._headers = new Map();
    }
    append(name, value) {
        if (!name) {
            return;
        }
        const name01 = name.toLowerCase().trim();
        this._headers.set(name01, [name, value]);
    }
    remove(name) {
        if (!name) {
            return;
        }
        this._headers.delete(name.toLowerCase().trim());
    }
    has(name) {
        return this._headers.has(name.toLowerCase().trim());
    }
    toJSON() {
        const serialized = {};
        this._headers.forEach((values, _) => {
            if (values?.length === 2) {
                serialized[values[0]] = values[1];
            }
        });
        return serialized;
    }
}
export class HttpRequestBase {
    async request({ url, data, form, method, params, headers }) {
        const appHeaders = new MyHeaders();
        appHeaders.append("Content-Type", "application/json; charset=utf-8");
        appHeaders.append("Accept", "application/json");
        let body01 = undefined;
        if (method !== "GET") {
            if (data) {
                body01 = JSON.stringify(data);
            }
            else if (form && typeof form === "object") {
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
        }
        else if (headers && typeof headers === "object" && Object.keys(headers).length) {
            Object.entries(headers).forEach(([name, value]) => {
                appHeaders.append(name, value);
            });
        }
        if (body01) {
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
        });
        return {
            response,
            requestData,
        };
    }
    async requestStrict({ url, data, form, method, params, headers }) {
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
    async requestJson({ url, data, form, method, params, headers }) {
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
        return (await response.json());
    }
    formatParams(params) {
        try {
            if (params && typeof params === "object" && Object.keys(params).length) {
                const params01 = {};
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== "") {
                        params01[key] = String(value);
                    }
                });
                if (Object.keys(params01).length) {
                    return params01;
                }
            }
        }
        catch (error) {
        }
        return undefined;
    }
    joinUrlAndParams({ url, params }) {
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
//# sourceMappingURL=http-request-base.js.map