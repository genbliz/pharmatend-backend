import busboy from "busboy";
import fs from "node:fs";
import path from "node:path";
import { UtilService } from "./util-service.js";
import { FileOperationService } from "./file-operation-service.js";
class FormDataUploadRequestServiceBase {
    busboyGetBodyFieldData(req) {
        return new Promise((resolve, reject) => {
            const _fielResultsData = {};
            const busboy0 = busboy({
                headers: req.headers,
            });
            busboy0.on("field", (filename, val, fieldTruncated, valTruncated, encoding, mimetype) => {
                _fielResultsData[filename] = val;
            });
            busboy0.on("finish", () => {
                resolve(_fielResultsData);
            });
            req.pipe(busboy0);
        });
    }
    busboyUploadBase(req, saveToFolderPath) {
        return new Promise((resolve, reject) => {
            try {
                const fileSizeLimit = 100 * 1024 * 1024;
                const busboy01 = busboy({
                    headers: req.headers,
                    limits: {
                        fileSize: fileSizeLimit,
                    },
                });
                const _fileResultsData = [];
                const _errorsData = [];
                const _fieldsResultsData = {};
                busboy01.on("field", (filename, val, fieldTruncated, valTruncated, encoding, mimetype) => {
                    _fieldsResultsData[filename] = val;
                });
                busboy01.on("file", (fieldname, file, filename, encoding, mimetype) => {
                    console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
                    const fileChunks = [];
                    let _result = {};
                    const fileExt = FileOperationService.getFileExtensionFromMimeType(mimetype) || "";
                    if (fileExt) {
                        _result = {
                            ext: fileExt,
                            fileName: `${UtilService.getUUID()}.${fileExt}`,
                            encoding,
                            originalFileName: filename,
                            fieldName: fieldname,
                            mimeType: mimetype,
                        };
                        if (saveToFolderPath) {
                            _result.uploadFolderDir = saveToFolderPath;
                            _result.uploadFilePath = path.resolve(saveToFolderPath, _result.fileName);
                            file.pipe(fs.createWriteStream(_result.uploadFilePath));
                        }
                    }
                    else {
                        _errorsData.push(`Invalid file MimeType [ ${mimetype} ]`);
                    }
                    file.on("data", (data) => {
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
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async getUploadData(req) {
        const result = await this.busboyUploadBase(req);
        return result.files;
    }
    async getUploadAndFieldData(req) {
        return await this.busboyUploadBase(req);
    }
    async uploadToPathAndFieldData(req, uploadFolderPath) {
        return await this.busboyUploadBase(req, uploadFolderPath);
    }
}
export const FormDataUploadRequestService = new FormDataUploadRequestServiceBase();
//# sourceMappingURL=formdata-upload-request-service.js.map