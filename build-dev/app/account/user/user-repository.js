import { AdminService } from "./../admin/admin-service.js";
import { UtilService } from "@/services/util-service.js";
import { getUserKindsArray } from "./user-types.js";
import { BcryptService } from "@/services/bcrypt-service.js";
import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { UserModel } from "./user-model.js";
import { ResponseMessage } from "../../helper/response-message.js";
class UserRepositoryBase extends CoreTenantRepository {
    constructor() {
        super({
            schemaSubDef: UserModel.getSchemaDef(),
            featureEntity: UserModel.getTableName(),
            fieldAliases: UserModel.getFieldAliases(),
            strictRequiredFields: [],
        });
    }
    commonErrors = {
        userNotFound: "User Not found",
        emailAreadyExists: "Email already exist in the database",
        userNameAreadyExists: "User Name already exist in the database",
        phoneAreadyExists: "User with same phone number already exist in the database",
    };
    async createRegisterUser({ userData, password, sessionUser, }) {
        if (!password) {
            throw this.root_util.createFriendlyError("Password is required");
        }
        const { tenantId } = sessionUser;
        const { userName, firstName, lastName, userKind, email, phone } = userData;
        this.root_util.validateRequiredString({ userName, firstName, lastName, phone });
        if (userKind?.length) {
            const userKindsArray = getUserKindsArray();
            const allInList = userKind.every((item) => {
                return userKindsArray.includes(item);
            });
            if (!allInList) {
                throw this.root_util.createFriendlyError("Invalid UserKind");
            }
        }
        else {
            userData.userKind = [];
        }
        const userNameExists = await this.existsByUserName({
            userName,
            tenantId,
        });
        if (userNameExists) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNameAreadyExists);
        }
        const phoneExists = await this.existsByPhone({
            phone,
            tenantId,
        });
        if (phoneExists) {
            throw this.root_util.createFriendlyError(this.commonErrors.phoneAreadyExists);
        }
        if (email) {
            const emailExists = await this.existsByEmail({
                email,
                tenantId,
            });
            if (emailExists) {
                throw this.root_util.createFriendlyError(this.commonErrors.emailAreadyExists);
            }
        }
        const plainUser = UtilService.convertObjectToJsonPlainObject(userData);
        const dataInput = await this.preFormatBeforeSaveUpdateData(plainUser);
        const dataMust = {
            tenantId,
            password: await BcryptService.createHashedPassword(password),
            accessFailedCount: 0,
            createdAtDate: new Date().toISOString(),
            isEmailConfirmed: false,
            isLockOutEnabled: false,
            isPhoneConfirmed: false,
            lastChangedString: UtilService.getUUID(),
        };
        const insertData = { ...dataInput, ...dataMust };
        const result = await this.base_createOne({
            data: insertData,
            sessionUser,
        });
        return result;
    }
    async updateMyInfo({ user, sessionUser }) {
        if (user.id !== sessionUser.userId) {
            throw this.root_util.createFriendlyError("You can only update your own info...");
        }
        const { firstName, lastName } = user;
        this.root_util.validateRequiredString({ firstName, lastName });
        const userInDb01 = await this.getUserById({
            userId: user.id,
            tenantId: sessionUser.tenantId,
            isLiteFields: false,
        });
        if (!userInDb01?.id) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNotFound);
        }
        if (user.email && userInDb01.email !== user.email) {
            const emailExists = await this.existsByEmail({
                email: user.email,
                tenantId: sessionUser.tenantId,
            });
            if (emailExists) {
                throw this.root_util.createFriendlyError(this.commonErrors.emailAreadyExists);
            }
        }
        const data01 = await this.preFormatBeforeSaveUpdateData(user);
        const dataInput = {
            address: data01.address,
            firstName: data01.firstName,
            lastName: data01.lastName,
            middleName: data01.middleName,
            email: data01.email,
            phone: data01.phone,
            dateOfBirth: data01.dateOfBirth,
            lastChangedString: UtilService.getUUID(),
            gender: data01.gender,
        };
        const plainUserInDb = UtilService.convertObjectToJsonPlainObject(userInDb01);
        const updateData = { ...plainUserInDb, ...dataInput };
        const result = await this.base_updateOne({
            dataId: updateData.id,
            updateData,
            sessionUser,
        });
        return result;
    }
    async preFormatBeforeSaveUpdateData(data01) {
        if (data01.phone) {
            const phoneData = await UtilService.findOnePhoneNumberFromText({
                phoneText: data01.phone,
                countryCallingCode: data01.countryCallingCode,
            });
            if (phoneData?.internationalNumber) {
                data01.phone = phoneData.internationalNumber;
            }
        }
        if (UtilService.isValidEmail(data01.userName)) {
            throw this.root_util.createFriendlyError("userName must NOT be an email");
        }
        return data01;
    }
    async updateUserInfoByAdmin({ user, sessionUser }) {
        const isUserAnAdministrator = await AdminService.isAdministratorUser({ sessionUser });
        if (!isUserAnAdministrator) {
            throw this.root_util.createFriendlyError("Only an admin can perform this action");
        }
        const { tenantId } = sessionUser;
        const { userName, firstName, lastName, userKind } = user;
        this.root_util.validateRequiredString({ userName, firstName, lastName });
        if (userKind && Array.isArray(userKind)) {
            const userKindsArray = getUserKindsArray();
            const isAllInList = userKind.every((item) => userKindsArray.includes(item));
            if (!isAllInList) {
                throw this.root_util.createFriendlyError("Invalid UserKind");
            }
        }
        const userInDb01 = await this.getUserById({
            userId: user.id,
            tenantId,
            isLiteFields: false,
        });
        if (!userInDb01?.id) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNotFound);
        }
        if (user.email && userInDb01.email !== user.email) {
            const emailExists = await this.existsByEmail({
                email: user.email,
                tenantId: sessionUser.tenantId,
            });
            if (emailExists) {
                throw this.root_util.createFriendlyError(this.commonErrors.emailAreadyExists);
            }
        }
        const data01 = await this.preFormatBeforeSaveUpdateData(user);
        const dataInput = {
            address: data01.address,
            firstName: data01.firstName,
            lastName: data01.lastName,
            middleName: data01.middleName,
            email: data01.email,
            phone: data01.phone,
            lastChangedString: UtilService.getUUID(),
            roleClaimIds: data01.roleClaimIds,
            userKind: data01.userKind,
            staffIdentificationId: user.staffIdentificationId,
            dateOfBirth: data01.dateOfBirth,
            gender: data01.gender,
        };
        const plainUserInDb = UtilService.convertObjectToJsonPlainObject(userInDb01);
        const updateData = { ...plainUserInDb, ...dataInput };
        const result = await this.base_updateOne({
            dataId: updateData.id,
            updateData,
            sessionUser,
        });
        return result;
    }
    async getUserById({ userId, tenantId, isLiteFields, }) {
        const result01 = await this.base_getOneByIdAndTenantId({
            tenantId,
            dataId: userId,
            fields: isLiteFields ? UserModel.getLiteFields() : undefined,
        });
        if (result01?.phone) {
            const phoneData = await UtilService.findOnePhoneNumberFromText({
                phoneText: result01.phone,
            });
            if (phoneData?.nationalNumber) {
                result01.phone = phoneData.nationalNumber;
                result01.countryCallingCode = `+${phoneData.countryCallingCode}`;
            }
        }
        return result01;
    }
    async getUserByEmail({ email, tenantId, isLiteFields, }) {
        const user = await this.base_getOneByTenantIdAndCondition({
            tenantId,
            query: { $or: [{ email }, { email: email.toLowerCase() }] },
            fields: isLiteFields ? UserModel.getLiteFields() : undefined,
        });
        if (user?.email?.toLowerCase() === email?.toLowerCase()) {
            return user;
        }
        return null;
    }
    async getUserByUserName({ userName, tenantId, isLiteFields, }) {
        const user = await this.base_getOneByTenantIdAndCondition({
            tenantId,
            query: { $or: [{ userName: userName }, { userName: userName.toLowerCase() }] },
            fields: isLiteFields ? UserModel.getLiteFields() : undefined,
        });
        if (user?.userName?.toLowerCase() === userName?.toLowerCase()) {
            return user;
        }
        return null;
    }
    async getUsersValueListByTenantId({ tenantId }) {
        const users = await this.base_getWhere({
            tenantId,
            fields: ["id", "firstName", "lastName"],
        });
        if (users?.length) {
            return users.map((item) => {
                return {
                    text: [item.lastName, item.firstName]
                        .filter((x) => x)
                        .map((x) => x.toUpperCase())
                        .join(" "),
                    value: item.id,
                };
            });
        }
        return [];
    }
    getUsersByTenantId({ tenantId, fields }) {
        return this.base_getWhere({
            tenantId,
            fields: fields?.length ? fields : UserModel.getLiteFields(),
        });
    }
    getAllUsersWithIds({ userIds, isLiteFields, fields, }) {
        return this.root_batchGetManyByIds({
            dataIds: userIds,
            fields: fields?.length ? fields : isLiteFields ? UserModel.getLiteFields() : undefined,
        });
    }
    getByUserKind({ tenantId, userKindTypes }) {
        return this.base_getWhere({
            tenantId,
            query: {
                userKind: {
                    $elemMatch: {
                        $in: userKindTypes,
                    },
                },
            },
            fields: UserModel.getLiteFields(),
        });
    }
    async getUsersWithIds({ usersIds, tenantId, isLiteFields, fields, }) {
        if (!usersIds?.length) {
            return [];
        }
        return await this.base_getManyByIdsAndTenantId({
            tenantId,
            dataIds: usersIds,
            fields: fields?.length ? fields : isLiteFields ? UserModel.getLiteFields() : undefined,
        });
    }
    async checkPasswordByUserData({ user, password }) {
        if (!(user?.id && user.password)) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNotFound);
        }
        const isMatched = await BcryptService.validatePassword(password, user.password);
        if (!isMatched) {
            throw this.root_util.createFriendlyError(ResponseMessage.wrongPassword);
        }
        return true;
    }
    async existsByEmail({ email, tenantId }) {
        const result = await this.base_getOneByTenantIdAndCondition({
            tenantId,
            query: { $or: [{ email: email }, { email: email.toLowerCase() }] },
            fields: ["id", "email"],
        });
        if (result?.id) {
            return true;
        }
        return false;
    }
    async existsByUserName({ userName, tenantId }) {
        const result = await this.base_getOneByTenantIdAndCondition({
            tenantId,
            query: { $or: [{ userName: userName }, { userName: userName.toLowerCase() }] },
            fields: ["id", "userName"],
        });
        if (result?.id) {
            return true;
        }
        return false;
    }
    async existsByPhone({ phone, tenantId }) {
        const result = await this.base_getOneByTenantIdAndCondition({
            tenantId,
            query: { phone },
            fields: ["id", "phone"],
        });
        if (result?.id) {
            return true;
        }
        return false;
    }
    async adminChangeAnyUserPassword({ userId, newPassword, confirmPassword, sessionUser, }) {
        if (!(userId && newPassword && confirmPassword)) {
            throw this.root_util.createFriendlyError(ResponseMessage.requiredParameterUndefined);
        }
        if (newPassword !== confirmPassword) {
            throw this.root_util.createFriendlyError("New password and confirm password mismatched");
        }
        const isUserAnAdministrator = await AdminService.isAdministratorUser({ sessionUser });
        if (!isUserAnAdministrator) {
            throw this.root_util.createFriendlyError("Only an admin can change other user's password.");
        }
        const user = await this.base_getOneByIdAndTenantId({
            tenantId: sessionUser.tenantId,
            dataId: userId,
            fields: undefined,
        });
        if (!user?.id) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNotFound);
        }
        user.password = await BcryptService.createHashedPassword(newPassword);
        await this.base_updateOne({
            dataId: user.id,
            updateData: user,
            sessionUser,
        });
        return true;
    }
    async updateMyPassword({ sessionUser, userId, oldPassword, newPassword, confirmPassword, }) {
        if (!userId) {
            throw this.root_util.createFriendlyError("User Id NOT found in the parameters");
        }
        if (!oldPassword) {
            throw this.root_util.createFriendlyError("Old Password is required");
        }
        if (!newPassword) {
            throw this.root_util.createFriendlyError("New Password is required");
        }
        if (!confirmPassword) {
            throw this.root_util.createFriendlyError("Confirm Password is required");
        }
        if (newPassword !== confirmPassword) {
            throw this.root_util.createFriendlyError("New password and confirm password mismatched");
        }
        if (userId !== sessionUser.userId) {
            throw this.root_util.createFriendlyError("You do NOT have priviledge to change other user's password");
        }
        const user = await this.base_getOneByIdAndTenantId({
            tenantId: sessionUser.tenantId,
            dataId: sessionUser.userId,
            fields: undefined,
        });
        if (!user?.id) {
            throw this.root_util.createFriendlyError(this.commonErrors.userNotFound);
        }
        const isMatched = await BcryptService.validatePassword(oldPassword, user.password);
        if (!isMatched) {
            throw this.root_util.createFriendlyError("Password Mismatched");
        }
        user.password = await BcryptService.createHashedPassword(newPassword);
        await this.base_updateOne({
            dataId: user.id,
            updateData: user,
            sessionUser,
        });
        return true;
    }
}
export const UserRepository = new UserRepositoryBase();
//# sourceMappingURL=user-repository.js.map