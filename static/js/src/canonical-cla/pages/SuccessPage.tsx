import { Button, Notification } from "@canonical/react-components";
import { useSignForm } from "../contexts/SignForm";

const SuccessPage = () => {
  const { changeStep } = useSignForm();

  return (
    <div>
      <Notification title="Success" severity="positive">
        Thank you for signing the Contributor License Agreement.
      </Notification>
      <Button onClick={() => changeStep("sign")}>Back to form</Button>
    </div>
  );
};

export default SuccessPage;
