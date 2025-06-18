import ScrollToHashElement from "canonical-cla/components/ScrollToHashElement";
import AgreementTypeForm from "../components/AgreementTypeForm";
import ContactDetailsForm from "../components/ContactDetailsForm";

const SignPage = () => {
  return (
    <>
      <p>
        Before you contribute to one of our open source projects, you must
        complete all the fields in this form, sign it and return it to
        Canonical.
      </p>
      <p>All fields are required.</p>
      <AgreementTypeForm />
      <ContactDetailsForm />
      <ScrollToHashElement />
    </>
  );
};

export default SignPage;
