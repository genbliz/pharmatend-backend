import { Request, Response, Router } from "express";
import { BaseController } from "@/core/base-controller.js";
import { ProductRepository } from "@/common/product/product-repository.js";
import { IProduct, IProductExtra, ProductCategoryEnum } from "@/common/product/product-types.js";
import { DateService } from "@/services/date-service.js";
import { ProductModel } from "@/common/product/product-model.js";

interface IRequestParams {
  fromDate?: string;
  toDate?: string;
  count?: number;
  isPaging?: boolean;
  //
  searchTerm?: string;
}

async function getById(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        /* == */
        BaseController.DefinedRequiredPermission.product.view,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await ProductRepository.findSingle({ tenantId, dataId });

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

    const data: IProduct = { ...req.body };
    let result: IProduct;

    if (BaseController.isNewData(data)) {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.product.add,
        ],
      });
      result = await ProductRepository.save({ data, sessionUser });
      //
    } else {
      await BaseController.checkValidateHasPermission({
        req,
        requiredAnyPermission: [
          /* == */
          BaseController.DefinedRequiredPermission.product.edit,
        ],
      });
      result = await ProductRepository.update({ data, sessionUser });
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
        BaseController.DefinedRequiredPermission.product.delete,
      ],
    });

    const dataId: string = req.params.id;
    BaseController.validateParameterStringValue({ dataId });

    const result = await ProductRepository.delete({ dataId, sessionUser });

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
        BaseController.DefinedRequiredPermission.product.view,
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

    const builder = ProductRepository.base_queryBuilder();

    builder.setCount(count);

    if (fromDate && toDate) {
      BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
      builder.addSortKeyQuery({
        $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
      });
    }

    if (isPaging === "true") {
      const result = await ProductRepository.base_getWherePaging({
        tenantId,
        nextPageHash,
        query: builder.buildQuery(),
        limit: builder.props.count,
        sortKeyParams: {
          fieldName: "recordDate",
          query: builder.buildSortKeyQuery(),
          sort: builder.props.sort,
        },
        fields: ProductModel.getLiteFields(),
      });

      return BaseController.resSuccessAdvanced({
        res,
        result,
      });
    }

    const result = await ProductRepository.base_getWhere({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      sortKeyParams: {
        fieldName: "recordDate",
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
      },
      fields: ProductModel.getLiteFields(),
    });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getStartData(req: Request, res: Response) {
  try {
    await BaseController.getSessionUserInfo({
      req,
      // withAnyPermission: [],
    });

    const startData = {
      categoryOptions: Object.values(ProductCategoryEnum).map((f) => {
        return {
          text: f,
          value: f,
        };
      }),
    } as IProductExtra;

    return BaseController.resSuccess({
      res,
      data: startData,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getByCodeOrId(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        //
        BaseController.DefinedRequiredPermission.product.view,
      ],
    });

    const code = req.query.code as string;

    BaseController.validateParameterStringValue({ code });

    if (code.length > 20 && code.includes("-")) {
      const result = await ProductRepository.findSingle({ dataId: code, tenantId });
      return BaseController.resSuccess({
        res,
        data: result,
      });
    }

    const builder = ProductRepository.base_queryBuilder();

    builder.setCount(1);
    builder.addSortKeyQuery({ $eq: code });

    const [result] = await ProductRepository.base_getWhere({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      sortKeyParams: {
        fieldName: "stringCode",
        query: builder.buildSortKeyQuery(),
        sort: builder.props.sort,
      },
      fields: ProductModel.getLiteFields(),
    });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function searchQuery(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        //
        BaseController.DefinedRequiredPermission.product.view,
      ],
    });

    const { searchTerm, count, nextPageHash } = BaseController.parseStringQueryT<IRequestParams>(req.query);
    const builder = ProductRepository.base_queryBuilder();

    BaseController.validateParameterStringValue({ searchTerm });

    const searchTermVal: string = searchTerm.trim();

    builder.setCount(count || 20);

    builder.addQuery({
      $or: [
        {
          name: { $beginsWith: searchTermVal.toLowerCase() },
        },
        {
          name: { $contains: searchTermVal.toLowerCase() },
        },
        {
          category: { $eq: searchTermVal.toUpperCase() as ProductCategoryEnum },
        },
        {
          category: { $eq: searchTermVal.toUpperCase() as ProductCategoryEnum },
        },
      ],
    });

    const result = await ProductRepository.base_getWherePaging({
      tenantId,
      query: builder.buildQuery(),
      limit: builder.props.count,
      fields: ProductModel.getLiteFields(),
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

const myRouter = Router();
//
myRouter.post("/", [save]);
//
myRouter.get("/", [query]);
myRouter.get("/code", [getByCodeOrId]);
myRouter.get("/start", [getStartData]);
myRouter.get("/search", [searchQuery]);
myRouter.get("/:id", [getById]);
//
myRouter.delete("/:id", [deleteData]);
//
export const ProductRouter = myRouter;
