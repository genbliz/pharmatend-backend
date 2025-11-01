import dottie from "dottie";

export type IPermissionItem = {
  name: string;
  description: string;
};

interface IRoleSub {
  readonly view: IPermissionItem;
  readonly add: IPermissionItem;
  readonly edit: IPermissionItem;
  readonly delete: IPermissionItem;
}

// interface IRoleSubMy extends IRoleSub {
//   readonly viewMy: IPermissionItem;
// }

interface IAdminSub {
  readonly viewUserInfo: IPermissionItem;
  readonly createUser: IPermissionItem;
  readonly editUser: IPermissionItem;
  readonly deleteUser: IPermissionItem;
  readonly changeSystemSetting: IPermissionItem;
  readonly viewSystemDataAndReports: IPermissionItem;
  readonly superAdmin: IPermissionItem;
}

interface IRolesDef {
  readonly admin: IAdminSub;
  readonly payment: IRoleSub;
  readonly order: IRoleSub;
  readonly customer: IRoleSub;
  readonly product: IRoleSub;
  readonly supply: IRoleSub;
  readonly feed: IRoleSub;
  readonly sales: IRoleSub;
}

export const DefinedUserPermission: IRolesDef = {
  order: {
    view: {
      name: "order.view",
      description: "Can view order",
    },
    add: {
      name: "order.add",
      description: "Can add order",
    },
    edit: {
      name: "order.edit",
      description: "Can edit order figures or values",
    },
    delete: {
      name: "order.delete",
      description: "Can delete order",
    },
  },
  customer: {
    view: {
      name: "customer.view",
      description: "Can view customer info",
    },
    add: {
      name: "customer.add",
      description: "Can add customer",
    },
    edit: {
      name: "customer.edit",
      description: "Can edit customer information",
    },
    delete: {
      name: "customer.delete",
      description: "Can delete customer data",
    },
  },
  sales: {
    view: {
      name: "sales.view",
      description: "Can view sales",
    },
    add: {
      name: "sales.add",
      description: "Can add sales",
    },
    edit: {
      name: "sales.edit",
      description: "Can edit sales figures or values",
    },
    delete: {
      name: "sales.delete",
      description: "Can delete sales figure",
    },
  },
  admin: {
    changeSystemSetting: {
      name: "admin.changeSystemSetting",
      description: "Can change System Settings",
    },
    createUser: {
      name: "admin.createUser",
      description: "Can create User",
    },
    deleteUser: {
      name: "admin.deleteUser",
      description: "Can delete User",
    },
    editUser: {
      name: "admin.editUser",
      description: "Can edit User",
    },
    viewSystemDataAndReports: {
      name: "admin.viewSystemDataAndReports",
      description: "Can view view System Data And Reports",
    },
    viewUserInfo: {
      name: "admin.viewUserInfo",
      description: "Can view user information",
    },
    superAdmin: {
      name: "admin.superAdmin",
      description: "Assign superAdmin level priviledge",
    },
  },
  feed: {
    view: {
      name: "sales.view",
      description: "Can view sales",
    },
    add: {
      name: "sales.add",
      description: "Can add sales",
    },
    edit: {
      name: "sales.edit",
      description: "Can edit sales figures or values",
    },
    delete: {
      name: "sales.delete",
      description: "Can delete sales figure",
    },
  },
  payment: {
    view: {
      name: "payment.view",
      description: "Can view payment",
    },
    add: {
      name: "payment.add",
      description: "Can add payment",
    },
    edit: {
      name: "payment.edit",
      description: "Can edit payment item",
    },
    delete: {
      name: "payment.delete",
      description: "Can delete payment",
    },
  },
  product: {
    view: {
      name: "product.view",
      description: "Can view products",
    },
    add: {
      name: "product.add",
      description: "Can add product",
    },
    edit: {
      name: "product.edit",
      description: "Can edit product item",
    },
    delete: {
      name: "product.delete",
      description: "Can delete product",
    },
  },
  supply: {
    view: {
      name: "supply.view",
      description: "Can view supplies",
    },
    add: {
      name: "supply.add",
      description: "Can add supplies",
    },
    edit: {
      name: "supply.edit",
      description: "Can edit supplies items",
    },
    delete: {
      name: "supply.delete",
      description: "Can delete supply",
    },
  },
};

export function getAllAuthorizationPermissionParameters() {
  const allClaims: string[] = [];

  const permissionFlattened02 = dottie.flatten(DefinedUserPermission, "__");
  const permissionItemObj: Record<string, IPermissionItem> = {};
  const permissionFlattenedObj: Record<string, string> = {};

  Object.entries(permissionFlattened02).forEach(([key, value]) => {
    if (key.endsWith("__name")) {
      const index = key.lastIndexOf("__name");
      const key01 = key.slice(0, index);

      console.log({ key01 });

      if (!permissionItemObj[key01]) {
        permissionItemObj[key01] = {} as IPermissionItem;
      }
      permissionItemObj[key01].name = value;
      //
      allClaims.push(value);
      permissionFlattenedObj[key01] = value;
      //
    } else if (key.endsWith("__description")) {
      const index = key.lastIndexOf("__description");
      const key02 = key.slice(0, index);
      console.log({ key02 });
      if (!permissionItemObj[key02]) {
        permissionItemObj[key02] = {} as IPermissionItem;
      }

      permissionItemObj[key02].description = value;
    }
  });

  const permissionTypesKeyValue = Object.keys(permissionFlattenedObj)
    .map((key) => `${key}: string;\n`)
    .join(" ");

  const permissionFlattenedInterface = `export interface IPermission { ${permissionTypesKeyValue} }`;

  return {
    adminClaims: allClaims,
    permissionItems: Object.values(permissionItemObj),
    permissionFlattened: permissionFlattenedObj,
    permissionFlattenedInterface,
  };
}
