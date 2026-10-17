export type CanconOrganization = {
  id?: string;
  name?: string;
  version?: number;
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

type CanconReceipt = {
  id: string;
  receiptNumber: string;
  fileID: string;
  datePaid: string;
  amountPaid: string;
};

export type CanconOrder = {
  id: string;
  name: string;
  status: string;
  totalSalePrice: {
    amount: string;
    currency: string;
    type: string;
    plan: string;
    interval: string;
    components: {
      name: string;
      amount: string;
      tiers: any[];
    }[];
    tieredAmount: {
      upperLimit: number;
      amount: string;
    }[];
    origin: string;
  };
};

export type CanconInvoice = {
  id: string;
  organizationID: string;
  orderID: string;
  fileID: string;
  invoiceNumber: string;
  createdAt: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  receipts: CanconReceipt[];
  order: CanconOrder;
};
