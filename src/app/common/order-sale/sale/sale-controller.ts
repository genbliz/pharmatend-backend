import { Request, Response, Router } from "express";
import { BaseController } from "@/core/base-controller.js";
import { SaleRepository } from "@/common/order-sale/sale/sale-repository.js";
import { ISale } from "@/common/order-sale/sale/sale-types.js";
import { SaleModel } from "@/common/order-sale/sale/sale-model.js";
import { DateService } from "@/services/date-service.js";

async function getById(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        /* == */
        BaseController.DefinedRequiredPermission.sales.view,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await SaleRepository.findSingle({ tenantId, dataId });

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

    const data: ISale = { ...req.body };
    let result: ISale;

    if (BaseController.isNewData(data)) {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.sales.add,
        ],
      });
      result = await SaleRepository.save({ data, sessionUser });
      //
    } else {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.sales.edit,
        ],
      });
      result = await SaleRepository.update({ data, sessionUser });
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
        BaseController.DefinedRequiredPermission.sales.delete,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await SaleRepository.delete({ dataId, sessionUser });

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
        BaseController.DefinedRequiredPermission.sales.view,
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

    const builder = SaleRepository.base_queryBuilder();

    builder.setCount(count);

    if (fromDate && toDate) {
      BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
      builder.addSortKeyQuery({
        $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
      });
    }

    if (isPaging === "true") {
      const result = await SaleRepository.base_getWherePaging({
        tenantId,
        nextPageHash,
        query: builder.buildQuery(),
        limit: builder.props.count,
        sortKeyParams: {
          fieldName: "recordDate",
          query: builder.buildSortKeyQuery(),
          sort: builder.props.sort,
        },
        fields: SaleModel.getLiteFields(),
      });

      return BaseController.resSuccessAdvanced({
        res,
        result,
      });
    }

    const result = await SaleRepository.base_getWhere({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      sortKeyParams: {
        fieldName: "recordDate",
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
      },
      fields: SaleModel.getLiteFields(),
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
export const SaleRouter = myRouter;
