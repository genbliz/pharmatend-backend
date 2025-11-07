import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { ISale } from "./sale-types.js";
import { SaleModel } from "./sale-model.js";

class SaleRepositoryBase extends CoreTenantRepository<ISale> {
  constructor() {
    super({
      schemaSubDef: SaleModel.getSchemaDef(),
      featureEntity: SaleModel.getTableName(),
      fieldAliases: SaleModel.getFieldAliases(),
      strictRequiredFields: ["targetId"],
    });
  }

  async findSingle({ dataId, tenantId }: { dataId: string; tenantId: string }) {
    const result = await this.base_getOneByIdAndTenantId({
      dataId,
      tenantId,
    });

    if (!result?.id) {
      return null;
    }

    return result;
  }

  getWithIds({ dataIds, tenantId, fields }: { dataIds: string[]; tenantId: string; fields?: (keyof ISale)[] }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds,
      fields: fields?.length ? fields : SaleModel.getLiteFields(),
    });
  }

  getByOrderId({ orderId, tenantId, fields }: { orderId: string; tenantId: string; fields?: (keyof ISale)[] }) {
    return this.base_getWhere({
      tenantId,
      query: { orderId },
      fields: fields?.length ? fields : SaleModel.getLiteFields(),
    });
  }

  private async formatAndResolveAliases(data: ISale) {
    const data01 = { ...data };
    data01.targetId = data01.orderId;

    data01.total = data01.amount * data01.quantity - (data01.discounted || 0);

    // do sometihing here
    return data01;
  }

  async save({ data, sessionUser }: { data: ISale; sessionUser: ISessionUser }) {
    const data01 = await this.formatAndResolveAliases(data);

    const result = await this.base_createOne({
      data: data01,
      sessionUser,
    });

    return result;
  }

  async update({ data, sessionUser }: { data: ISale; sessionUser: ISessionUser }) {
    const data01 = await this.formatAndResolveAliases(data);
    return this.base_updateOne({
      dataId: data01.id,
      updateData: data01,
      sessionUser,
    });
  }

  delete({ dataId, sessionUser }: { dataId: string; sessionUser: ISessionUser }) {
    return this.base_deleteOne({
      dataId,
      sessionUser,
    });
  }
}

export const SaleRepository = new SaleRepositoryBase();
