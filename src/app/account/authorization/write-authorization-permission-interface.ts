import fs from "fs";
import { getAllAuthorizationPermissionParameters } from "@/account/authorization/authorization-permission.js";

const {
  //
  permissionFlattenedInterface,
  permissionFlattened,
  permissionItems,
  adminClaims,
} = getAllAuthorizationPermissionParameters();

fs.writeFileSync("authorization-permission-types.ts", permissionFlattenedInterface);
fs.writeFileSync("authorization-permission.json", JSON.stringify(permissionFlattened, null, 2));
fs.writeFileSync("authorization-permission-item.json", JSON.stringify(permissionItems, null, 2));
fs.writeFileSync("authorization-permission-adminClaims.json", JSON.stringify(adminClaims, null, 2));
