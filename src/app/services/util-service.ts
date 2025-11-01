import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import net from "node:net";
import { randomFillSync, createHash, randomUUID } from "node:crypto";
import { createGzip, createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
//
import appRoot from "app-root-path";
import validator from "validator";
import isOnline from "is-online";
import Papa from "papaparse";
import ip from "ip";
import Joi from "joi";
import { CountryCode, findNumbers, getCountryCallingCode, getCountries, isValidPhoneNumber } from "libphonenumber-js";
import { customAlphabet } from "nanoid";
import lodash from "lodash";
import xmldom from "xmldom";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

class UtilServiceBase {
  convertHexadecimalToNumber(hexString: string) {
    return parseInt(hexString, 16);
  }

  toSha256(inputData: string) {
    return createHash("sha256").update(inputData).digest("hex");
  }

  getFullPathFromRoot(fileOrDirPath: string) {
    const cwd = process.cwd();
    const rootFiles = [
      //
      "app-deploy-root.txt",
      "app-root-path.txt",
      "app-root.txt",
      "root-path.txt",
      "package.json",
    ];
    const anyExists = rootFiles.some((fileName) => fs.existsSync(path.resolve(cwd, fileName)));
    if (anyExists) {
      return path.resolve(cwd, fileOrDirPath);
    }
    return path.resolve(appRoot.path, fileOrDirPath);
  }

  chunk<T>(arr: T[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  }

  getUUID() {
    return randomUUID();
  }

  async getRandomTempDirectory() {
    const tempDir = path.resolve(os.tmpdir(), this.getUUID());
    await fs.promises.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  getRandomHexString() {
    return randomFillSync(Buffer.alloc(16)).toString("hex");
  }

  getFileExtention(filePathOrFilename: string) {
    return path.extname(filePathOrFilename);
  }

  camelCaseToSentenceCase(text: string) {
    const result = text.replace(/([A-Z])/g, " $1");
    const rst = result.charAt(0).toUpperCase() + result.slice(1);
    return rst.trim();
  }

  toTitleCase(text: string) {
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    });
  }

  /**
   * Converts string into snake_case.
   *
   */
  snakeCase(str: string) {
    return (
      str
        // ABc -> a_bc
        .replace(/([A-Z])([A-Z])([a-z])/g, "$1_$2$3")
        // aC -> a_c
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase()
    );
  }

  /**
   * Converts string into camelCase.
   *
   * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
   */
  toCamelCase(str: string) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  isValidEmail(email: string) {
    try {
      return validator.isEmail(email);
    } catch (error) {
      return false;
    }
  }

  async joiValidate({ schema, data }: { schema: any; data: any }) {
    const { value, error } = Joi.object(schema).validate(data, { stripUnknown: true });
    return Promise.resolve({
      value,
      error,
    });
  }

  async formatNigerianPhoneNosForBulkSms({ phoneNos }: { phoneNos: string[] }) {
    const validNos = new Set<string>();
    for (const phone of phoneNos) {
      const resultData = await this.validateFormatNigeriaGsmPhoneNumber(phone);
      if (resultData?.internationalNumber) {
        validNos.add(resultData.internationalNumber);
      }
    }
    return Array.from(validNos);
  }

  getCountriesAndCallingCodes() {
    const data = getCountries().map((countryCode) => {
      return {
        countryCode: countryCode,
        countryCallingCode: getCountryCallingCode(countryCode),
      };
    });
    return data;
  }

  async validateFormatNigeriaGsmPhoneNumber(gsmPhoneNo: string) {
    if (!gsmPhoneNo) {
      return null;
    }
    const result = await this.findOnePhoneNumberFromText({
      phoneText: gsmPhoneNo,
      defaultCountryCode: "NG",
    });
    if (!result?.nationalNumber) {
      return null;
    }
    if (result.nationalNumber.length !== 10) {
      return null;
    }
    if (!(result.countryCallingCode === "+234" || result.countryCallingCode === "234")) {
      return null;
    }
    if (result.countryCode !== "NG") {
      return null;
    }
    return result;
  }

  async formatOneNigerianGsmPhoneNumberToIntlForSMS(phoneNo: string) {
    const phoneData = await this.validateFormatNigeriaGsmPhoneNumber(phoneNo);
    return phoneData?.internationalNumber || null;
  }

  async formatOneOrManyPhoneNumbersToIntlForSMS({
    phoneNumbers,
    defaultCountryCode,
    validCountryCodes,
    isNigerianMobileOnly,
  }: {
    phoneNumbers: string | string[];
    defaultCountryCode: CountryCode;
    validCountryCodes?: CountryCode[];
    isNigerianMobileOnly?: boolean;
  }) {
    const validPhoneNumbers: string[] = [];
    const inValidPhoneNumbers: string[] = [];

    const phoneNumbers01 = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

    for (const phoneNumber of phoneNumbers01) {
      if (isNigerianMobileOnly) {
        const validPhoneNumber01 = await this.formatOneNigerianGsmPhoneNumberToIntlForSMS(phoneNumber);

        if (validPhoneNumber01) {
          validPhoneNumbers.push(validPhoneNumber01);
        } else {
          inValidPhoneNumbers.push(phoneNumber);
        }
      } else {
        const phone01 = await this.findOnePhoneNumberFromText({
          phoneText: phoneNumber?.trim(),
          defaultCountryCode: defaultCountryCode,
        });

        if (phone01?.internationalNumber) {
          if (validCountryCodes?.length) {
            if (validCountryCodes.includes(phone01.countryCode as CountryCode)) {
              validPhoneNumbers.push(phone01.internationalNumber);
            } else {
              inValidPhoneNumbers.push(phoneNumber);
            }
          } else {
            validPhoneNumbers.push(phone01.internationalNumber);
          }
        } else {
          inValidPhoneNumbers.push(phoneNumber);
        }
      }
    }

    return {
      validPhoneNumbers: this.removeDuplicatesInArray(validPhoneNumbers),
      inValidPhoneNumbers: this.removeDuplicatesInArray(inValidPhoneNumbers),
    };
  }

  async findOnePhoneNumberFromText({
    phoneText,
    defaultCountryCode,
    countryCallingCode,
  }: {
    phoneText: string;
    defaultCountryCode?: CountryCode;
    countryCallingCode?: string;
  }) {
    const [result01] = await this.findPhoneNumbersFromText({
      phoneText,
      defaultCountryCode,
      countryCallingCode,
    });
    return result01?.internationalNumber ? result01 : null;
  }

  async findPhoneNumbersFromText({
    phoneText,
    defaultCountryCode,
    countryCallingCode,
  }: {
    phoneText: string;
    defaultCountryCode?: CountryCode;
    countryCallingCode?: string;
  }) {
    if (!phoneText) {
      return [];
    }

    let defaultCountryCode01: CountryCode | undefined;

    if (defaultCountryCode) {
      defaultCountryCode01 = defaultCountryCode;
    } else if (countryCallingCode) {
      const countryCallingCode01 = countryCallingCode.startsWith("+")
        ? countryCallingCode.slice(1)
        : countryCallingCode;
      const result = this.getCountriesAndCallingCodes().find((f) => f.countryCallingCode === countryCallingCode01);
      if (result?.countryCode) {
        defaultCountryCode01 = result.countryCode;
      }
    }

    const numberFound = findNumbers(phoneText, { defaultCountry: defaultCountryCode01, v2: true });
    if (!numberFound?.length) {
      return [];
    }
    const numberFound01 = numberFound
      .map((pn) => pn.number)
      .map((fn2) => {
        return {
          countryCode: fn2.country?.toString() || "",
          nationalNumber: fn2.nationalNumber.toString(),
          internationalNumber: fn2.number?.toString() || "",
          countryCallingCode: fn2.countryCallingCode.toString(),
        };
      });
    return Promise.resolve(numberFound01);
  }

  async isValidPhoneNumber(phoneText: string, defaultCountryCode?: CountryCode) {
    if (!phoneText) {
      return false;
    }

    const isValid = isValidPhoneNumber(phoneText, defaultCountryCode || "NG");

    if (!isValid) {
      return false;
    }
    return Promise.resolve(true);
  }

  isValidEmailRegex(email: string) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  isLikeStreetAddress(address: string) {
    const validaddress = /^\d.*$/;
    const validContent = /[A-Za-z].{2,}$/;

    const address01 = String(address).toLowerCase();
    const hasValidStarter =
      validaddress.test(address01) ||
      address01.startsWith("No.") ||
      address01.startsWith("No,") ||
      address01.startsWith("No ");

    const keyWords = `Avenue|Lane|Road|Boulevard|Drive|Street|Close|Bus stop|Bustop|Off|Ave|Dr|Rd|Blvd|Ln|St|Cl`
      .toLowerCase()
      .split("|");

    const hasKeyWords = keyWords.some((f) => address01.includes(f));
    const hasValidContent = validContent.test(address01);

    return hasValidStarter && (hasKeyWords || hasValidContent);
  }

  async isDeviceOnline() {
    return await isOnline();
  }

  isPortAvailable(port: number) {
    return new Promise<boolean>((resolve, reject) => {
      const tester = net
        .createServer()
        .once("error", (err: any) => {
          if (err.code !== "EADDRINUSE") {
            reject(err);
          } else {
            resolve(false);
          }
        })
        .once("listening", () => {
          tester.once("close", () => resolve(true)).close();
        })
        .listen(port);
    });
  }

  stringToBase64(str: string) {
    return Buffer.from(str).toString("base64");
  }

  fromBase64ToString(base64: string) {
    return Buffer.from(base64, "base64").toString("utf8");
  }

  objectHasAnyProperty(obj: Record<string, any>): boolean {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        return false;
      }
      return Object.keys(obj).length > 0;
    }
    return false;
  }

  convertObjectToJsonPlainObject<T = Record<string, any>>(objData: T) {
    const objDataPlain: T = JSON.parse(JSON.stringify(objData));
    return objDataPlain;
  }

  removeDuplicatesInArray<T extends string | number>(items: T[]) {
    if (!Array.isArray(items)) {
      return [];
    }
    return Array.from(new Set(items));
  }

  stringOrNumberHasDuplicate(strItems: (string | number)[]) {
    if (!Array.isArray(strItems)) {
      return false;
    }
    const dupDict: Record<string, number> = {};
    strItems.forEach((val) => {
      const val01 = val.toString();
      if (dupDict[val01] === undefined) {
        dupDict[val01] = 1;
      } else {
        dupDict[val01] += 1;
      }
    });
    const isDup = Object.entries(dupDict).some(([_, val]) => val > 1);
    return isDup;
  }

  shuffleArray<T>(o: T[]) {
    for (
      let j: number, x: any, i = o.length;
      i;
      j = parseInt(`${Math.random() * i}`, 10), x = o[--i], o[i] = o[j], o[j] = x
    ) {
      //
    }
    return o;
  }

  replaceEmptySpaces(strValue: string, replacement: string) {
    return strValue
      .split(" ")
      .filter((x) => x !== "")
      .join(replacement);
  }

  waitUntilMilliseconds(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  dataObjectToUrlEncoded(objectData: Record<string, any>): string | null {
    if (!(objectData && typeof objectData === "object")) {
      return null;
    }
    const paramsParts = Object.keys(objectData)
      .filter((key1) => {
        return objectData[key1] !== undefined && objectData[key1] != null;
      })
      .filter((key11) => {
        // remove empty arrays
        return !Array.isArray(objectData[key11]) || (Array.isArray(objectData[key11]) && objectData[key11].length > 0);
      })
      .map((key111) => {
        // join arrays as comma seperated strings
        const i = objectData[key111];
        if (Array.isArray(i)) {
          return { key: key111, value: i.join(",") };
        }
        return { key: key111, value: objectData[key111] };
      })
      .map((entry: { key: string; value: string }) => {
        return `${entry.key}=${entry.value}`;
      });

    if (paramsParts && paramsParts.length) {
      return paramsParts.join("&");
    }
    return null;
  }

  getFullUrlStringFromParamObject({ url, paramObject }: { url: string; paramObject: Record<string, any> }): string {
    const encodedUrl = this.dataObjectToUrlEncoded(paramObject);
    if (encodedUrl && encodedUrl.length) {
      return url + "?" + encodedUrl;
    }
    return url;
  }

  deleteKeysFromObject<T = Record<string, any>>({
    dataObject,
    delKeys,
  }: {
    dataObject: T;
    delKeys: (keyof T | string)[];
  }): T {
    if (!(dataObject && typeof dataObject === "object")) {
      return dataObject;
    }
    if (Array.isArray(dataObject)) {
      return dataObject;
    }
    const chosenDataObject: any = {};
    const delKeysGrouped = this.groupOneBy(delKeys, (f) => f as string);

    Object.entries(dataObject).forEach(([key, value]) => {
      if (!delKeysGrouped[key]) {
        chosenDataObject[key] = value;
      }
    });
    return chosenDataObject;
  }

  pickFromObject<T = Record<string, any>>({ dataObject, pickKeys }: { dataObject: T; pickKeys: (keyof T)[] }): T {
    if (!(dataObject && typeof dataObject === "object")) {
      return dataObject;
    }
    if (Array.isArray(dataObject)) {
      return dataObject;
    }
    const chosenDataObject: any = {};
    const allKeys = Object.keys(dataObject);
    const allKeysGrouped = this.groupOneBy(allKeys, (f) => f);

    pickKeys.forEach((key) => {
      if (allKeysGrouped[key as string] !== undefined) {
        chosenDataObject[key] = dataObject[key];
      }
    });
    return chosenDataObject;
  }

  getRandomString(count: number) {
    const alphabets = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const nanoid01 = customAlphabet(alphabets, count);
    return nanoid01();
  }

  getRandomNumber(count: number) {
    const alphabets = "0123456789";
    const nanoid01 = customAlphabet(alphabets, count);
    return nanoid01();
  }

  getShortId() {
    return this.getRandomString(8);
  }

  timeoutHolder: Record<string, any> = {};
  debounceAdvanced(id: string, wait: number, cb: () => void) {
    if (this.timeoutHolder[id]) {
      clearTimeout(this.timeoutHolder[id]);
    }
    this.timeoutHolder[id] = setTimeout(() => {
      cb();
    }, wait);
  }

  csv2JsonParseFileOrStringOrStream<T>(csvFileOrStringOrStream: string | File | NodeJS.ReadableStream) {
    return new Promise<T[]>((resolve, reject) => {
      if (!csvFileOrStringOrStream) {
        reject("Invalid csv input");
        return;
      }
      Papa.parse<any, File | NodeJS.ReadableStream>(csvFileOrStringOrStream as any, {
        skipEmptyLines: true,
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  jsonToCsvParse<T>({ jsonData, fields }: { jsonData: T[]; fields: string[] | (keyof T)[] }) {
    // https://www.papaparse.com/docs#json-to-csv
    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        try {
          const csv = Papa.unparse(
            { data: jsonData, fields: fields as string[] },
            {
              header: true,
              quotes: true, // or array of booleans
              quoteChar: '"',
              escapeChar: '"',
              delimiter: ",",
              newline: "\r\n",
            },
          );
          resolve(csv);
        } catch (err) {
          reject(err);
        }
      }, 2);
    });
  }

  imageToBase64Encode(fileFullPath: string) {
    const bitmap = fs.readFileSync(fileFullPath);
    return Buffer.from(bitmap).toString("base64");
  }

  groupOneBy<T>(dataList: T[], fn: (dt: T) => string | number) {
    const aggr: Record<string, T> = {};
    if (dataList?.length) {
      dataList.forEach((data) => {
        const groupId = fn(data);
        if (aggr[groupId] === undefined) {
          aggr[groupId] = data;
        }
      });
    }
    return aggr;
  }

  groupBy<T>(dataList: T[], fn: (dt: T) => string | number) {
    const aggr: Record<string, T[]> = {};
    if (dataList?.length) {
      dataList.forEach((data) => {
        const groupId = fn(data);
        if (!aggr[groupId]) {
          aggr[groupId] = [];
        }
        aggr[groupId].push(data);
      });
    }
    return aggr;
  }

  orderBy<T>(dataList: T[], fn: (dt: T) => string | number, order?: "asc" | "desc") {
    return lodash.orderBy(dataList, (f) => fn(f), order || "asc");
  }

  getComputerIpAddress() {
    return new Promise<string>((resolve, reject) => {
      try {
        const address = ip.address();
        resolve(address);
      } catch (error) {
        reject();
      }
    });
  }

  isUUID(str: string) {
    try {
      return validator.isUUID(str);
    } catch (error) {
      return false;
    }
  }

  isNumeric(n: string | number | null | undefined) {
    if (n === null || typeof n === "undefined" || typeof n === "boolean") {
      return false;
    }
    const nn = String(n);
    if (nn.trim() && !isNaN(Number(nn)) && isFinite(Number(nn)) && !isNaN(parseFloat(nn))) {
      return true;
    }
    return false;
  }

  isNumericPositiveInteger(n: string | number | null | undefined) {
    const nn = String(n);
    const numberOnly = /^\d+$/.test(nn);
    if (!numberOnly) {
      return false;
    }
    if (!this.isNumeric(n)) {
      return false;
    }
    if (Number(n).toString().includes(".")) {
      return false;
    }
    const mInt = parseInt(Number(n).toString());
    if (mInt >= 1) {
      return true;
    }
    return false;
  }

  async doGzip({ inputFile, outputFile }: { inputFile: string; outputFile: string }) {
    const gzip = createGzip();
    const source = fs.createReadStream(inputFile);
    const destination = fs.createWriteStream(outputFile);
    await pipeline(source, gzip, destination);
  }

  async doUnGzip({ gzippedFilePath, outputFilePath }: { gzippedFilePath: string; outputFilePath: string }) {
    const ungzip = createGunzip();
    const source = fs.createReadStream(gzippedFilePath);
    const destination = fs.createWriteStream(outputFilePath);
    await pipeline(source, ungzip, destination);
  }

  slugify(text: string, seperator = "_") {
    const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;".split("");
    const to = "aaaaaeeeeeiiiiooooouuuunc------".split("");

    let newText = text.toString().toLowerCase().trim();

    from.forEach((_, i) => {
      newText = newText.replace(new RegExp(from[i], "g"), to[i]);
    });

    newText = newText
      .replace(/\s+/g, "-")
      .replace(/&/g, "and")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");

    return newText.split("-").join(seperator).trim();
  }

  thousanizeCurrency(currencyValue: number): string {
    if (!(typeof currencyValue !== "string" || typeof currencyValue !== "number")) {
      return "";
    }
    const [numberPart, decimalPart] = currencyValue.toString().split(".");
    let thousanized = numberPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimalPart) {
      thousanized = `${thousanized}.${decimalPart.padEnd(2, "0")}`;
    }
    return thousanized;
  }

  memoize<T extends (...args: Parameters<T>) => any>(cb: T) {
    const cache = new Map();
    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = cb(...args);
      cache.set(key, result);
      return result;
    };
  }

  pluck<T>(arrayList: T[], key: keyof T) {
    return arrayList.map((item) => item[key]);
  }

  async generateBarcode_svg({ input, displayValue = false }: { input: string; displayValue?: boolean }) {
    const xmlSerializer = new xmldom.XMLSerializer();
    const xmlDocument = new xmldom.DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null);
    const svgNode = xmlDocument.createElementNS("http://www.w3.org/2000/svg", "svg");

    JsBarcode(svgNode, input, { xmlDocument, displayValue });

    const svgText = xmlSerializer.serializeToString(svgNode);
    return await Promise.resolve(svgText);
  }

  generateQrcode_png({ input, width, margin }: { input: string; width?: number; margin?: number }) {
    return new Promise<Buffer>((resolve, reject) => {
      QRCode.toBuffer(input, { type: "png", width, margin }, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }

  isObjectHasEqualProps(obj1: Record<string, any>, obj2: Record<string, any>) {
    // get the properties of each object
    const obj1Props = Object.getOwnPropertyNames(obj1);
    const obj2Props = Object.getOwnPropertyNames(obj2);

    // if the objects have a different number of properties, they are not equal
    if (obj1Props.length !== obj2Props.length) {
      return false;
    }

    // compare the properties of each object
    for (let i = 0; i < obj1Props.length; i++) {
      const propName = obj1Props[i];
      if (obj1[propName] !== obj2[propName]) {
        return false;
      }
    }

    // if all properties are equal, the objects are equal
    return true;
  }

  toHex(str: string) {
    return Buffer.from(str).toString("hex");
  }

  fromHex(hexStr: string) {
    return Buffer.from(hexStr, "hex").toString();
  }

  parseCookieString(cookieString: string) {
    type ICookie = {
      AuthSession: string;
      Version: string | number;
      Expires: string;
      "Max-Age": string | number;
      Path: string;
    };

    const cookieObject = cookieString
      .split(";")
      .map((v) => v.split("="))
      .map(([k, v]) => [k?.trim() || "", v?.trim() || ""])
      .filter(([k, v]) => k && v)
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0])] = decodeURIComponent(v[1]);
        return acc;
      }, {} as ICookie);

    if (cookieObject.Version) cookieObject.Version = Number(cookieObject.Version);
    if (cookieObject.Expires) cookieObject.Expires = new Date(cookieObject.Expires).toISOString();
    if (cookieObject["Max-Age"]) cookieObject["Max-Age"] = Number(cookieObject["Max-Age"]);

    return cookieObject;
  }
}

export const UtilService = new UtilServiceBase();
