import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { SaleModel } from "./sale-model.js";
class SaleRepositoryBase extends CoreTenantRepository {
    constructor() {
        super({
            schemaSubDef: SaleModel.getSchemaDef(),
            featureEntity: SaleModel.getTableName(),
            fieldAliases: SaleModel.getFieldAliases(),
            strictRequiredFields: ["targetId"],
        });
    }
    async findSingle({ dataId, tenantId }) {
        const result = await this.base_getOneByIdAndTenantId({
            dataId,
            tenantId,
        });
        if (!result?.id) {
            return null;
        }
        return result;
    }
    getWithIds({ dataIds, tenantId, fields }) {
        return this.base_getManyByIdsAndTenantId({
            tenantId,
            dataIds,
            fields: fields?.length ? fields : SaleModel.getLiteFields(),
        });
    }
    getByOrderId({ orderId, tenantId, fields }) {
        return this.base_getWhere({
            tenantId,
            query: { orderId },
            fields: fields?.length ? fields : SaleModel.getLiteFields(),
        });
    }
    async formatAndResolveAliases(data) {
        const data01 = { ...data };
        data01.targetId = data01.orderId;
        data01.total = data01.amount * data01.quantity - (data01.discounted || 0);
        return data01;
    }
    async save({ data, sessionUser }) {
        const data01 = await this.formatAndResolveAliases(data);
        const result = await this.base_createOne({
            data: data01,
            sessionUser,
        });
        return result;
    }
    async update({ data, sessionUser }) {
        const data01 = await this.formatAndResolveAliases(data);
        return this.base_updateOne({
            dataId: data01.id,
            updateData: data01,
            sessionUser,
        });
    }
    delete({ dataId, sessionUser }) {
        return this.base_deleteOne({
            dataId,
            sessionUser,
        });
    }
}
export const SaleRepository = new SaleRepositoryBase();
//# sourceMappingURL=sale-repository.js.map