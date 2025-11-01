import express from "express";
import { ProductRouter } from "@/common/product/product-controller";
import { RoleClaimRoute } from "@/account/role-claim/role-claim-controller";
import { CustomerRouter } from "@/common/customer/customer-controller";
import { OrderRouter } from "@/common/order-sale/order/order-controller";
import { SaleRouter } from "@/common/order-sale/sale/sale-controller";
import { PaymentRouter } from "@/common/payment/payment-controller";
import { StaffRouter } from "@/common/staff/staff-controller";
import { TenantSettingRoute } from "@/common/tenant/tenant-setting/tenant-setting-controller";
import { UserRouter } from "../account/user/user-controller";
import { AuthRouter } from "../account/auth/auth-controller";

const myRouter = express.Router();

myRouter.use("/product", [ProductRouter]);
myRouter.use("/staff", [StaffRouter]);
myRouter.use("/customer", [CustomerRouter]);
myRouter.use("/order", [OrderRouter]);
myRouter.use("/sale", [SaleRouter]);
myRouter.use("/payment", [PaymentRouter]);
myRouter.use("/setting", [TenantSettingRoute]);
myRouter.use("/role-claim", [RoleClaimRoute]);
myRouter.use("/user", [UserRouter]);
myRouter.use("/auth", [AuthRouter]);

//
export const ApiRoutesResolver = myRouter;
