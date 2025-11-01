import { CoreTenantRepository } from "@/core/core-tenant-repository";
import { ISessionUser } from "@/account/auth/auth-types";
import { IStaff } from "./staff-types";
import { StaffModel } from "./staff-model";
import { LoggingService } from "../../services/logging-service";

class StaffRepositoryBase extends CoreTenantRepository<IStaff> {
  constructor() {
    super({
      schemaSubDef: StaffModel.getSchemaDef(),
      featureEntity: StaffModel.getTableName(),
      fieldAliases: StaffModel.getFieldAliases(),
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

  getWithIds({ dataIds, tenantId, fields }: { dataIds: string[]; tenantId: string; fields?: (keyof IStaff)[] }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds,
      fields: fields?.length ? fields : StaffModel.getLiteFields(),
    });
  }

  private async formatAndResolveAliases(data: IStaff) {
    const data01 = { ...data };
    data01.sk01 = data01.email;
    data01.sk02 = data01.phone;
    data01.sk03 = data01.department;
    data01.targetId = data01.managerId;
    // do sometihing here
    return data01;
  }

  async save({ data, sessionUser }: { data: IStaff; sessionUser: ISessionUser }) {
    const data01 = await this.formatAndResolveAliases(data);

    const result = await this.base_createOne({
      data: data01,
      sessionUser,
    });

    return result;
  }

  async update({ data, sessionUser }: { data: IStaff; sessionUser: ISessionUser }) {
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

  async getTest(id?: string) {
    const results = id
      ? await this.root_getOneById({ dataId: id })
      : await this.root_getWhere({
          limit: 1,
          fields: ["firstName", "lastName"],
        });

    LoggingService.log(results);

    const results01 = Array.isArray(results) ? results : results ? [results] : null;

    LoggingService.log(results01);

    if (results01?.length) {
      return results01.map((result) => ({
        firstName: result.firstName,
        lastName: result.lastName,
      }));
    }
    return [];
  }
}

export const StaffRepository = new StaffRepositoryBase();
