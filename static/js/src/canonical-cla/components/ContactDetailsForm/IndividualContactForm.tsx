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

// countries
/*

class IndividualCreateForm(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "phone_number": "+1234567890",
                "address": "123 Main St, Springfield, IL 62701",
                "country": "United States",
                "github_email": "john@example.com",
            }
        }
    )
    first_name: Annotated[str, StringConstraints(max_length=50)]
    last_name: Annotated[str, StringConstraints(max_length=50)]
    phone_number: Annotated[str, StringConstraints(max_length=20)]
    address: Annotated[str, StringConstraints(max_length=400)]
    country: CountryShortName = Field(
        ...,
        description="Country in the short name format.",
    )
    github_email: Annotated[str | None, StringConstraints(max_length=100)] = None
    launchpad_email: Annotated[str | None, StringConstraints(max_length=100)] = None

    @model_validator(mode="after")
    def _at_least_one_email(self):
        if not self.github_email and not self.launchpad_email:
            raise ValueError("At least one email must be provided")

    @model_validator(mode="after")
    def _emails_are_valid(self):
        if self.github_email:
            self.github_email = clean_email(self.github_email)
            if not valid_email(self.github_email):
                raise ValueError("Invalid GitHub email address")

        if self.launchpad_email:
            self.launchpad_email = clean_email(self.launchpad_email)
            if not valid_email(self.launchpad_email):
                raise ValueError("Invalid Launchpad email address")

        return self


class IndividualCreationSuccess(BaseModel):
    message: str = "Individual Contributor License Agreement (CLA) signed successfully"


class OrganizationCreateForm(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "ACME Corp",
                "email_domain": "acme.com",
                "contact_name": "John Doe",
                "contact_email": "john@acme.com",
                "phone_number": "+1234567890",
                "address": "123 Main St, Springfield, IL 62701",
                "country": "United States",
            }
        }
    )
x    email_domain: Annotated[str, StringConstraints(max_length=100)]
    contact_name: Annotated[str, StringConstraints(max_length=100)]
    contact_email: Annotated[str, StringConstraints(max_length=100)]
    phone_number: Annotated[str | None, StringConstraints(max_length=20)] = None
    address: Annotated[str | None, StringConstraints(max_length=400)] = None
    country: CountryShortName = Field(
        ...,
        description="Country in the short name format.",
    )

    @model_validator(mode="after")
    def _email_domain_is_valid(self):
        self.email_domain = clean_email_domain(self.email_domain)
        (is_valid, reason) = valid_email_domain(self.email_domain)
        if not is_valid:
            raise ValueError(reason)
        return self


* */

const IndividualFormSchema = Yup.object<
  Omit<IndividualSignForm, "agreement_type">
>()
  .shape({
    first_name: Yup.string().max(50).required(),
    last_name: Yup.string().max(50).required(),
    phone_number: Yup.string().max(20).required(),

    address: Yup.string().max(400).required(),
    country: Yup.string().required(),
    github_email: Yup.string().max(100).nullable(),
    launchpad_email: Yup.string().max(100).nullable(),
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
      validateOnChange
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
              type="text"
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
              The contributor must use the chosen email address(es) during Git
              commits.
            </p>
            <div className="row p-divider">
              <div className="col-4 p-divider__block">
                <GithubEmailSelector />
              </div>

              <div className="col-4 p-divider__block">
                <LaunchpadEmailSelector />
              </div>
            </div>

            {/* TODO: add recaptcha */}
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
