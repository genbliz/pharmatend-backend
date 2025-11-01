import { Request, Response, Router } from "express";
import { BaseController } from "@/core/base-controller";
import { PaymentRepository } from "./payment-repository";
import { IPayment } from "./payment-types";
import { PaymentModel } from "./payment-model";
import { DateService } from "../../services/date-service";

async function getById(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        /* == */
        BaseController.DefinedRequiredPermission.payment.view,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await PaymentRepository.findSingle({ tenantId, dataId });

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

    const data: IPayment = { ...req.body };
    let result: IPayment;

    if (BaseController.isNewData(data)) {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.payment.add,
        ],
      });
      result = await PaymentRepository.save({ data, sessionUser });
      //
    } else {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.payment.edit,
        ],
      });
      result = await PaymentRepository.update({ data, sessionUser });
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
        BaseController.DefinedRequiredPermission.payment.delete,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await PaymentRepository.delete({ dataId, sessionUser });

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
        BaseController.DefinedRequiredPermission.payment.view,
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

    const builder = PaymentRepository.base_queryBuilder();

    builder.setCount(count);

    if (fromDate && toDate) {
      BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
      builder.addSortKeyQuery({
        $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
      });
    }

    if (isPaging === "true") {
      const result = await PaymentRepository.base_getWherePaging({
        tenantId,
        nextPageHash,
        query: builder.buildQuery(),
        limit: builder.props.count,
        sortKeyParams: {
          fieldName: "recordDate",
          query: builder.buildSortKeyQuery(),
          sort: builder.props.sort,
        },
        fields: PaymentModel.getLiteFields(),
      });

      return BaseController.resSuccessAdvanced({
        res,
        result,
      });
    }

    const result = await PaymentRepository.base_getWhere({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      sortKeyParams: {
        fieldName: "recordDate",
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
      },
      fields: PaymentModel.getLiteFields(),
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
export const PaymentRouter = myRouter;
