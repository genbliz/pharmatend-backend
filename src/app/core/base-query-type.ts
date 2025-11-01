import { IMocodyQueryDefinition, IMocodyKeyConditionParams } from "mocody";
import { IDataSortKey } from "./base-types";

type IQueryIndexesBaic = "tenantId" | "featureEntityTenantId";

// type IQueryIndexes = | "createdAtDate" "recordDate" | "numberCode" | "shortCode";

export type IManyQueryType<T> = Omit<T, IQueryIndexesBaic>;

type IManyQueryType_shortCode<T> = Omit<T, IQueryIndexesBaic | "shortCode">;
type IManyQueryType_numberCode<T> = Omit<T, IQueryIndexesBaic | "numberCode">;
type IManyQueryType_recordDate<T> = Omit<T, IQueryIndexesBaic | "recordDate">;
type IManyQueryType_createdAtDate<T> = Omit<T, IQueryIndexesBaic | "createdAtDate">;

export type IManyQueryTypeAll<T> =
  | IManyQueryType_shortCode<T>
  | IManyQueryType_numberCode<T>
  | IManyQueryType_recordDate<T>
  | IManyQueryType_createdAtDate<T>;

interface IQueryParamsBase<T> {
  tenantId: string;
  fields: (keyof T)[] | undefined | null;
  limit?: number;
}

// interface IQueryParamsBaseHerit<T, TSQuery, TFieldName, TFieldExclude> {
//   tenantId: string;
//   fields: (keyof T)[] | undefined | null;
//   limit?: number;
//   query?: IMocodyQueryDefinition<Omit<T, IQueryIndexesBaic | keyof TFieldExclude>>;
//   sortKeyParams?: {
//     query?: IMocodyKeyConditionParams<TSQuery>;
//     sort?: IDataSortKey | null | undefined;
//     fieldName: TFieldName;
//   };
// }

interface IQueryParams_ShortCode<T> extends IQueryParamsBase<T> {
  query?: IMocodyQueryDefinition<IManyQueryType_shortCode<T>>;
  sortKeyParams?: {
    query?: IMocodyKeyConditionParams<string>;
    sort?: IDataSortKey | null | undefined;
    fieldName: "shortCode";
  };
}

interface IQueryParams_RecordDate<T> extends IQueryParamsBase<T> {
  query?: IMocodyQueryDefinition<IManyQueryType_recordDate<T>>;
  sortKeyParams?: {
    query?: IMocodyKeyConditionParams<string>;
    sort?: IDataSortKey | null | undefined;
    fieldName: "recordDate";
  };
}

interface IQueryParams_NumberCode<T> extends IQueryParamsBase<T> {
  query?: IMocodyQueryDefinition<IManyQueryType_numberCode<T>>;
  sortKeyParams?: {
    query?: IMocodyKeyConditionParams<number>;
    sort?: IDataSortKey | null | undefined;
    fieldName: "numberCode";
  };
}

interface IQueryParams_CreatedAtDate<T> extends IQueryParamsBase<T> {
  query?: IMocodyQueryDefinition<IManyQueryType_createdAtDate<T>>;
  sortKeyParams?: {
    query?: IMocodyKeyConditionParams<string>;
    sort?: IDataSortKey | null | undefined;
    fieldName: "createdAtDate";
  };
}

export type IBaseQueryParams<T> =
  | IQueryParams_ShortCode<T>
  | IQueryParams_RecordDate<T>
  | IQueryParams_NumberCode<T>
  | IQueryParams_CreatedAtDate<T>;
