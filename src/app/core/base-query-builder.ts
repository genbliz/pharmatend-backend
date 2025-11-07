import { UtilService } from "@/services/util-service.js";
import { IMocodyQueryDefinition, IMocodyKeyConditionParams } from "mocody";

type IParams = {
  count: number | undefined;
  sort: "asc" | "desc" | undefined;
};

export class MyQueryBuilder<T> {
  private query: IMocodyQueryDefinition<T>;
  private sortQuery: IMocodyKeyConditionParams<string>;
  private readonly params: IParams = {
    count: undefined,
    sort: undefined,
  };

  constructor(query?: IMocodyQueryDefinition<T>) {
    if (query && typeof query === "object") {
      this.query = { ...query };
    } else {
      this.query = {} as any;
    }
    this.sortQuery = {};
  }

  /** Add query object */
  addQuery(query: IMocodyQueryDefinition<T>) {
    if (query && typeof query === "object") {
      this.query = {
        ...this.query,
        ...query,
      };
    }
  }

  addSortKeyQuery(sortQuery: IMocodyKeyConditionParams<string>) {
    if (sortQuery && typeof sortQuery === "object") {
      this.sortQuery = {
        ...this.sortQuery,
        ...sortQuery,
      };
    }
  }

  setCount(numeric: number | string | null | undefined) {
    if (numeric && UtilService.isNumericPositiveInteger(numeric)) {
      this.params.count = Number(numeric);
      return this.params.count;
    }
    this.params.count = undefined;
    return undefined;
  }

  setSort(val: "asc" | "desc" | "ascending" | "descending" | string | 1 | -1 | null | undefined) {
    const type1 = val === "asc" || val === "ascending" || val === 1 ? "asc" : undefined;
    const type2 = val === "desc" || val === "descending" || val === -1 ? "desc" : undefined;
    const result = type1 || type2;
    this.params.sort = result;
    return result;
  }

  get props() {
    return { ...this.params };
  }

  /** Return query object */
  buildQuery() {
    const f = Object.assign({}, this.query);
    return Object.keys(f).length ? f : undefined;
  }

  /** Return sort query object */
  buildSortKeyQuery() {
    const x = Object.assign({}, this.sortQuery);
    return Object.keys(x).length ? x : undefined;
  }
}
