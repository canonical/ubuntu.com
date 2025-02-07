import { Button, Notification } from "@canonical/react-components";
import { useSignForm } from "../contexts/SignForm";

const SuccessPage = () => {
  const { changeStep, agreementType } = useSignForm();
  return (
    <div>
      <Notification title="Success" severity="positive">
        <p>Thank you for signing the Contributor License Agreement.</p>
        {agreementType === "organization" && (
          <p>
            A member of the Canonical team will review your organization&apos;s
            CLA and get back to you shortly.
          </p>
        )}
      </Notification>
      <Button onClick={() => changeStep("sign")}>Back to form</Button>
    </div>
  );
};

export default SuccessPage;
