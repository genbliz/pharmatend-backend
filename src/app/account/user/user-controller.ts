import { IUserChangeMyPasswordDto } from "./../auth/auth-types.js";
import express, { Router } from "express";
import { UserRepository } from "./user-repository.js";
import { IUser, getUserKindsArray, UserKindsEnum } from "./user-types.js";
import { BaseController } from "@/core/base-controller.js";
import { UserModel } from "./user-model.js";
import { UtilService } from "../../services/util-service.js";

interface IRequestParams {
  count?: number;
  isPaging?: boolean;
  searchTerm?: string;
}

async function getById(req: express.Request, res: express.Response) {
  try {
    const userId: string = req.params.id;
    BaseController.validateParameterStringValue({ userId });

    const { tenantId } = await BaseController.getSessionUserInfo({ req });

    const result = await UserRepository.getUserById({
      userId,
      tenantId,
      isLiteFields: false,
    });

    const result01 = { ...result, password: undefined };

    return BaseController.resSuccess({
      res,
      data: result01,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function myInfo(req: express.Request, res: express.Response) {
  try {
    const { tenantId, userId } = await BaseController.getSessionUserInfo({ req });

    const result = await UserRepository.getUserById({
      userId,
      tenantId,
      isLiteFields: true,
    });

    const result01 = { ...result, password: undefined };

    return BaseController.resSuccess({
      res,
      data: result01,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function userValueList(req: express.Request, res: express.Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });

    const result = await UserRepository.getUsersValueListByTenantId({ tenantId });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getUsersByTenantId(req: express.Request, res: express.Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });
    //
    const result = await UserRepository.getUsersByTenantId({ tenantId });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getUserDoctors(req: express.Request, res: express.Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });
    //
    const result = await UserRepository.getByUserKind({
      tenantId,
      userKindTypes: [UserKindsEnum.DOCTOR],
    });
    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getUserNurses(req: express.Request, res: express.Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });
    //
    const result = await UserRepository.getByUserKind({
      tenantId,
      userKindTypes: [UserKindsEnum.NURSE],
    });
    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getAllSearch(req: express.Request, res: express.Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });

    const { isPaging } = BaseController.parseOnlyBooleanQuery(req.query);
    const { searchTerm, count, nextPageHash } = BaseController.parseStringQueryT<IRequestParams>(req.query);

    const builder = UserRepository.base_queryBuilder();

    builder.setCount(count);

    if (!searchTerm) {
      if (isPaging) {
        const result = await UserRepository.base_getWherePaging({
          tenantId,
          nextPageHash,
          limit: builder.props.count,
          fields: UserModel.getLiteFields(),
          sortKeyParams: {
            fieldName: "createdAtDate",
            sort: "asc",
          },
        });
        return BaseController.resSuccessPaging({
          res,
          result,
        });
      }

      const result = await UserRepository.base_getWhere({
        tenantId,
        fields: UserModel.getLiteFields(),
        limit: builder.props.count,
      });
      return BaseController.resSuccess({
        res,
        data: result,
      });
    }

    const searchTermVal: string = searchTerm.trim().toLowerCase();

    const isNumeric = UtilService.isNumeric(searchTermVal);

    const multiSearchTerm = searchTermVal
      .split(" ")
      .filter((x) => x)
      .map((x) => x.trim());

    const addressQuery = [
      {
        address: { $contains: searchTermVal },
      },
      {
        address: { $contains: searchTermVal.toLowerCase() },
      },
      {
        address: { $contains: searchTermVal.toUpperCase() },
      },
    ];

    if (isNumeric) {
      builder.addQuery({
        $or: [
          {
            phone: { $contains: searchTermVal.startsWith("0") ? searchTermVal.slice(1) : searchTermVal },
          },
          ...addressQuery,
        ],
      });
    } else if (multiSearchTerm.length > 1) {
      const [multiVal1, multiVal2, multiVal3] = multiSearchTerm;

      let partQuery: any[] = [];

      if (UtilService.isLikeStreetAddress(searchTermVal)) {
        partQuery = [...addressQuery];
      }

      builder.addQuery({
        $or: [
          {
            firstName: { $beginsWith: multiVal1 },
            lastName: { $beginsWith: multiVal2 },
          },
          {
            firstName: { $beginsWith: multiVal2 },
            lastName: { $beginsWith: multiVal1 },
          },
          ...partQuery,
        ],
      });

      if (multiSearchTerm.length > 2) {
        builder.addQuery({
          $or: [
            // For First Name
            {
              firstName: { $beginsWith: multiVal1 },
              lastName: { $beginsWith: multiVal2 },
              middleName: { $beginsWith: multiVal3 },
            },
            {
              firstName: { $beginsWith: multiVal1 },
              lastName: { $beginsWith: multiVal3 },
              middleName: { $beginsWith: multiVal2 },
            },
            // For Last Name
            {
              firstName: { $beginsWith: multiVal2 },
              lastName: { $beginsWith: multiVal1 },
              middleName: { $beginsWith: multiVal3 },
            },
            {
              firstName: { $beginsWith: multiVal3 },
              lastName: { $beginsWith: multiVal1 },
              middleName: { $beginsWith: multiVal2 },
            },
            // For middleName
            {
              firstName: { $beginsWith: multiVal2 },
              lastName: { $beginsWith: multiVal3 },
              middleName: { $beginsWith: multiVal1 },
            },
            {
              firstName: { $beginsWith: multiVal3 },
              lastName: { $beginsWith: multiVal2 },
              middleName: { $beginsWith: multiVal1 },
            },
            ...partQuery,
          ],
        });
      }
    } else {
      let partQuery: any[] = [];

      if (UtilService.isLikeStreetAddress(searchTermVal)) {
        partQuery = [...addressQuery];
      }

      builder.addQuery({
        $or: [
          {
            firstName: { $contains: searchTermVal },
          },
          {
            lastName: { $contains: searchTermVal },
          },
          {
            middleName: { $contains: searchTermVal },
          },
          {
            email: { $contains: searchTermVal },
          },
          {
            phone: { $contains: searchTermVal.startsWith("0") ? searchTermVal.slice(1) : searchTermVal },
          },
          ...partQuery,
        ],
      });
    }

    const result = await UserRepository.base_getWherePaging({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count || BaseController.DEFAULT_PAGE_SIZE,
      fields: UserModel.getLiteFields(),
      nextPageHash,
      sortKeyParams: {
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
        fieldName: "createdAtDate",
      },
    });

    return BaseController.resSuccessPaging({
      res,
      result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function updateMyInfo(req: express.Request, res: express.Response) {
  try {
    const user: IUser = req.body;
    const sessionUser = await BaseController.getSessionUserInfo({ req });
    const result = await UserRepository.updateMyInfo({ user, sessionUser });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function updateUserInfoByAdmin(req: express.Request, res: express.Response) {
  try {
    const user: IUser = req.body;
    const sessionUser = await BaseController.getSessionUserInfo({ req });
    const result = await UserRepository.updateUserInfoByAdmin({ user, sessionUser });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function adminChangeAnyUserPassword(req: express.Request, res: express.Response) {
  try {
    const user: { userId: string; newPassword: string; confirmPassword: string } = req.body;
    const sessionUser = await BaseController.getSessionUserInfo({ req });

    await UserRepository.adminChangeAnyUserPassword({
      ...user,
      sessionUser,
    });

    return BaseController.resSuccess({
      res,
      data: null,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function changeMyPassword(req: express.Request, res: express.Response) {
  try {
    const data: IUserChangeMyPasswordDto = req.body;
    const sessionUser = await BaseController.getSessionUserInfo({ req });
    //
    const result = await UserRepository.updateMyPassword({
      sessionUser,
      oldPassword: data.oldPassword,
      userId: data.userId,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getChatUsers(req: express.Request, res: express.Response) {
  try {
    const { tenantId, userId } = await BaseController.getSessionUserInfo({ req });
    //
    const result = await UserRepository.getUsersByTenantId({
      tenantId,
      fields: ["id", "lastName", "firstName", "userName"],
    });

    const resultFinal01: IUser[] = [];

    if (result?.length) {
      result.forEach((f) => {
        if (f.id !== userId && f.isLockOutEnabled !== true) {
          const item = {
            id: f.id,
            lastName: f.lastName,
            firstName: f.firstName,
            userName: f.userName,
            tenantId: f.tenantId,
            email: f.email,
            phone: f.phone,
          } as IUser;
          resultFinal01.push(item);
        }
      });
    }

    return BaseController.resSuccess({
      res,
      data: resultFinal01,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

function getUserKindsValueList(req: express.Request, res: express.Response) {
  const statusList: string[] = getUserKindsArray();
  return BaseController.resSuccess({
    res,
    data: statusList,
  });
}

const router = Router();
//
router.get(`/`, [getAllSearch]);
router.get(`/chat-users`, [getChatUsers]);
router.get(`/active`, [getUsersByTenantId]);
router.get(`/doctors`, [getUserDoctors]);
router.get(`/nurses`, [getUserNurses]);
router.get(`/value-list`, [userValueList]);
router.get(`/kind-value-list`, [getUserKindsValueList]);
router.get(`/my/info`, [myInfo]);
router.get(`/:id`, [getById]);
//
router.post(`/my/update-info`, [updateMyInfo]);
router.post(`/my/change-password`, [changeMyPassword]);
//
router.post(`/admin/change-any-user-password`, [adminChangeAnyUserPassword]);
router.post(`/admin/update-any-user`, [updateUserInfoByAdmin]);

export const UserRouter = router;
