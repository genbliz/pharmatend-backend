export interface ISuperAdministrator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  createdAtDate?: string;
}

export interface ISuperAdminRemoteLoginResult {
  user: ISuperAdministrator;
  tenant?: ITenant;
  license: {
    valid?: boolean;
    expireAt?: string;
  };
}

export interface ITenant {
  id: string;
  shortCode: number;
  creatorUserAdminId: string;
  organizationName: string;
  email?: string;
  phone?: string;
  address: string;
  website?: string;
}
