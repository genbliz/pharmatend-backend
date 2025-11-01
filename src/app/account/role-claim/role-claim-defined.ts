import { IPermissionItem } from "./../authorization/authorization-permission";
import { DefinedUserPermission } from "../authorization/authorization-permission";
import { IRoleClaim } from "./role-claim-type";

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
