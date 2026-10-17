import { updateOrganization } from "advantage/api/cancon";
import { countries, USStates } from "../countries-and-states";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserOrganization } from "advantage/api/cancon";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { Button, FormikField } from "@canonical/react-components";
import { CanconOrganization } from "advantage/api/cancon.types";
import CustomSelect from "./CustomSelect";

type Props = {
  accountId: string;
  onClose: () => void;
};
interface FormValues {
  fieldCountry: string;
  fieldState?: string;
  fieldVAT?: string;
  fieldAddressLine1: string;
  fieldAddressLine2?: string;
  fieldCity: string;
  fieldPostalCode: string;
}

export const NewEditBillingDetails = ({ accountId, onClose }: Props) => {
  const { data: organizationData } = useQuery({
    queryKey: ["organization", accountId],
    queryFn: () => fetchUserOrganization(),
    enabled: !!accountId,
  });
  const queryClient = useQueryClient();
  const formikInitialValues: FormValues = {
    fieldCountry: organizationData?.address?.country || ``,
    fieldState: organizationData?.address?.state || ``,
    fieldVAT: organizationData?.vatCode || ``,
    fieldAddressLine1: organizationData?.address?.addressLine1 || ``,
    fieldAddressLine2: organizationData?.address?.addressLine2 || ``,
    fieldCity: organizationData?.address?.city || ``,
    fieldPostalCode: organizationData?.address?.postalCode || ``,
  };

  const { mutate: saveBilling, isPending: isSaveBillingPending } = useMutation({
    mutationFn: ({
      organizationId,
      payload,
    }: {
      organizationId: string;
      payload: CanconOrganization;
    }) => updateOrganization(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", accountId] });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to save billing details:", error);
    },
  });
  const closeModal = () => {
    if (isSaveBillingPending) return;
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    saveBilling({
      organizationId: organizationData?.id!,
      payload: {
        ...organizationData,
        name: organizationData?.name,
        // version: organizationData?.version, 
        address: {
          country: values.fieldCountry,
          state: values.fieldState,
          addressLine1: values.fieldAddressLine1,
          addressLine2: values.fieldAddressLine2,
          city: values.fieldCity,
          postalCode: values.fieldPostalCode,
        },
        vatCode: values.fieldVAT,
      },
    });
  };

  return (
    <div
      className="p-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeModal();
      }}
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
        <Formik
          initialValues={formikInitialValues}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
          enableReinitialize={true}
        >
          {({ isSubmitting, values, errors, setFieldValue }) => (
            <Form>
              {errors && Object.keys(errors).length > 0 && (
                <div className="grid-row">
                  {/* <Notification title={`Please fix the following errors`} severity={`negative`}>
                    <ul>
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>
                          {field}
                          {error}
                        </li>
                      ))}
                    </ul>
                  </Notification> */}
                </div>
              )}

              <div className="p-section">
                <div className="grid-row">
                  <div className="grid-col-8">
                    <div className="grid-row">
                      <div
                        className={`grid-col-${values.fieldCountry === `US` ? 4 : 8}`}
                      >
                        <CustomSelect
                          error={errors.fieldCountry}
                          name={`fieldCountry`}
                          label={`Country/Region`}
                          options={countries}
                          required={true}
                          disabled
                          value={values.fieldCountry}
                          onChange={(value: string) => {
                            void setFieldValue(`fieldCountry`, value);
                          }}
                          searchable={`always`}
                        />
                      </div>
                      {values.fieldCountry === `US` && (
                        <div className="grid-col-4">
                          <CustomSelect
                            error={errors.fieldState}
                            name={`fieldState`}
                            label={`State/Province`}
                            required={true}
                            disabled
                            options={USStates}
                            value={values.fieldState || ``}
                            onChange={(value: string) => {
                              void setFieldValue(`fieldState`, value);
                            }}
                            searchable={`always`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid-row">
                      <FormikField
                        type={`text`}
                        name={`fieldAddressLine1`}
                        label={`Address Line 1`}
                        required={true}
                      />
                    </div>
                    <div className="grid-row">
                      <FormikField
                        type={`text`}
                        name={`fieldAddressLine2`}
                        label={`Address Line 2`}
                      />
                    </div>
                    <div className="grid-row">
                      <div className="grid-col-4">
                        <FormikField
                          type={`text`}
                          name={`fieldCity`}
                          label={`City`}
                          value={values.fieldCity || ``}
                          required={true}
                        />
                      </div>
                      <div className="grid-col-4">
                        <FormikField
                          type={`text`}
                          name={`fieldPostalCode`}
                          label={`Postal Code`}
                          value={values.fieldPostalCode || ``}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid-row">
                <div className="grid-col-4"></div>
                <div
                  className="grid-col-4"
                  style={{ justifyContent: `end`, display: `flex` }}
                >
                  <Button
                    type={`button`}
                    disabled={isSubmitting}
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance={`positive`}
                    type={`submit`}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
};
