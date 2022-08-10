import React, { ChangeEvent, useState } from "react";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  Button,
  Col,
  Notification,
  Row,
  Select,
  Spinner,
} from "@canonical/react-components";
import { confirmMagicAttach } from "advantage/api/contracts";

type Props = {
  selectedId: string;
  magicAttachCode: string;
};
const MagicAttachDropdown = ({ selectedId, magicAttachCode }: Props) => {
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions();
  const { data: defaultSelectedSubscription } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });

  const uaSubscriptionsOptions = uaSubscriptionsData.map((subscription) => {
    return {
      label: subscription.product_name,
      value: subscription.contract_id,
    };
  });

  const [selectedSubscription, updateSelectedSubscription] = useState(
    defaultSelectedSubscription?.contract_id
  );
  const [submitStatus, updateSubmitStatus] = useState({
    error: "",
    status: "0",
  });
  // 0 for not yet submitted
  // 1 for has submitted, pending response
  // 200 to 500 standard HTTP request codes

  const submitAttachRequest = async () => {
    updateSubmitStatus({ error: "", status: "1" });
    confirmMagicAttach(magicAttachCode, selectedSubscription)
      .then((response) => {
        console.log(response);
        updateSubmitStatus({
          error: response.errors,
          status: "2",
        });
        console.log(submitStatus);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  if (isLoadingUA || submitStatus.status === "1") {
    return <Spinner />;
  }
  if (submitStatus.error === "" && submitStatus.status === "2") {
    console.log("success");
    return (
      <Notification severity="positive" title="Success">
        Successfully Attached Machine
      </Notification>
    );
  }
  if (submitStatus.status === "2" && submitStatus.error != "") {
    console.log("fail");
    return (
      <Notification severity="negative" title="Error">
        {submitStatus.error}
      </Notification>
    );
  }
  return (
    <>
      <Select
        defaultValue={
          defaultSelectedSubscription?.product_name
            ? defaultSelectedSubscription.product_name
            : ""
        }
        id="selectSubscription"
        label="Choose a subscription to attach"
        name="selectSusbcription"
        options={uaSubscriptionsOptions}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          updateSelectedSubscription(event?.target.value);
        }}
        stacked
      />
      <Row className="u-align--right">
        <Col size={3} className="col-start-large-10">
          <Button onClick={submitAttachRequest}>Submit</Button>
        </Col>
      </Row>
    </>
  );
};
export default MagicAttachDropdown;
