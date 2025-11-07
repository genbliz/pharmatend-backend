import { StatusCode } from "@/helper/status-code.js";
import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { Buffer } from "node:buffer";

export interface ISocketRespInfo {
  statusCode?: StatusCode;
  body?: string;
}

export const LambdaHelperService = (() => {
  return {
    successfullResponse({ statusCode, body }: ISocketRespInfo = {}): APIGatewayProxyResultV2 {
      const statusCode01 =
        statusCode && typeof statusCode === "number" && statusCode >= 200 && statusCode < 300
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

    successfullResponsePdf({ pdfBase64, filename }: { pdfBase64: string; filename: string }): APIGatewayProxyResultV2 {
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

    failureResponse({ statusCode, body }: ISocketRespInfo = {}): APIGatewayProxyResultV2 {
      const statusCode01 =
        statusCode && typeof statusCode === "number" && statusCode >= 300
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
