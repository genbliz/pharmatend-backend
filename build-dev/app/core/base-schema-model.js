import Joi from "joi";
import { JoiDateISOValidation, JoiDateFormat_YYYY_MM_DD, JoiStringCustomId, JoiStripWhenNull } from "./base-joi-helper.js";
const appCoreSchemaDefinition = {
    id: JoiStringCustomId({ isRequired: true }),
    featureEntity: Joi.string().required().min(2),
    dangerouslyExpireAt: [Joi.string(), Joi.any().strip()],
    dangerouslyExpireAtTTL: Joi.any().strip(),
    lastModifierUserId: [Joi.string(), Joi.any().strip()],
    lastModifiedDate: [JoiDateISOValidation({ enforceFullIsoFormat: true }), Joi.any().strip()],
    creatorUserId: [Joi.string(), Joi.any().strip()],
    createdAtDate: JoiDateISOValidation({ isRequired: true, enforceFullIsoFormat: true }),
    createdAtDayStamp: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
    recordDate: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
    deleterUserId: [Joi.string(), Joi.any().strip()],
    deletedAtDate: [JoiDateISOValidation({ enforceFullIsoFormat: true }), Joi.any().strip()],
    numberCode: [JoiStripWhenNull(), Joi.number().integer().min(1)],
    sk01: [JoiStripWhenNull(), Joi.string().min(1)],
    sk02: [JoiStripWhenNull(), Joi.string().min(1)],
    sk03: [JoiStripWhenNull(), Joi.string().min(1)],
    targetId: [Joi.string(), Joi.any().strip()],
    customerId: [Joi.string(), Joi.any().strip()],
    operationId: [Joi.string(), Joi.any().strip()],
};
const appCoreTenantSchemaDefinition = {
    ...appCoreSchemaDefinition,
    tenantId: JoiStringCustomId({ isRequired: true }),
    featureEntityTenantId: JoiStringCustomId({ isRequired: true }),
};
const appCoreTargetSchemaDefinition = {
    ...appCoreTenantSchemaDefinition,
    targetId: JoiStringCustomId({ isRequired: true }),
};
function resolveSchema(model, excludes) {
    const data = { ...model };
    if (excludes) {
        const fields = (() => {
            if (excludes) {
                if (Array.isArray(excludes)) {
                    if (excludes?.length) {
                        return excludes;
                    }
                }
                else if (typeof excludes === "object" && Object.keys(excludes).length) {
                    return Object.keys(excludes);
                }
            }
            return null;
        })();
        if (fields?.length) {
            for (const key of fields) {
                delete data[key];
            }
        }
    }
    return data;
}
function resolveConfig({ returnFields, excludeFields, allFields, basicLiteFields, }) {
    const fieldReturn = new Set();
    let liteFields;
    const returnFields01 = (() => {
        if (returnFields === "basic") {
            return basicLiteFields;
        }
        if (Array.isArray(returnFields) && returnFields.length) {
            return returnFields;
        }
        if (returnFields && typeof returnFields === "object" && Object.keys(returnFields).length) {
            return Object.keys(returnFields);
        }
        return null;
    })();
    const excludeFields01 = (() => {
        if (excludeFields && Array.isArray(excludeFields) && excludeFields.length) {
            return excludeFields;
        }
        if (excludeFields && typeof excludeFields === "object" && Object.keys(excludeFields).length) {
            return Object.keys(excludeFields);
        }
        return null;
    })();
    if (returnFields01?.length) {
        returnFields01.forEach((item) => {
            fieldReturn.add(item);
        });
    }
    else {
        if (excludeFields01?.length && allFields.length) {
            allFields.forEach((item) => {
                fieldReturn.add(item);
            });
        }
    }
    if (excludeFields01?.length) {
        excludeFields01.forEach((item) => {
            if (fieldReturn.has(item)) {
                fieldReturn.delete(item);
            }
        });
    }
    if (fieldReturn.size > 0) {
        liteFields = [...fieldReturn];
    }
    return {
        liteFields,
    };
}
const initializationTracks = new Set();
function BaseGenericModelFun({ baseSchema, basicFields }) {
    return class BaseModel {
        static _modelProps = new Map();
        static _schemaDef = new Map();
        static _fieldAliases = [];
        static getTableName() {
            const propData = this._modelProps.get(this.name);
            if (!propData) {
                throw new Error(`Table name not set for model: ${this.name}`);
            }
            return propData.tableName;
        }
        static getModelProps() {
            const propData = this._modelProps.get(this.name);
            if (!propData) {
                throw new Error(`Props not set for model: ${this.name}`);
            }
            return propData;
        }
        static getSchemaDef() {
            const propData = this._schemaDef.get(this.name);
            if (!propData) {
                throw new Error(`Schema not defined for model '${this.name}'`);
            }
            return propData;
        }
        static getLiteFields() {
            return this._modelProps.get(this.name)?.liteFields || undefined;
        }
        static getFieldAliases() {
            return [...this._fieldAliases];
        }
        static toLiteData(data) {
            const data01 = {};
            const liteFields01 = this.getLiteFields();
            if (!(data && typeof data === "object" && Object.keys(data).length && liteFields01?.length)) {
                return data;
            }
            Object.entries(data).forEach(([key, value]) => {
                if (liteFields01.includes(key)) {
                    data01[key] = value;
                }
            });
            return data01;
        }
        static init({ schema, schemaExcludes, returnFields, excludeFields, tableName, fieldAliases, }) {
            if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging") {
                if (!this.name.endsWith("Model")) {
                    throw new Error(`Wrong naming: Model name, '${this.name}' must be suffixed with Model`);
                }
                if (this._modelProps.has(this.name) || initializationTracks.has(this.name)) {
                    throw new Error(`Model name duplication found for: ${this.name}`);
                }
            }
            const resolvedSchema = resolveSchema({ ...schema }, schemaExcludes);
            const basicFields01 = [
                "id",
                "recordDate",
                "numberCode",
                "customerId",
                "createdAtDate",
                "creatorUserId",
            ];
            const basicFields02 = Object.keys(resolvedSchema);
            const basicLiteFields = new Set([...basicFields01, ...basicFields02, ...basicFields]);
            const schemaDef001 = {
                ...resolvedSchema,
                ...baseSchema,
            };
            const { liteFields } = resolveConfig({
                returnFields,
                excludeFields,
                allFields: Object.keys({ ...schemaDef001 }),
                basicLiteFields: Array.from(basicLiteFields),
            });
            this._schemaDef.set(this.name, { ...schemaDef001 });
            this._modelProps.set(this.name, { tableName, liteFields });
            if (fieldAliases?.length) {
                this._fieldAliases = [...fieldAliases];
            }
            initializationTracks.add(this.name);
        }
    };
}
export function BaseCoreModelFunc() {
    return BaseGenericModelFun({
        baseSchema: appCoreSchemaDefinition,
        basicFields: [],
    });
}
export function BaseTenantModelFunc() {
    const basicFields = ["tenantId"];
    return BaseGenericModelFun({
        baseSchema: appCoreTenantSchemaDefinition,
        basicFields,
    });
}
export function BaseTargetModelFunc() {
    const basicFields = ["tenantId", "targetId"];
    return BaseGenericModelFun({
        baseSchema: appCoreTargetSchemaDefinition,
        basicFields,
    });
}
//# sourceMappingURL=base-schema-model.js.map