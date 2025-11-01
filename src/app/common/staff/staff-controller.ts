import { Request, Response, Router } from "express";
import { BaseController } from "@/core/base-controller";
import { StaffRepository } from "./staff-repository";
import { IStaff } from "./staff-types";
import { StaffModel } from "./staff-model";
import { DateService } from "../../services/date-service";

async function getById(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        /* == */
        BaseController.DefinedRequiredPermission.admin.viewUserInfo,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await StaffRepository.findSingle({ tenantId, dataId });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function save(req: Request, res: Response) {
  try {
    const sessionUser = await BaseController.getSessionUserInfo({ req });

    const data: IStaff = { ...req.body };
    let result: IStaff;

    if (BaseController.isNewData(data)) {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.admin.editUser,
        ],
      });
      result = await StaffRepository.save({ data, sessionUser });
      //
    } else {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.admin.createUser,
        ],
      });
      result = await StaffRepository.update({ data, sessionUser });
    }

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function deleteData(req: Request, res: Response) {
  try {
    const sessionUser = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        /* == */
        BaseController.DefinedRequiredPermission.admin.deleteUser,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await StaffRepository.delete({ dataId, sessionUser });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function query(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        //
        // BaseController.DefinedRequiredPermission.admin.viewUserInfo,
      ],
    });

    const {
      //
      count,
      fromDate,
      toDate,
      isPaging,
      nextPageHash,
    } = BaseController.parseStringQueryT(req.query);

    const builder = StaffRepository.base_queryBuilder();

    builder.setCount(count);

    if (fromDate && toDate) {
      BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
      builder.addSortKeyQuery({
        $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
      });
    }

    if (isPaging === "true") {
      const result = await StaffRepository.base_getWherePaging({
        tenantId,
        nextPageHash,
        query: builder.buildQuery(),
        limit: builder.props.count,
        sortKeyParams: {
          fieldName: "recordDate",
          query: builder.buildSortKeyQuery(),
          sort: builder.props.sort,
        },
        fields: StaffModel.getLiteFields(),
      });

      return BaseController.resSuccessAdvanced({
        res,
        result,
      });
    }

    const result = await StaffRepository.base_getWhere({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      sortKeyParams: {
        fieldName: "recordDate",
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
      },
      fields: StaffModel.getLiteFields(),
    });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

const myRouter = Router();
//
myRouter.post("/", [save]);
//
myRouter.get("/", [query]);
myRouter.get("/:id", [getById]);
//
myRouter.delete("/:id", [deleteData]);
//
export const StaffRouter = myRouter;
