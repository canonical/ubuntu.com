import { CanconOrganization, CanconInvoice } from "./cancon.types";

interface Subscription {
  autoRenew: boolean;
  createdAt: string;
  currency: string;
  cycleDurationUnit: string;
  endDate: string;
  id: string;
  modifiedAt: string;
  organizationID: string;
  paymentMethodID: string;
  productFamily: string;
  startDate: string;
  status: string;
  trialEndDate: string;
}
export interface listSubscriptionResponse {
  paginationMetadata: {
    totalRecords: number;
  };
  subscriptions: Array<Subscription>;
}
export const listSubscriptions =
  async (): Promise<listSubscriptionResponse> => {
    const response = await fetch(`/portal-proxy/api/subscription`);
    return response.json();
  };

export const listOrganizationPaymentMethods = async (): Promise<any> => {
  const response = await fetch(
    `/portal-proxy/api/organization/payment-methods`,
  );
  return response.json();
};

export const attachPaymentMethodToSubscription = async (
  subscriptionId: string,
  paymentMethodId: string,
): Promise<void> => {
  await fetch(
    `/portal-proxy/api/subscription/${subscriptionId}/payment-method`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentMethodId }),
    },
  );
};

export const updateOrganization = async (
  organizationId: string,
  payload: CanconOrganization,
): Promise<void> => {
  await fetch(`/portal-proxy/api/organization/${organizationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const fetchUserOrganization = async (): Promise<CanconOrganization> => {
  const response = await fetch(
    `/portal-proxy/api/organization/user-organization`,
  );
  if (!response.ok) {
    throw new Error("Unable to load organization");
  }
  const data: { organization: CanconOrganization } = await response.json();
  return data.organization;
};

export const listOrganizationInvoices = async (): Promise<{
  invoices: CanconInvoice[];
  paginationMetadata: {
    nextPageToken: string;
    totalRecords: number;
  };
}> => {
  const response = await fetch(`/portal-proxy/api/invoices`);
  if (!response.ok) {
    throw new Error("Unable to load organization invoices");
  }
  return response.json();
};
