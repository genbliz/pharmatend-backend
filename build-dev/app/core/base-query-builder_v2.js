import { UtilService } from "@/services/util-service.js";
export class MyQueryBuilderV2 {
    query;
    sortQuery;
    params = {
        count: undefined,
        sort: undefined,
    };
    constructor(query) {
        if (query && typeof query === "object") {
            this.query = { ...query };
        }
        else {
            this.query = {};
        }
        this.sortQuery = {};
    }
    addQuery({ query }) {
        if (query && typeof query === "object") {
            this.query = {
                ...this.query,
                ...query,
            };
        }
    }
    addSortKeyQuery(sortQuery) {
        if (sortQuery && typeof sortQuery === "object") {
            this.sortQuery = {
                ...this.sortQuery,
                ...sortQuery,
            };
        }
    }
    setCount(numeric) {
        if (numeric && UtilService.isNumericPositiveInteger(numeric)) {
            this.params.count = Number(numeric);
            return this.params.count;
        }
        this.params.count = undefined;
        return undefined;
    }
    setSort(val) {
        const type1 = val === "asc" || val === "ascending" || val === 1 ? "asc" : undefined;
        const type2 = val === "desc" || val === "descending" || val === -1 ? "desc" : undefined;
        const result = type1 || type2;
        this.params.sort = result;
        return result;
    }
    get props() {
        return { ...this.params };
    }
    buildQuery() {
        const f = Object.assign({}, this.query);
        return Object.keys(f).length ? f : undefined;
    }
    buildSortKeyQuery() {
        const x = Object.assign({}, this.sortQuery);
        return Object.keys(x).length ? x : undefined;
    }
}
//# sourceMappingURL=base-query-builder_v2.js.map