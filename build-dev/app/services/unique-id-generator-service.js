import { randomUUID } from "node:crypto";
class UniqueIdGeneratorServiceBase {
    getTimeStampGuid() {
        return this.generateDataId();
    }
    getGuid() {
        return randomUUID().toLowerCase();
    }
    generateDataId() {
        const _now = new Date();
        const key = [
            `${_now.getFullYear()}`,
            `${_now.getMonth() + 1}`.padStart(2, "0"),
            `${_now.getDate()}`.padStart(2, "0"),
            "-",
            `${_now.getHours()}`.padStart(2, "0"),
            `${_now.getMinutes()}`.padStart(2, "0"),
            `${_now.getSeconds()}`.padStart(2, "0"),
            "-",
            randomUUID(),
        ];
        return key.join("");
    }
}
export const UniqueIdGeneratorService = new UniqueIdGeneratorServiceBase();
//# sourceMappingURL=unique-id-generator-service.js.map