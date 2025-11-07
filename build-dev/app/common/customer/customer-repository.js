import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { CustomerModel } from "./customer-model.js";
class CustomerRepositoryBase extends CoreTenantRepository {
    constructor() {
        super({
            schemaSubDef: CustomerModel.getSchemaDef(),
            featureEntity: CustomerModel.getTableName(),
            fieldAliases: CustomerModel.getFieldAliases(),
            strictRequiredFields: [],
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
            fields: fields?.length ? fields : CustomerModel.getLiteFields(),
        });
    }
    async formatDataForSave({ data, sessionUser }) {
        const data01 = { ...data };
        return data01;
    }
    async save({ data, sessionUser }) {
        const data01 = await this.formatDataForSave({ data, sessionUser });
        const result = await this.base_createOne({
            data: data01,
            sessionUser,
        });
        return result;
    }
    async update({ data, sessionUser }) {
        const data01 = await this.formatDataForSave({ data, sessionUser });
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
export const CustomerRepository = new CustomerRepositoryBase();
//# sourceMappingURL=customer-repository.js.map