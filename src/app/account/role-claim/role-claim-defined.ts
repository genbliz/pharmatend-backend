import { IPermissionItem } from "@/account/authorization/authorization-permission.js";
import { DefinedUserPermission } from "@/account/authorization/authorization-permission.js";
import { IRoleClaim } from "@/account/role-claim/role-claim-type.js";

type IDefined = Partial<Omit<IRoleClaim, "claims"> & { claims: IPermissionItem[] }>;

const roleClaimDefined: IDefined[] = [
  {
    claims: [
      //
      DefinedUserPermission.feed.view,
      DefinedUserPermission.feed.add,
      //
      DefinedUserPermission.product.add,
      DefinedUserPermission.product.view,
      //
      DefinedUserPermission.order.view,
      DefinedUserPermission.payment.view,
      DefinedUserPermission.sales.view,
    ],
    roleName: "System Stock Administrator",
    description: "",
  },
  {
    claims: [
      DefinedUserPermission.payment.add,
      DefinedUserPermission.payment.view,
      DefinedUserPermission.order.view,
      DefinedUserPermission.order.add,
    ],
    roleName: "System Cashier",
    description: "",
  },
];

export function getPreDefinedRoleClaim() {
  return [...roleClaimDefined];
}
