import {
  Button,
  FormikField,
  Input,
  Select,
  Textarea,
} from "@canonical/react-components";
import { useMutation } from "@tanstack/react-query";
import { useSignForm } from "canonical-cla/contexts/SignForm";
import usePersistedForm from "canonical-cla/hooks/usePersistedForm";
import { postOrganizationSignForm } from "canonical-cla/utils/api";
import { OrganizationSignForm } from "canonical-cla/utils/constants";
import { Form, Formik } from "formik";
import * as Yup from "yup";

const OrganizationFormSchema = Yup.object<
  Omit<OrganizationSignForm, "agreement_type">
>({
  name: Yup.string().max(100).required(),
  contact_name: Yup.string().max(100).required(),
  contact_email: Yup.string().max(100).email().required(),
  phone_number: Yup.string().max(20).required(),
  address: Yup.string().max(400).required(),
  country: Yup.string().required(),
  email_domain: Yup.string().max(100).required(),
});

const OrganizationContactForm = () => {
  const { changeStep } = useSignForm();
  const [storedValues, setStoredValues, resetStoredValues] =
    usePersistedForm<OrganizationSignForm>("organization-form");
  const submitSignForm = useMutation({
    mutationFn: postOrganizationSignForm,
    onSuccess: () => {
      resetStoredValues();
      changeStep("success");
      window.location.hash = "main-content";
    },
  });

  const handleSubmit = (values: OrganizationSignForm) => {
    submitSignForm.mutate(values);
  };

  return (
    <Formik
      initialValues={storedValues}
      validationSchema={OrganizationFormSchema}
      onSubmit={handleSubmit}
      validateOnChange
      validateOnMount
    >
      {({ isValid, values }) => {
        setStoredValues(values);
        return (
          <Form>
            <FormikField
              component={Input}
              name="name"
              label="Organization name"
              placeholder="Organization name"
              maxLength={100}
            />
            <FormikField
              component={Input}
              name="contact_name"
              label="Contact name"
              placeholder="Contact name"
              maxLength={100}
            />
            <FormikField
              component={Input}
              required
              name="contact_email"
              label="Contact email"
              placeholder="Contact email"
              maxLength={100}
            />
            <FormikField
              component={Input}
              required
              name="phone_number"
              label="Phone number"
              placeholder="Phone number"
              maxLength={20}
            />
            <FormikField
              component={Textarea}
              name="address"
              label="Address"
              placeholder="Address"
              maxLength={400}
            />
            <FormikField
              component={Select}
              required
              label="Country"
              name="country"
              defaultValue={""}
              options={[
                { label: "Choose a country", value: "", disabled: true },
                ...window.COUNTRIES_LIST.map((country) => ({
                  label: country.name,
                  value: country.alpha2,
                })),
              ]}
            />
            <FormikField
              component={Input}
              required
              label="Email domain"
              name="email_domain"
              placeholder="Email domain"
              maxLength={100}
              help="The domain of the email addresses of the contributors in your organization."
            />

            {submitSignForm.isError && (
              <div className="p-form__control is-error">
                <p className="p-form-validation__message">
                  {submitSignForm.error.message}
                </p>
              </div>
            )}
            <p>
              By clicking ‘I agree’ below you are confirming that you accept the
              terms detailed above.
            </p>
            <Button
              type="submit"
              appearance="positive"
              disabled={!isValid || submitSignForm.isPending}
            >
              {submitSignForm.isPending ? "Loading..." : "I agree"}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default OrganizationContactForm;
