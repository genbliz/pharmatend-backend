import { ISessionUser } from "@/account/auth/auth-types.js";
import { IOrder, IOrderExtra } from "@/common/order-sale/order/order-types.js";
import { OrderModel } from "@/common/order-sale/order/order-model.js";
import { UtilService } from "@/services/util-service.js";
import { DateService } from "@/services/date-service.js";
import { CoreTenantTargetRepository } from "@/core/core-tenant-target-repository.js";

class OrderRepositoryBase extends CoreTenantTargetRepository<IOrder> {
  constructor() {
    super({
      schemaSubDef: OrderModel.getSchemaDef(),
      featureEntity: OrderModel.getTableName(),
      fieldAliases: OrderModel.getFieldAliases(),
      strictRequiredFields: ["code"],
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

  getWithIds({ dataIds, tenantId, fields }: { dataIds: string[]; tenantId: string; fields?: (keyof IOrder)[] }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds,
      fields: fields?.length ? fields : OrderModel.getLiteFields(),
    });
  }

  private async formatDataForSave({ data, sessionUser }: { data: IOrder; sessionUser: ISessionUser }) {
    const data01 = { ...data };
    // do sometihing here
    return data01;
  }

  getOrderCode() {
    const code = UtilService.getRandomNumber(4);
    const date = new Date().toISOString();
    const YYYYMMDD = DateService.extractIsoDateTo_YYYY_MM_DD(date).split("-").join("");
    const HHMM = DateService.extractIsoTimeTo_HH_MM(date).split(":").join("");
    return [YYYYMMDD, HHMM, "-", code].join("");
  }

  async save({ data, sessionUser }: { data: IOrderExtra; sessionUser: ISessionUser }) {
    const data01 = await this.formatDataForSave({ data, sessionUser });

    data01.targetId === data01.customerId;

    const result = await this.base_createOne({
      data: data01,
      sessionUser,
    });

    return result;
  }

  async update({ data, sessionUser }: { data: IOrderExtra; sessionUser: ISessionUser }) {
    const data01 = await this.formatDataForSave({ data, sessionUser });
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

export const OrderRepository = new OrderRepositoryBase();
