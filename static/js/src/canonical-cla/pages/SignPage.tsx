import ScrollToHashElement from "canonical-cla/components/ScrollToHashElement";
import AgreementTypeForm from "../components/AgreementTypeForm";
import ContactDetailsForm from "../components/ContactDetailsForm";
import { Button } from "@canonical/react-components";
import { useMemo } from "react";
import { Form, Formik } from "formik";

const SignPage = () => {
  // const { agreementType } = useSignForm();
  const isFormValid = useMemo(() => {
    // TODO: implement form validation
    return false;
  }, []);
  return (
    <>
      <p>
        Before you contribute to one of our open source projects, you must
        complete all the fields in this form, sign it and return it to
        Canonical. Please make sure you have your GitHub username at the ready.
        If you don’t have one, you can create one now at{" "}
        <a href="https://github.com">GitHub</a>.
      </p>
      <p>All fields are required.</p>
      <AgreementTypeForm />
      <ContactDetailsForm />
      <ScrollToHashElement />
    </>
  );
};

export default SignPage;
