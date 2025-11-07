import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { IPayment } from "@/common/payment/payment-types.js";
import { PaymentModel } from "@/common/payment/payment-model.js";

class PaymentRepositoryBase extends CoreTenantRepository<IPayment> {
  constructor() {
    super({
      schemaSubDef: PaymentModel.getSchemaDef(),
      featureEntity: PaymentModel.getTableName(),
      fieldAliases: PaymentModel.getFieldAliases(),
      strictRequiredFields: [],
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

  getWithIds({ dataIds, tenantId, fields }: { dataIds: string[]; tenantId: string; fields?: (keyof IPayment)[] }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds,
      fields: fields?.length ? fields : PaymentModel.getLiteFields(),
    });
  }

  private async formatDataForSave({ data, sessionUser }: { data: IPayment; sessionUser: ISessionUser }) {
    const data01 = { ...data };
    // do sometihing here
    return data01;
  }

  async save({ data, sessionUser }: { data: IPayment; sessionUser: ISessionUser }) {
    const data01 = await this.formatDataForSave({ data, sessionUser });

    const result = await this.base_createOne({
      data: data01,
      sessionUser,
    });

    return result;
  }

  async update({ data, sessionUser }: { data: IPayment; sessionUser: ISessionUser }) {
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

export const PaymentRepository = new PaymentRepositoryBase();
