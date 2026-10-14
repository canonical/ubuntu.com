export type UpdateOrganizationInput = {
  name?: string;
  address?: {
    city: string;
    country: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    state?: string;
  };
  version?: string;
  vatCode?: string;
  isPersonal?: boolean;
};

export type Organization = {
  id: string;
  name: string;
  version: number;
  address: {
    city: string;
    country: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    state?: string;
  };
  vatCode?: string;
  isPersonal?: boolean;
};
