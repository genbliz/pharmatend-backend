import Joi from "joi";
import type {
  ICoreEntityBaseModel,
  IBaseSchemaDefinitionTenant,
  ICoreEntityTenantModel,
  IBaseSchemaDefinitionCore,
  IBaseSchemaDefinitionOther,
  ICoreEntityTargetModel,
  IBaseSchemaDefinitionTenantTarget,
  IFieldAliases,
} from "@/core/base-types.js";

import {
  JoiDateISOValidation,
  JoiDateFormat_YYYY_MM_DD,
  JoiStringCustomId,
  JoiStripWhenNull,
} from "@/core/base-joi-helper.js";

type IField<T> = { [P in keyof T]?: "" | 1 } | (keyof T)[];

interface ITableConfig<T> {
  tableName: string;
  returnFields: IField<T> | "basic";
  excludeFields?: IField<T>;
  schemaExcludes?: IField<T>;
  fieldAliases?: IFieldAliases<T>;
}

const appCoreSchemaDefinition: IBaseSchemaDefinitionCore<ICoreEntityBaseModel> = {
  id: JoiStringCustomId({ isRequired: true }),
  featureEntity: Joi.string().required().min(2),
  dangerouslyExpireAt: [Joi.string(), Joi.any().strip()],
  dangerouslyExpireAtTTL: Joi.any().strip(),
  //
  lastModifierUserId: [Joi.string(), Joi.any().strip()],
  lastModifiedDate: [JoiDateISOValidation({ enforceFullIsoFormat: true }), Joi.any().strip()],
  //
  creatorUserId: [Joi.string(), Joi.any().strip()],
  //
  createdAtDate: JoiDateISOValidation({ isRequired: true, enforceFullIsoFormat: true }),
  createdAtDayStamp: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
  recordDate: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
  deleterUserId: [Joi.string(), Joi.any().strip()],
  deletedAtDate: [JoiDateISOValidation({ enforceFullIsoFormat: true }), Joi.any().strip()],
  //
  numberCode: [JoiStripWhenNull(), Joi.number().integer().min(1)],
  sk01: [JoiStripWhenNull(), Joi.string().min(1)],
  sk02: [JoiStripWhenNull(), Joi.string().min(1)],
  sk03: [JoiStripWhenNull(), Joi.string().min(1)],
  targetId: [Joi.string(), Joi.any().strip()],
  customerId: [Joi.string(), Joi.any().strip()],
  //
  operationId: [Joi.string(), Joi.any().strip()],
};

const appCoreTenantSchemaDefinition: IBaseSchemaDefinitionCore<ICoreEntityTenantModel> = {
  ...appCoreSchemaDefinition,
  tenantId: JoiStringCustomId({ isRequired: true }),
  featureEntityTenantId: JoiStringCustomId({ isRequired: true }),
} as const;

const appCoreTargetSchemaDefinition: IBaseSchemaDefinitionTenant<ICoreEntityTargetModel> = {
  ...appCoreTenantSchemaDefinition,
  targetId: JoiStringCustomId({ isRequired: true }),
} as const;

function resolveSchema<T>(model: any, excludes: IField<T> | undefined) {
  const data: any = { ...model };

  if (excludes) {
    const fields = (() => {
      if (excludes) {
        if (Array.isArray(excludes)) {
          if (excludes?.length) {
            return excludes;
          }
        } else if (typeof excludes === "object" && Object.keys(excludes).length) {
          return Object.keys(excludes) as (keyof T)[];
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

function resolveConfig<T>({
  returnFields,
  excludeFields,
  allFields,
  basicLiteFields,
}: Partial<ITableConfig<T>> & { allFields: string[]; basicLiteFields: (keyof T)[] }) {
  const fieldReturn = new Set<keyof T>();
  let liteFields: (keyof T)[] | undefined;

  const returnFields01 = (() => {
    if (returnFields === "basic") {
      return basicLiteFields;
    }
    if (Array.isArray(returnFields) && returnFields.length) {
      return returnFields;
    }
    if (returnFields && typeof returnFields === "object" && Object.keys(returnFields).length) {
      return Object.keys(returnFields) as (keyof T)[];
    }
    return null;
  })();

  const excludeFields01 = (() => {
    if (excludeFields && Array.isArray(excludeFields) && excludeFields.length) {
      return excludeFields;
    }
    if (excludeFields && typeof excludeFields === "object" && Object.keys(excludeFields).length) {
      return Object.keys(excludeFields) as (keyof T)[];
    }
    return null;
  })();

  if (returnFields01?.length) {
    returnFields01.forEach((item) => {
      fieldReturn.add(item);
    });
  } else {
    if (excludeFields01?.length && allFields.length) {
      allFields.forEach((item) => {
        fieldReturn.add(item as keyof T);
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

const initializationTracks = new Set<string>();

function BaseGenericModelFun<T, ISchemaDef>({ baseSchema, basicFields }: { baseSchema: any; basicFields: string[] }) {
  return class BaseModel {
    private static _modelProps = new Map<string, { tableName: string; liteFields: (keyof T)[] | undefined }>();
    private static _schemaDef = new Map<string, ISchemaDef>();
    private static _fieldAliases: IFieldAliases<T> = [];

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

    static toLiteData(data: Partial<T>) {
      const data01: any = {};

      const liteFields01 = this.getLiteFields();

      if (!(data && typeof data === "object" && Object.keys(data).length && liteFields01?.length)) {
        return data as T;
      }

      Object.entries(data).forEach(([key, value]) => {
        if (liteFields01.includes(key as any)) {
          data01[key] = value;
        }
      });
      return data01 as T;
    }

    static init({
      schema,
      schemaExcludes,
      returnFields,
      excludeFields,
      tableName,
      fieldAliases,
    }: ITableConfig<T> & { schema: ISchemaDef }) {
      if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging") {
        if (!this.name.endsWith("Model")) {
          throw new Error(`Wrong naming: Model name, '${this.name}' must be suffixed with Model`);
        }

        if (this._modelProps.has(this.name) || initializationTracks.has(this.name)) {
          throw new Error(`Model name duplication found for: ${this.name}`);
        }
      }

      const resolvedSchema = resolveSchema({ ...schema }, schemaExcludes);

      const basicFields01: (keyof ICoreEntityBaseModel)[] = [
        "id",
        "recordDate",
        "numberCode",
        "customerId",
        "createdAtDate",
        "creatorUserId",
      ];

      const basicFields02 = Object.keys(resolvedSchema) as any[];
      const basicLiteFields = new Set<keyof T>([...basicFields01, ...basicFields02, ...basicFields]);

      const schemaDef001 = {
        ...resolvedSchema,
        ...baseSchema,
      };

      const { liteFields } = resolveConfig<T>({
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

export function BaseCoreModelFunc<T extends ICoreEntityBaseModel>() {
  return BaseGenericModelFun<T, IBaseSchemaDefinitionOther<T>>({
    baseSchema: appCoreSchemaDefinition,
    basicFields: [],
  });
}

export function BaseTenantModelFunc<T extends ICoreEntityTenantModel>() {
  const basicFields: (keyof ICoreEntityTenantModel)[] = ["tenantId"];
  return BaseGenericModelFun<T, IBaseSchemaDefinitionTenant<T>>({
    baseSchema: appCoreTenantSchemaDefinition,
    basicFields,
  });
}

export function BaseTargetModelFunc<T extends ICoreEntityTargetModel>() {
  const basicFields: (keyof ICoreEntityTargetModel)[] = ["tenantId", "targetId"];
  return BaseGenericModelFun<T, IBaseSchemaDefinitionTenantTarget<T>>({
    baseSchema: appCoreTargetSchemaDefinition,
    basicFields,
  });
}
