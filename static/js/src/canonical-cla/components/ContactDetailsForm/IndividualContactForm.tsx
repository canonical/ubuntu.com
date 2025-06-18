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
import { postIndividualSignForm } from "canonical-cla/utils/api";
import { IndividualSignForm } from "canonical-cla/utils/constants";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import GithubEmailSelector from "../GithubEmailSelector";
import LaunchpadEmailSelector from "../LaunchpadEmailSelector";

const IndividualFormSchema = Yup.object<
  Omit<IndividualSignForm, "agreement_type">
>()
  .shape({
    first_name: Yup.string().max(50).required().label("First name"),
    last_name: Yup.string().max(50).required().label("Last name"),
    phone_number: Yup.string().max(20).required().label("Phone number"),

    address: Yup.string().max(400).required().label("Address"),
    country: Yup.string().required().label("Country"),
    github_email: Yup.string().max(100).nullable().label("GitHub email"),
    launchpad_email: Yup.string().max(100).nullable().label("Launchpad email"),
  })
  .test(function ({ github_email, launchpad_email }) {
    if (!github_email && !launchpad_email) {
      return this.createError({
        message: "At least one email must be provided",
        path: "github_email | launchpad_email",
      });
    }
    return true;
  });

const IndividualContactForm = () => {
  const { changeStep } = useSignForm();
  const [storedValues, setStoredValues, resetStoredValues] =
    usePersistedForm<IndividualSignForm>("individual-form");
  const submitSignForm = useMutation({
    mutationFn: postIndividualSignForm,
    onSuccess: () => {
      resetStoredValues();
      changeStep("success");
      // scroll up to the top of the page
      window.location.hash = "main-content";
    },
  });

  const handleSubmit = (values: IndividualSignForm) => {
    submitSignForm.mutate(values);
  };
  return (
    <Formik
      initialValues={storedValues}
      validationSchema={IndividualFormSchema}
      onSubmit={handleSubmit}
      validateOnMount
    >
      {({ isValid, values }) => {
        setStoredValues(values);
        return (
          <Form>
            <FormikField
              component={Input}
              name="first_name"
              label="First name"
              required
              type="text"
              maxLength={50}
            />
            <FormikField
              component={Input}
              name="last_name"
              label="Last name"
              required
              type="text"
              maxLength={50}
            />
            <FormikField
              component={Input}
              name="phone_number"
              label="Phone number"
              required
              type="tel"
              maxLength={20}
            />
            <FormikField
              component={Textarea}
              name="address"
              label="Address"
              required
              maxLength={400}
            />
            <FormikField
              component={Select}
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
              required
            />

            <h5 id="choose-emails">* Choose at least one email address:</h5>
            <p className="p-form-help-text">
              Contributors may use either their chosen email address or their
              signed-in username when submitting contributions.
            </p>
            <div className="row p-divider">
              <div className="col-4 p-divider__block u-vertically-center">
                <GithubEmailSelector />
              </div>

              <div className="col-4 p-divider__block u-vertically-center">
                <LaunchpadEmailSelector />
              </div>
            </div>
            {submitSignForm.error && (
              <div className="p-form__control is-error">
                <p className="p-form-validation__message">
                  An error occurred while submitting the form. Please try again:
                  <br />
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

export default IndividualContactForm;
