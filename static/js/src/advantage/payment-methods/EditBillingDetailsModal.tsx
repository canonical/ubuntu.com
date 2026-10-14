import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getCustomerInfo,
  postCustomerInfoToStripeAccount,
} from "../api/contracts";
import { countries, vatCountries } from "../countries-and-states";

type Props = {
  accountId: string;
  onClose: () => void;
};

type BillingFields = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  vat: string;
};

type BillingErrors = Partial<Record<keyof BillingFields, string>>;

const emptyFields: BillingFields = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  vat: "",
};

function EditBillingDetailsModal({ accountId, onClose }: Props): JSX.Element {
  const [countryCode, setCountryCode] = useState("");
  const [fields, setFields] = useState(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<BillingErrors>({});
  const [hasGeneralError, setHasGeneralError] = useState(false);

  const customerInfoQuery = useQuery({
    queryKey: ["invoice-customer-info", accountId],
    queryFn: async () => {
      const response = await getCustomerInfo(accountId);
      if (response.errors) throw new Error("Unable to load billing details");
      return response.data.customerInfo;
    },
    enabled: Boolean(accountId),
    staleTime: 0,
  });

  const saveBillingMutation = useMutation({
    mutationFn: postCustomerInfoToStripeAccount,
  });

  useEffect(() => {
    const customerInfo = customerInfoQuery.data;
    if (!customerInfo) return;

    setCountryCode(customerInfo.address?.country ?? "");
    setFields({
      name: customerInfo.name ?? "",
      address: customerInfo.address?.line1 ?? "",
      city: customerInfo.address?.city ?? "",
      postalCode: customerInfo.address?.postal_code ?? "",
      vat: customerInfo.taxID?.value ?? "",
    });
  }, [customerInfoQuery.data]);

  const closeModal = () => {
    if (saveBillingMutation.isPending) return;
    onClose();
  };

  const updateField = (field: keyof BillingFields, value: string) => {
    setFields((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const saveBillingDetails = () => {
    const nextErrors: BillingErrors = {};
    (["name", "address", "city", "postalCode"] as const).forEach((field) => {
      if (!fields[field].trim()) nextErrors[field] = "This field is required.";
    });
    setFieldErrors(nextErrors);
    setHasGeneralError(false);
    if (Object.keys(nextErrors).length) return;

    const country = countries.find(({ value }) => value === countryCode);
    saveBillingMutation.mutate(
      {
        paymentMethodID: null,
        accountID: accountId,
        address: {
          line1: fields.address,
          city: fields.city,
          postal_code: fields.postalCode,
          country: country?.value ?? "",
        },
        name: fields.name,
        taxID: {
          value: fields.vat,
          type: countryCode === "ZA" ? "za_vat" : "eu_vat",
        },
      },
      {
        onSuccess: (response) => {
          if (response.errors?.includes("tax_id_invalid")) {
            setFieldErrors({ vat: "The VAT number entered is invalid." });
            return;
          }
          if (response.errors) {
            setHasGeneralError(true);
            return;
          }
          onClose();
        },
        onError: () => setHasGeneralError(true),
      },
    );
  };

  const countryName = countries.find(
    ({ value }) => value === countryCode,
  )?.label;
  const isVatRequired = vatCountries.includes(countryCode);

  return (
    <div
      className="p-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeModal();
      }}
      style={{ display: "flex" }}
    >
      <section
        className="p-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-billing-title"
      >
        <header className="p-modal__header">
          <h2 className="p-modal__title" id="edit-billing-title">
            Edit billing details
          </h2>
          <button
            className="p-modal__close"
            aria-label="Close active modal"
            onClick={closeModal}
            type="button"
          >
            Close
          </button>
        </header>
        {customerInfoQuery.isLoading ? (
          <p role="status">Loading billing details...</p>
        ) : customerInfoQuery.isError ? (
          <p className="p-notification__message" role="alert">
            Unable to load billing details. Please try again later.
          </p>
        ) : (
          <form
            className="p-form p-form--stacked"
            onSubmit={(event) => {
              event.preventDefault();
              saveBillingDetails();
            }}
          >
            <div className="p-form__group row u-no-padding--left u-no-padding--right">
              <div className="col-4">
                <label className="p-form__label" htmlFor="billing-country">
                  Country/Region
                </label>
              </div>
              <div className="col-8">
                <div className="p-form__control">
                  <strong id="billing-country">{countryName}</strong>
                </div>
              </div>
            </div>
            {isVatRequired && (
              <BillingField
                field="vat"
                label="VAT number"
                value={fields.vat}
                error={fieldErrors.vat}
                onChange={updateField}
              />
            )}
            <hr className="p-rule" />
            <BillingField
              field="name"
              label="Name"
              value={fields.name}
              error={fieldErrors.name}
              onChange={updateField}
            />
            <BillingField
              field="address"
              label="Address"
              value={fields.address}
              error={fieldErrors.address}
              onChange={updateField}
            />
            <BillingField
              field="city"
              label="City"
              value={fields.city}
              error={fieldErrors.city}
              onChange={updateField}
            />
            <BillingField
              field="postalCode"
              label="Postal code"
              value={fields.postalCode}
              error={fieldErrors.postalCode}
              onChange={updateField}
            />
            {hasGeneralError && (
              <div className="p-notification--negative" role="alert">
                <div className="p-notification__content">
                  <h5 className="p-notification__title">
                    Error saving your details
                  </h5>
                  <p className="p-notification__message">
                    Please try again later. If the issue persists, contact
                    Canonical sales.
                  </p>
                </div>
              </div>
            )}
            <footer className="p-modal__footer">
              <button
                className="u-no-margin--bottom"
                disabled={saveBillingMutation.isPending}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="p-button--positive u-no-margin--bottom"
                disabled={saveBillingMutation.isPending}
                type="submit"
              >
                {saveBillingMutation.isPending ? "Saving..." : "Save"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}

function BillingField({
  field,
  label,
  value,
  error,
  onChange,
}: {
  field: keyof BillingFields;
  label: string;
  value: string;
  error?: string;
  onChange: (field: keyof BillingFields, value: string) => void;
}): JSX.Element {
  const id = `billing-${field}`;
  return (
    <div
      className={`p-form__group row u-no-padding--left u-no-padding--right${error ? " is-error" : ""}`}
    >
      <div className="col-4">
        <label className="p-form__label" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="col-8">
        <div className="p-form__control">
          <input
            className="p-form-validation__input"
            type="text"
            id={id}
            name={field}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => onChange(field, event.target.value)}
          />
          {error && (
            <p className="p-form-validation__message" id={`${id}-error`}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditBillingDetailsModal;
