import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
class FileOperationServiceBase {
    DEFINED_MIME_TYPES = [
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
        ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
        ["application/rtf", "rtf"],
        ["application/pdf", "pdf"],
        ["application/json", "json"],
        ["image/gif", "gif"],
        ["image/jpeg", "jpg"],
        ["image/png", "png"],
        ["image/bmp", "bmp"],
        ["text/plain", "txt"],
        ["text/csv", "csv"],
    ];
    getFileExtensionFromMimeType(mimeType) {
        const mime = this.DEFINED_MIME_TYPES.find((item) => {
            return item[0] === mimeType;
        });
        return mime ? mime[1] : null;
    }
    getSupportedMimeTypes() {
        return this.DEFINED_MIME_TYPES.map((item) => item[0]);
    }
    fileOrDirectoryExists(fullPath) {
        try {
            fs.accessSync(fullPath, fs.constants.F_OK);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async appendFile({ absolutefileNameWithExtention, data, recursive, }) {
        if (recursive) {
            const folderPath = path.dirname(absolutefileNameWithExtention);
            await fs.promises.mkdir(folderPath, { recursive: true });
        }
        await fs.promises.appendFile(absolutefileNameWithExtention, data, { encoding: "utf-8" });
        return await Promise.resolve(true);
    }
    async writeFile({ absolutefileNameWithExtention, data, recursive, }) {
        if (recursive) {
            const folderPath = path.dirname(absolutefileNameWithExtention);
            await fs.promises.mkdir(folderPath, { recursive: true });
        }
        await fs.promises.writeFile(absolutefileNameWithExtention, data, { encoding: "utf-8" });
        return await Promise.resolve(true);
    }
    readFile(absolutefileNameWithExtention) {
        return new Promise((resolve, reject) => {
            fs.readFile(absolutefileNameWithExtention, { encoding: "utf8" }, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    async readFileLineByLine(filePath, handleReadContent) {
        const readLine = createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity,
        });
        for await (const content of readLine) {
            handleReadContent({ content, isDone: false });
        }
        handleReadContent({ isDone: true, content: null });
    }
    createDirectoryIfNotExists_ReturnsTrueIfCreatedOrExists(absoluteDirectoryName) {
        return new Promise((resolve, reject) => {
            if (!this.fileOrDirectoryExists(absoluteDirectoryName)) {
                this.createDirectoryRecursive(absoluteDirectoryName)
                    .then((done) => {
                    resolve(done);
                })
                    .catch(() => {
                    reject("NOT Created or Exists");
                });
            }
            else {
                resolve(true);
            }
        });
    }
    createDirectoryRecursive(absoluteDirectoryName) {
        return new Promise((resolve, reject) => {
            fs.mkdir(absoluteDirectoryName, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    removeFilesAndFoldersRecursively(absoluteDirectoryName) {
        return new Promise((resolve, reject) => {
            fs.rm(absoluteDirectoryName, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    async listAbsoluteFilePathsInADirectory({ absoluteDirectoryName, includeSubDirectory, }) {
        const filesData = [];
        const doListFile = async (dirStr) => {
            const files = await fs.promises.readdir(dirStr, { withFileTypes: true });
            if (files?.length) {
                for (const f of files) {
                    if (f.isFile()) {
                        filesData.push({
                            relativePath: f.name,
                            absolutePath: path.resolve(dirStr, f.name),
                        });
                    }
                    else if (f.isDirectory() && includeSubDirectory) {
                        await doListFile(path.resolve(dirStr, f.name));
                    }
                }
            }
        };
        await doListFile(absoluteDirectoryName);
        return filesData;
    }
    async listFilePathsInADirectory(absoluteDirectoryName) {
        const files = [];
        const filesData = await fs.promises.readdir(absoluteDirectoryName, { withFileTypes: true });
        if (filesData.length) {
            filesData.forEach((f) => {
                if (f.isFile()) {
                    files.push(f.name);
                }
            });
        }
        return files;
    }
    deleteFile(absoluteFileDirectoryName) {
        return new Promise((resolve, reject) => {
            if (!this.fileOrDirectoryExists(absoluteFileDirectoryName)) {
                reject("File does NOT exists.");
            }
            else {
                fs.unlink(absoluteFileDirectoryName, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                });
            }
        });
    }
    async base64ImageToFile({ base64str, absoluteFileNameWithExtention, }) {
        const bitmap = Buffer.from(base64str, "base64");
        await fs.promises.writeFile(absoluteFileNameWithExtention, bitmap);
    }
    isAudio(filepath) {
        return new Set(this.getAudioExtensions()).has(path.extname(filepath).slice(1).toLowerCase());
    }
    getAudioExtensions() {
        const audioExtensions = new Set([
            "wav",
            "bwf",
            "raw",
            "aiff",
            "flac",
            "m4a",
            "pac",
            "tta",
            "wv",
            "ast",
            "aac",
            "mp2",
            "mp3",
            "mp4",
            "amr",
            "s3m",
            "3gp",
            "act",
            "au",
            "dct",
            "dss",
            "gsm",
            "m4p",
            "mmf",
            "mpc",
            "ogg",
            "oga",
            "opus",
            "ra",
            "sln",
            "vox",
        ]);
        return Array.from(audioExtensions);
    }
    isVideo(filepath) {
        const exts = Object.create(null);
        this.getVideoExtensions().forEach((el) => {
            exts[el] = true;
        });
        return path.extname(filepath).slice(1).toLowerCase() in exts;
    }
    getVideoExtensions() {
        const videoExtensions = [
            "3g2",
            "3gp",
            "aaf",
            "asf",
            "avchd",
            "avi",
            "drc",
            "flv",
            "m2v",
            "m3u8",
            "m4p",
            "m4v",
            "mkv",
            "mng",
            "mov",
            "mp2",
            "mp4",
            "mpe",
            "mpeg",
            "mpg",
            "mpv",
            "mxf",
            "nsv",
            "ogg",
            "ogv",
            "qt",
            "rm",
            "rmvb",
            "roq",
            "svi",
            "vob",
            "webm",
            "wmv",
            "yuv",
        ];
        return [...videoExtensions];
    }
    isImage(filePath) {
        return new Set(this.getImageExtensions()).has(path.extname(filePath).slice(1).toLowerCase());
    }
    getImageExtensions() {
        const imageExtensions = new Set([
            "3dv",
            "ai",
            "amf",
            "art",
            "ase",
            "awg",
            "blp",
            "bmp",
            "bw",
            "cd5",
            "cdr",
            "cgm",
            "cit",
            "cmx",
            "cpt",
            "cr2",
            "cur",
            "cut",
            "dds",
            "dib",
            "djvu",
            "dxf",
            "e2d",
            "ecw",
            "egt",
            "emf",
            "eps",
            "exif",
            "fs",
            "gbr",
            "gif",
            "gpl",
            "grf",
            "hdp",
            "heic",
            "heif",
            "icns",
            "ico",
            "iff",
            "int",
            "inta",
            "jfif",
            "jng",
            "jp2",
            "jpeg",
            "jpg",
            "jps",
            "jxr",
            "lbm",
            "liff",
            "max",
            "miff",
            "mng",
            "msp",
            "nef",
            "nitf",
            "nrrd",
            "odg",
            "ota",
            "pam",
            "pbm",
            "pc1",
            "pc2",
            "pc3",
            "pcf",
            "pct",
            "pcx",
            "pdd",
            "pdn",
            "pgf",
            "pgm",
            "PI1",
            "PI2",
            "PI3",
            "pict",
            "png",
            "pnm",
            "pns",
            "ppm",
            "psb",
            "psd",
            "psp",
            "px",
            "pxm",
            "pxr",
            "qfx",
            "ras",
            "raw",
            "rgb",
            "rgba",
            "rle",
            "sct",
            "sgi",
            "sid",
            "stl",
            "sun",
            "svg",
            "sxd",
            "tga",
            "tif",
            "tiff",
            "v2d",
            "vnd",
            "vrml",
            "vtf",
            "wdp",
            "webp",
            "wmf",
            "x3d",
            "xar",
            "xbm",
            "xcf",
            "xpm",
        ]);
        return Array.from(imageExtensions);
    }
}
export const FileOperationService = new FileOperationServiceBase();
//# sourceMappingURL=file-operation-service.js.map