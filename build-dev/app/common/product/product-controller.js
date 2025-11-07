import { Router } from "express";
import { BaseController } from "@/core/base-controller.js";
import { ProductRepository } from "./product-repository.js";
import { ProductCategoryEnum } from "./product-types.js";
import { DateService } from "../../services/date-service.js";
import { ProductModel } from "./product-model.js";
async function getById(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.product.view,
            ],
        });
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const result = await ProductRepository.findSingle({ tenantId, dataId });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function save(req, res) {
    try {
        const sessionUser = await BaseController.getSessionUserInfo({ req });
        const data = { ...req.body };
        let result;
        if (BaseController.isNewData(data)) {
            await BaseController.checkValidateHasPermission({
                req,
                requiredAnyPermission: [
                    BaseController.DefinedRequiredPermission.product.add,
                ],
            });
            result = await ProductRepository.save({ data, sessionUser });
        }
        else {
            await BaseController.checkValidateHasPermission({
                req,
                requiredAnyPermission: [
                    BaseController.DefinedRequiredPermission.product.edit,
                ],
            });
            result = await ProductRepository.update({ data, sessionUser });
        }
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function deleteData(req, res) {
    try {
        const sessionUser = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.product.delete,
            ],
        });
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const result = await ProductRepository.delete({ dataId, sessionUser });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function query(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.product.view,
            ],
        });
        const { count, fromDate, toDate, isPaging, nextPageHash, } = BaseController.parseStringQueryT(req.query);
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
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function getStartData(req, res) {
    try {
        await BaseController.getSessionUserInfo({
            req,
        });
        const startData = {
            categoryOptions: Object.values(ProductCategoryEnum).map((f) => {
                return {
                    text: f,
                    value: f,
                };
            }),
        };
        return BaseController.resSuccess({
            res,
            data: startData,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function getByCodeOrId(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.product.view,
            ],
        });
        const code = req.query.code;
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
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function searchQuery(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.product.view,
            ],
        });
        const { searchTerm, count, nextPageHash } = BaseController.parseStringQueryT(req.query);
        const builder = ProductRepository.base_queryBuilder();
        BaseController.validateParameterStringValue({ searchTerm });
        const searchTermVal = searchTerm.trim();
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
                    category: { $eq: searchTermVal.toUpperCase() },
                },
                {
                    category: { $eq: searchTermVal.toUpperCase() },
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
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
const myRouter = Router();
myRouter.post("/", [save]);
myRouter.get("/", [query]);
myRouter.get("/code", [getByCodeOrId]);
myRouter.get("/start", [getStartData]);
myRouter.get("/search", [searchQuery]);
myRouter.get("/:id", [getById]);
myRouter.delete("/:id", [deleteData]);
export const ProductRouter = myRouter;
//# sourceMappingURL=product-controller.js.map