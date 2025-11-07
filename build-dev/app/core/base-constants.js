import { envConfig } from "@/config/env.js";
import { GenericFriendlyError } from "./../utils/errors.js";
export const DefinedIndexes = {
    featureEntity_createdAtDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "featureEntity_createdAtDate_index",
        partitionKeyFieldName: "featureEntity",
        sortKeyFieldName: "createdAtDate",
    },
    featureEntity_recordDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "featureEntity_recordDate_index",
        partitionKeyFieldName: "featureEntity",
        sortKeyFieldName: "recordDate",
    },
    featureEntityTenantId_createdAtDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "featureEntityTenantId_createdAtDate_index",
        partitionKeyFieldName: "featureEntityTenantId",
        sortKeyFieldName: "createdAtDate",
    },
    featureEntityTenantId_recordDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "featureEntityTenantId_recordDate_index",
        partitionKeyFieldName: "featureEntityTenantId",
        sortKeyFieldName: "recordDate",
    },
    featureEntityTenantId_numberCode: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "N",
        },
        indexName: "featureEntityTenantId_numberCode_index",
        partitionKeyFieldName: "featureEntityTenantId",
        sortKeyFieldName: "numberCode",
    },
    featureEntityTenantId_stringCode: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "N",
        },
        indexName: "featureEntityTenantId_stringCode_index",
        partitionKeyFieldName: "featureEntityTenantId",
        sortKeyFieldName: "stringCode",
    },
    targetId_featureEntity: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "targetId_featureEntity_index",
        partitionKeyFieldName: "targetId",
        sortKeyFieldName: "featureEntity",
    },
    targetId_createdAtDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "targetId_createdAtDate_index",
        partitionKeyFieldName: "targetId",
        sortKeyFieldName: "createdAtDate",
    },
    targetId_recordDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "targetId_recordDate_index",
        partitionKeyFieldName: "targetId",
        sortKeyFieldName: "recordDate",
    },
    customerId_createdAtDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "customerId_createdAtDate_index",
        partitionKeyFieldName: "customerId",
        sortKeyFieldName: "createdAtDate",
    },
    customerId_featureEntity: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "customerId_featureEntity_index",
        partitionKeyFieldName: "customerId",
        sortKeyFieldName: "featureEntity",
    },
    customerId_recordDate: {
        dataTypes: {
            partitionKeyDataType: "S",
            sortKeyDataType: "S",
        },
        indexName: "customerId_recordDate_index",
        partitionKeyFieldName: "customerId",
        sortKeyFieldName: "recordDate",
    },
};
const prodTableNames = {
    MAIN: "tend_pos_common_production__",
    TEMP: "tend_pos_tempdata_production__",
};
const stagingTableNames = {
    MAIN: "tend_pos_common_staging__",
    TEMP: "tend_pos_tempdata_staging__",
};
export const DefinedTableNames = (() => {
    if (!envConfig?.NODE_ENV) {
        throw GenericFriendlyError.create("Environment variables NODE_ENV, not initialized");
    }
    if (envConfig.NODE_ENV === "production") {
        return Object.freeze({ ...prodTableNames });
    }
    return Object.freeze({ ...stagingTableNames });
})();
//# sourceMappingURL=base-constants.js.map