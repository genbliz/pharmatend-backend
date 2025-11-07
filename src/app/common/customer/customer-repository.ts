import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { ICustomer } from "@/common/customer/customer-types.js";
import { CustomerModel } from "@/common/customer/customer-model.js";

class CustomerRepositoryBase extends CoreTenantRepository<ICustomer> {
  constructor() {
    super({
      schemaSubDef: CustomerModel.getSchemaDef(),
      featureEntity: CustomerModel.getTableName(),
      fieldAliases: CustomerModel.getFieldAliases(),
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

  getWithIds({ dataIds, tenantId, fields }: { dataIds: string[]; tenantId: string; fields?: (keyof ICustomer)[] }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds,
      fields: fields?.length ? fields : CustomerModel.getLiteFields(),
    });
  }

  private async formatDataForSave({ data, sessionUser }: { data: ICustomer; sessionUser: ISessionUser }) {
    const data01 = { ...data };
    // do sometihing here
    return data01;
  }

  async save({ data, sessionUser }: { data: ICustomer; sessionUser: ISessionUser }) {
    const data01 = await this.formatDataForSave({ data, sessionUser });

    const result = await this.base_createOne({
      data: data01,
      sessionUser,
    });

    return result;
  }

  async update({ data, sessionUser }: { data: ICustomer; sessionUser: ISessionUser }) {
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

export const CustomerRepository = new CustomerRepositoryBase();
