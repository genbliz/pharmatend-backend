import busboy from "busboy";
import fs from "node:fs";
import path from "node:path";
import { Request } from "express";
import { UtilService } from "./util-service";
import { FileOperationService } from "./file-operation-service";

interface IUploadBaseResult {
  originalFileName: string;
  fileName: string;
  fieldName: string;
  encoding: string;
  mimeType: string;
}

export interface IBusboyMultipartResult extends IUploadBaseResult {
  fileData: Buffer;
  ext: string;
  //
  uploadFilePath?: string;
  uploadFolderDir?: string;
  // size: number;
}

export interface IBusboyResult<T> {
  fields: T;
  files: IBusboyMultipartResult[];
  errors: string[];
}

class FormDataUploadRequestServiceBase {
  busboyGetBodyFieldData<T>(req: Request) {
    return new Promise<T>((resolve, reject) => {
      const _fielResultsData: T = {} as any;
      const busboy0 = busboy({
        headers: req.headers,
      });
      //@ts-ignore
      busboy0.on("field", (filename, val, fieldTruncated, valTruncated, encoding, mimetype) => {
        //@ts-ignore
        _fielResultsData[filename] = val;
      });
      busboy0.on("finish", () => {
        resolve(_fielResultsData);
      });
      req.pipe(busboy0);
    });
  }

  private busboyUploadBase<T = any>(req: Request, saveToFolderPath?: string) {
    return new Promise<IBusboyResult<T>>((resolve, reject) => {
      try {
        //
        const fileSizeLimit = 100 * 1024 * 1024;
        const busboy01 = busboy({
          headers: req.headers,
          limits: {
            fileSize: fileSizeLimit,
          },
        });

        const _fileResultsData: IBusboyMultipartResult[] = [];
        const _errorsData: string[] = [];
        const _fieldsResultsData: T = {} as any;

        //@ts-ignore
        busboy01.on("field", (filename, val, fieldTruncated, valTruncated, encoding, mimetype) => {
          //@ts-ignore
          _fieldsResultsData[filename] = val;
        });

        //@ts-ignore
        busboy01.on("file", (fieldname, file, filename, encoding, mimetype) => {
          console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
          const fileChunks: Buffer[] = [];
          let _result = {} as IBusboyMultipartResult;
          const fileExt = FileOperationService.getFileExtensionFromMimeType(mimetype) || "";

          if (fileExt) {
            _result = {
              ext: fileExt,
              fileName: `${UtilService.getUUID()}.${fileExt}`,
              encoding,
              originalFileName: /* filename.replace(/ /g, "_") */ filename,
              fieldName: fieldname,
              mimeType: mimetype,
            } as IBusboyMultipartResult;

            if (saveToFolderPath) {
              _result.uploadFolderDir = saveToFolderPath;
              _result.uploadFilePath = path.resolve(saveToFolderPath, _result.fileName);
              file.pipe(fs.createWriteStream(_result.uploadFilePath));
            }
          } else {
            _errorsData.push(`Invalid file MimeType [ ${mimetype} ]`);
          }

          //@ts-ignore
          file.on("data", (data) => {
            // console.log({ instanceofBuffer: data instanceof Buffer });
            // console.log({ typeOfFileData: typeof data });
            // console.log({ fileData: data });
            fileChunks.push(data);
          });
          file.on("end", () => {
            if (_result.ext) {
              _result.fileData = Buffer.concat(fileChunks);
              _fileResultsData.push(_result);
            }
          });
        });
        busboy01.on("finish", () => {
          resolve({
            fields: _fieldsResultsData,
            files: _fileResultsData,
            errors: _errorsData,
          });
        });
        req.pipe(busboy01);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getUploadData(req: Request) {
    const result = await this.busboyUploadBase(req);
    return result.files;
  }

  async getUploadAndFieldData<T = any>(req: Request) {
    return await this.busboyUploadBase<T>(req);
  }

  async uploadToPathAndFieldData<T = any>(req: Request, uploadFolderPath: string) {
    return await this.busboyUploadBase<T>(req, uploadFolderPath);
  }
}

export const FormDataUploadRequestService = new FormDataUploadRequestServiceBase();
