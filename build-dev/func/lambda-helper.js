import { Buffer } from "node:buffer";
import { StatusCode } from "@/helpers/status-code.js";
export const LambdaHelperService = (() => {
    return {
        successfullResponse({ statusCode, body } = {}) {
            const statusCode01 = statusCode && typeof statusCode === "number" && statusCode >= 200 && statusCode < 300
                ? statusCode
                : StatusCode.OK_200;
            return {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                statusCode: statusCode01,
                body: body && typeof body === "string" ? body : "Ok",
            };
        },
        successfullResponsePdf({ pdfBase64, filename }) {
            const response = {
                statusCode: 200,
                headers: {
                    "Content-Length": Buffer.byteLength(pdfBase64, "base64"),
                    "Content-Type": "application/pdf",
                    "Content-disposition": `attachment;filename=${filename}.pdf`,
                },
                isBase64Encoded: true,
                body: pdfBase64,
            };
            return response;
        },
        failureResponse({ statusCode, body } = {}) {
            const statusCode01 = statusCode && typeof statusCode === "number" && statusCode >= 300
                ? statusCode
                : StatusCode.InternalServerError_500;
            return {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                statusCode: statusCode01,
                body: body && typeof body === "string" ? body : "Failed",
            };
        },
    };
})();
//# sourceMappingURL=lambda-helper.js.map