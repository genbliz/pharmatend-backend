import Joi from "joi";
import { IMocodyCoreEntityModel, IFieldAliases as IFieldAliases0 } from "mocody";

export interface ICoreEntityBaseModel extends IMocodyCoreEntityModel {
  createdAtDate: string;
  createdAtDayStamp: string;
  recordDate: string;
  //
  lastModifierUserId?: string;
  lastModifiedDate?: string;
  //
  creatorUserId?: string;
  //
  deleterUserId?: string;
  deletedAtDate?: string;
  //
  sk01?: string;
  sk02?: string;
  sk03?: string;
  numberCode?: number;
  targetId?: string;
  customerId?: string;
  //
  operationId?: string;
}

export interface ICoreEntityTenantModel extends ICoreEntityBaseModel {
  tenantId: string;
  featureEntityTenantId: string;
}

export interface ICoreEntityTargetModel extends ICoreEntityTenantModel {
  targetId: string;
}

export type IFullEntity<T> = ICoreEntityBaseModel & T;

type CoreSchemaType<T> = { [P in keyof T]-?: Joi.AnySchema | [Joi.AnySchema, Joi.AnySchema] };

export type IBaseSchemaDefinitionCore<T> = Pick<CoreSchemaType<T>, Exclude<keyof CoreSchemaType<T>, "">>;

export type IBaseSchemaDefinitionTenant<T> = Pick<
  CoreSchemaType<T>,
  Exclude<keyof CoreSchemaType<T>, keyof ICoreEntityTenantModel>
>;

export type IBaseSchemaDefinitionTenantTarget<T> = Pick<
  CoreSchemaType<T>,
  Exclude<keyof CoreSchemaType<T>, keyof ICoreEntityTargetModel>
>;

export type IBaseSchemaDefinitionOther<T> = Pick<
  CoreSchemaType<T>,
  Exclude<keyof CoreSchemaType<T>, keyof ICoreEntityBaseModel>
>;

export type IFieldAliases<T> = IFieldAliases0<T>;

export interface IDictionary<T> {
  [name: string]: T;
}

export interface ITextValue<T = string> {
  text: string;
  value: T;
}

export interface IValidateResult {
  succeeded: boolean;
  data?: any[] | any;
  errors: string[];
}

export type IDataSortKey = "desc" | "asc";

export interface ICoreRequestParams {
  count?: number;
  nextPageHash?: string;
  isPaging?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface ICountryInfo {
  name: string;
  countryCode: string;
  callingCode: string;
  currencyCode: string | null;
  flagSvg?: string;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IncludeOnly<T, TKeys extends keyof any> = Omit<T, keyof Omit<T, TKeys>>;

export type IncludeOnlyStrict<T, TKeys extends keyof T> = Omit<T, keyof Omit<T, TKeys>>;

export const GenderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type GenderEnum = (typeof GenderEnum)[keyof typeof GenderEnum];
