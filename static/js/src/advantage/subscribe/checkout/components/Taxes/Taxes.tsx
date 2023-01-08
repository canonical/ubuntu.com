import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { Field, useFormikContext } from "formik";
import {
  ActionButton,
  Col,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import {
  caProvinces,
  countries,
  USStates,
  vatCountries,
} from "advantage/countries-and-states";
import { getLabel } from "advantage/subscribe/react/utils/utils";
import postCustomerTaxInfo from "../../hooks/postCustomerTaxInfo";
import useCalculateTaxes from "../../hooks/useCalculateTaxes";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import { FormValues, Product } from "../../utils/types";

type TaxesProps = {
  product: Product;
  quantity: number;
  setTaxSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};

const Taxes = ({ product, quantity, setTaxSaved, setError }: TaxesProps) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setErrors: setFormikErrors,
  } = useFormikContext<FormValues>();
  const [isEditing, setIsEditing] = useState(!values.country);

  const queryClient = useQueryClient();
  const { data: userInfo } = useCustomerInfo();

  const savedCountry = !!userInfo?.customerInfo?.address?.country;
  const isGuest = !userInfo?.customerInfo?.email;

  useEffect(() => {
    if (errors.VATNumber) {
      setIsEditing(true);
      setTaxSaved(false);
    }
  }, [errors]);

  useEffect(() => {
    if (savedCountry) {
      setIsEditing(!savedCountry);
      setTaxSaved(savedCountry);
    }
  }, [savedCountry]);

  const taxMutation = useCalculateTaxes({
    marketplace: values.marketplace,
    country: values.country,
    productListing: product?.longId || "",
    quantity,
    VATNumber: values.VATNumber,
  });

  const postCustomerTaxInfoMutation = postCustomerTaxInfo();

  const onSaveClick = () => {
    setIsEditing(false);
    if (isGuest || !window.accountId) {
      taxMutation.mutate(undefined, {
        onSuccess: (data) => {
          queryClient.setQueryData("taxCalulations", data);
        },
        onError: (error) => {
          setFieldValue("Description", false);
          setFieldValue("TermsAndConditions", false);
          document.querySelector("h1")?.scrollIntoView();
          Sentry.captureException(error);
        },
      });
      setTaxSaved(true);
    } else {
      postCustomerTaxInfoMutation.mutate(
        {
          formData: values,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries("preview");
          },
          onError: (error) => {
            setFieldValue("Description", false);
            setFieldValue("TermsAndConditions", false);
            document.querySelector("h1")?.scrollIntoView();
            Sentry.captureException(error);
            if (error instanceof Error)
              if (error.message.includes("tax_id_invalid")) {
                setFormikErrors({
                  VATNumber:
                    "That VAT number is invalid. Check the number and try again.",
                });
                setError(
                  <>
                    That VAT number is invalid. Check the number and try again.
                  </>
                );
              } else if (error.message.includes("tax_id_cannot_be_validated")) {
                setFormikErrors({
                  VATNumber:
                    "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
                });
                setError(
                  <>
                    VAT number could not be validated at this time, please try
                    again later or contact
                    <a href="mailto:customersuccess@canonical.com">
                      customer success
                    </a>{" "}
                    if the problem persists.
                  </>
                );
              } else {
                setError(<>VAT could not be applied.</>);
              }
          },
        }
      );
      setTaxSaved(true);
    }
  };

  const onEditClick = () => {
    setIsEditing(true);
    setTaxSaved(false);
  };

  const validateRequired = (value: string) => {
    let errorMessage;
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateUSState = (value: string) => {
    let errorMessage;
    if (!value && values.country === "US") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validatecaProvince = (value: string) => {
    let errorMessage;
    if (!value && values.country === "CA") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  useEffect(() => {
    if (!vatCountries.includes(values.country ?? "")) {
      setFieldValue("VATNumber", "");
    }
    if (values.country !== "US") {
      setFieldValue("usState", "");
    }
    if (values.country !== "CA") {
      setFieldValue("caProvince", "");
    }
  }, [values.country]);

  const displayMode = (
    <>
      <Col size={4}>
        <p>Your country:</p>
      </Col>
      <Col size={8}>
        <p>
          <strong>{getLabel(values.country ?? "", countries)}</strong>
        </p>
      </Col>
      {values.usState ? (
        <>
          <Col size={4}>
            <p>Your state:</p>
          </Col>
          <Col size={8}>
            <p>
              <strong>{getLabel(values.usState, USStates)}</strong>
            </p>
          </Col>
        </>
      ) : null}
      {values.caProvince ? (
        <>
          <Col size={4}>
            <p>Your province:</p>
          </Col>
          <Col size={8}>
            <p>
              <strong>{getLabel(values.caProvince, caProvinces)}</strong>
            </p>
          </Col>
        </>
      ) : null}
      {vatCountries.includes(values.country ?? "") ? (
        <>
          <Col size={4}>
            <p>VAT number:</p>
          </Col>
          <Col size={8}>
            <p>
              <strong>{values.VATNumber ? values.VATNumber : "None"}</strong>
            </p>
          </Col>
        </>
      ) : null}
    </>
  );

  const editMode = (
    <>
      <Field
        data-testid="select-country"
        as={Select}
        id="country"
        name="country"
        options={countries}
        label="Country/Region:"
        stacked
        required
        validate={validateRequired}
        error={touched?.country && errors?.country}
      />
      {values.country === "US" && (
        <Field
          data-testid="select-state"
          as={Select}
          id="usStates"
          name="usState"
          options={USStates}
          label="State:"
          stacked
          required
          validate={validateUSState}
          error={touched?.usState && errors?.usState}
        />
      )}
      {values.country === "CA" && (
        <Field
          as={Select}
          id="caProvinces"
          name="caProvince"
          options={caProvinces}
          label="Province:"
          stacked
          required
          validate={validatecaProvince}
          error={touched?.caProvince && errors?.caProvince}
        />
      )}
      {vatCountries.includes(values.country ?? "") && (
        <Field
          as={Input}
          type="text"
          id="VATNumber"
          name="VATNumber"
          label="VAT number:"
          stacked
          help="e.g. GB 123 1234 12 123 or GB 123 4567 89 1234"
          error={touched?.VATNumber && errors?.VATNumber}
        />
      )}
    </>
  );

  return (
    <Row>
      {isEditing ? editMode : displayMode}
      <div className="u-align--right">
        {isEditing ? (
          <ActionButton onClick={onSaveClick}>Save</ActionButton>
        ) : (
          <ActionButton onClick={onEditClick}>Edit</ActionButton>
        )}
      </div>
    </Row>
  );
};

export default Taxes;
