import { RoleClaimModel } from "./role-claim-model.js";
import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
class RoleClaimRepositoryBase extends CoreTenantRepository {
    constructor() {
        super({
            schemaSubDef: RoleClaimModel.getSchemaDef(),
            featureEntity: RoleClaimModel.getTableName(),
            fieldAliases: RoleClaimModel.getFieldAliases(),
            strictRequiredFields: [],
        });
    }
    async getRoleBytenantId({ tenantId }) {
        const result = await this.base_getWhere({
            tenantId,
            fields: RoleClaimModel.getLiteFields(),
        });
        return this.toClaimsDotFormat(result);
    }
    async createRole({ data, sessionUser }) {
        if (data?.claims?.length) {
            data.claims = data.claims.map((claim) => this.convertToDotClaimsFormat(claim));
        }
        return await this.base_createOne({
            data,
            sessionUser,
        });
    }
    async deleteRole({ roleId, sessionUser }) {
        return await this.base_deleteOne({
            dataId: roleId,
            sessionUser,
        });
    }
    async getById({ dataId, tenantId }) {
        const result = await this.base_getOneByIdAndTenantId({
            tenantId,
            dataId,
        });
        if (!result?.id) {
            return result;
        }
        return this.toClaimsDotFormat([result])[0];
    }
    async getRoleClaimWithIds({ roleClaimIds, tenantId, }) {
        const result = await this.base_getManyByIdsAndTenantId({
            tenantId,
            dataIds: roleClaimIds,
            fields: RoleClaimModel.getLiteFields(),
        });
        return this.toClaimsDotFormat(result);
    }
    update({ data, sessionUser }) {
        if (data?.claims?.length) {
            data.claims = data.claims.map((claim) => this.convertToDotClaimsFormat(claim));
        }
        return this.base_updateOne({
            dataId: data.id,
            updateData: data,
            sessionUser,
        });
    }
    toClaimsDotFormat(result) {
        if (!result?.length) {
            return result;
        }
        return result.map((data) => {
            if (data?.claims?.length) {
                data.claims = data.claims.map((claim) => this.convertToDotClaimsFormat(claim));
            }
            return data;
        });
    }
    convertToDotClaimsFormat(claim01) {
        if (!claim01) {
            return claim01;
        }
        const castToNewClaimsFormat = ({ claim, fromSep, toSep }) => {
            if (claim?.endsWith(fromSep)) {
                return [claim.split(fromSep).slice(0, -1).join(fromSep), toSep].join("");
            }
            return claim;
        };
        if (claim01.endsWith("-view")) {
            return castToNewClaimsFormat({
                claim: claim01,
                fromSep: "-view",
                toSep: ".view",
            });
        }
        else if (claim01.endsWith("-add")) {
            return castToNewClaimsFormat({
                claim: claim01,
                fromSep: "-add",
                toSep: ".add",
            });
        }
        else if (claim01.endsWith("-edit")) {
            return castToNewClaimsFormat({
                claim: claim01,
                fromSep: "-edit",
                toSep: ".edit",
            });
        }
        else if (claim01.endsWith("-delete")) {
            return castToNewClaimsFormat({
                claim: claim01,
                fromSep: "-delete",
                toSep: ".delete",
            });
        }
        return claim01;
    }
}
export const RoleClaimRepository = new RoleClaimRepositoryBase();
//# sourceMappingURL=role-claim-repository.js.map