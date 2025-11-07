import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { IProduct } from "@/common/product/product-types.js";
import { ProductModel } from "@/common/product/product-model.js";
import { UtilService } from "@/services/util-service.js";

class ProductRepositoryBase extends CoreTenantRepository<IProduct> {
  constructor() {
    super({
      schemaSubDef: ProductModel.getSchemaDef(),
      featureEntity: ProductModel.getTableName(),
      fieldAliases: ProductModel.getFieldAliases(),
      strictRequiredFields: [],
    });
  }

  getWithIds({
    productIds,
    tenantId,
    isLiteFields,
  }: {
    productIds: string[];
    tenantId: string;
    isLiteFields?: boolean;
  }) {
    return this.base_getManyByIdsAndTenantId({
      tenantId,
      dataIds: productIds,
      fields: isLiteFields ? ProductModel.getLiteFields() : undefined,
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

  private async findProductExists({ tenantId, data }: { tenantId: string; data: IProduct }) {
    const results = await this.base_getWhere({
      tenantId,
      query: {
        name: data.name,
        category: data.category,
      },
      fields: ["tenantId", "id"],
    });
    return results;
  }

  private async formatDataForSave({ data, sessionUser }: { data: IProduct; sessionUser: ISessionUser }) {
    const data01 = { ...data };

    const existingRecordsInDb = await this.findProductExists({
      data: data01,
      tenantId: sessionUser.tenantId,
    });

    if (existingRecordsInDb?.length) {
      const duplicateMsg =
        "Product with the same name and characteristic already exits. You may change the characteristics to reflect different entry...";
      if (!data01?.id) {
        throw this.root_util.createFriendlyError(duplicateMsg);
      } else {
        const thisRecordInExisting = existingRecordsInDb.filter((item) => item.id !== data01.id);
        if (thisRecordInExisting?.length) {
          throw this.root_util.createFriendlyError(duplicateMsg);
        }
      }
    }
    data01.sk01 = data01.barcode;
    return data01;
  }

  async save({ data, sessionUser }: { data: IProduct; sessionUser: ISessionUser }) {
    const data01 = await this.formatDataForSave({ data, sessionUser });

    if (!this.root_util.getEnvironments().isProduction) {
      if (!data01?.barcode) {
        data01.barcode = UtilService.getRandomNumber(5).toString();
      }
    }

    const data02 = await this.formatAndResolveAliases(data01);
    const result = await this.base_createOne({
      data: data02,
      sessionUser,
    });

    return result;
  }

  async saveUploads({ dataList, sessionUser }: { dataList: IProduct[]; sessionUser: ISessionUser }) {
    const dataList01 = dataList.map((data) => {
      const data01: IProduct = {
        ...data,
        tenantId: sessionUser.tenantId,
      };
      return data01;
    });

    for (const data of dataList01) {
      await this.base_validateFormatData({ data: this.base_formatNewData({ data, sessionUser }) });
    }

    const insertStats = {
      saved: 0,
      skipped: 0,
    };

    for (const data01 of dataList01) {
      const existingRecordsInDb = await this.findProductExists({ tenantId: sessionUser.tenantId, data: data01 });

      if (!existingRecordsInDb?.length) {
        const data02 = await this.formatAndResolveAliases(data01);
        await this.base_createOne({
          data: data02,
          sessionUser,
        });
        insertStats.saved++;
      } else {
        insertStats.skipped++;
      }
    }
    return insertStats;
  }

  private async formatAndResolveAliases(data: IProduct) {
    const data01 = { ...data };
    data01.sk01 = data01.barcode;
    data01.sk02 = data01.category;
    // do sometihing here
    return data01;
  }

  async update({ data, sessionUser }: { data: IProduct; sessionUser: ISessionUser }) {
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

export const ProductRepository = new ProductRepositoryBase();
