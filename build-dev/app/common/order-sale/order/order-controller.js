import { Router } from "express";
import { BaseController } from "@/core/base-controller.js";
import { OrderRepository } from "./order-repository.js";
import { OrderModel } from "./order-model.js";
import { DateService } from "../../../services/date-service.js";
import { SaleRepository } from "../sale/sale-repository.js";
async function getById(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.order.view,
            ],
        });
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const result = await OrderRepository.findSingle({ tenantId, dataId });
        if (result?.id) {
            result["sales"] = await SaleRepository.getByOrderId({ orderId: result.id, tenantId });
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
async function save(req, res) {
    try {
        const sessionUser = await BaseController.getSessionUserInfo({ req });
        const data = { ...req.body };
        let result;
        if (BaseController.isNewData(data)) {
            await BaseController.checkValidateHasPermission({
                req,
                requiredAnyPermission: [
                    BaseController.DefinedRequiredPermission.order.add,
                ],
            });
            result = await OrderRepository.save({ data, sessionUser });
        }
        else {
            await BaseController.checkValidateHasPermission({
                req,
                requiredAnyPermission: [
                    BaseController.DefinedRequiredPermission.order.edit,
                ],
            });
            result = await OrderRepository.update({ data, sessionUser });
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
                BaseController.DefinedRequiredPermission.order.delete,
            ],
        });
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const result = await OrderRepository.delete({ dataId, sessionUser });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function queryAdvanced(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.order.view,
            ],
        });
        const { count, fromDate, toDate, isPaging, nextPageHash, } = BaseController.parseStringQueryT(req.query);
        const customerId = req.params.customerId;
        if (customerId) {
            const builder = OrderRepository.base_target_queryBuilder();
            builder.setCount(count);
            if (fromDate && toDate) {
                BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
                builder.addSortKeyQuery({
                    $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
                });
            }
            if (isPaging === "true") {
                const result = await OrderRepository.base_target_getWherePaging({
                    tenantId,
                    targetId: customerId,
                    nextPageHash,
                    query: builder.buildQuery(),
                    limit: builder.props.count,
                    sortKeyParams: {
                        fieldName: "createdAtDate",
                        query: builder.buildSortKeyQuery(),
                        sort: builder.props.sort,
                    },
                    fields: OrderModel.getLiteFields(),
                });
                return BaseController.resSuccessAdvanced({
                    res,
                    result,
                });
            }
            const result = await OrderRepository.base_target_getWhere({
                tenantId,
                targetId: customerId,
                query: builder.buildQuery(),
                limit: builder.props.count,
                sortKeyParams: {
                    fieldName: "createdAtDate",
                    query: builder.buildSortKeyQuery(),
                    sort: builder.props.sort,
                },
                fields: OrderModel.getLiteFields(),
            });
            return BaseController.resSuccess({
                res,
                data: result,
            });
        }
        const builder = OrderRepository.base_queryBuilder();
        builder.setCount(count);
        if (fromDate && toDate) {
            BaseController.validateDayStamp_YYYY_MM_DD({ fromDate, toDate });
            builder.addSortKeyQuery({
                $between: DateService.orderBetweenDateStamps([fromDate, toDate]),
            });
        }
        if (isPaging === "true") {
            const result = await OrderRepository.base_getWherePaging({
                tenantId,
                nextPageHash,
                query: builder.buildQuery(),
                limit: builder.props.count,
                sortKeyParams: {
                    fieldName: "createdAtDate",
                    query: builder.buildSortKeyQuery(),
                    sort: builder.props.sort,
                },
                fields: OrderModel.getLiteFields(),
            });
            return BaseController.resSuccessAdvanced({
                res,
                result,
            });
        }
        const result = await OrderRepository.base_getWhere({
            tenantId,
            query: builder.buildQuery(),
            limit: builder.props.count,
            sortKeyParams: {
                fieldName: "createdAtDate",
                query: builder.buildSortKeyQuery(),
                sort: builder.props.sort,
            },
            fields: OrderModel.getLiteFields(),
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
async function queryTarget(req, res) {
    try {
        BaseController.validateParameterStringValue({ customerId: req.params.customerId });
        return queryAdvanced(req, res);
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
            tempOrderShortCode: OrderRepository.getOrderCode(),
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
const myRouter = Router();
myRouter.post("/", [save]);
myRouter.get("/", [queryAdvanced]);
myRouter.get("/start", [getStartData]);
myRouter.get("/customer/:customerId", [queryTarget]);
myRouter.get("/:id", [getById]);
myRouter.delete("/:id", [deleteData]);
export const OrderRouter = myRouter;
//# sourceMappingURL=order-controller.js.map