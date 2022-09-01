import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  Button,
  Col,
  Notification,
  Row,
  Spinner,
} from "@canonical/react-components";
import { confirmMagicAttach } from "advantage/api/contracts";

type Props = {
  selectedId: string;
  magicAttachCode: string;
  setCodeStatus: Dispatch<SetStateAction<boolean>>;
};
const MagicAttachDropdown = ({
  selectedId,
  magicAttachCode,
  setCodeStatus,
}: Props) => {
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions();

  const { data: defaultSelectedSubscription } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });

  const [selectedSubscription, updateSelectedSubscription] = useState(
    defaultSelectedSubscription == undefined
      ? ""
      : defaultSelectedSubscription.contract_id
  );
  const [submitStatus, updateSubmitStatus] = useState({
    error: "",
    status: "0",
  });
  // 0 for not yet submitted
  // 1 for has submitted, pending response
  // 2 for error
  // 3 for success

  const submitAttachRequest = async () => {
    updateSubmitStatus({ error: "", status: "1" });
    confirmMagicAttach(magicAttachCode, selectedSubscription)
      .then((response) => {
        if (response["success"]) {
          updateSubmitStatus({ error: "", status: "3" });
        } else {
          updateSubmitStatus({
            error: response.errors,
            status: "2",
          });
        }
        console.log(submitStatus);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  if (isLoadingUA || submitStatus.status === "1") {
    return <Spinner />;
  }
  if (submitStatus.status === "3") {
    console.log("success");
    return (
      <Notification severity="positive" title="Success">
        Successfully Attached Machine
      </Notification>
    );
  }
  if (submitStatus.status === "2") {
    console.log("fail");
    return (
      <Notification severity="negative" title="Error">
        {submitStatus.error}
      </Notification>
    );
  }
  return (
    <form className="p-form p-form--stacked">
      <div className="p-form__group row">
        <div className="col-4">
          <label htmlFor="selectSubscription" className="p-form__label">
            Choose a subscription to attach
          </label>
        </div>
        <div className="col-8">
          <div className="p-form__control">
            <select
              name="selectSubscription"
              id="selectSubscription"
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                updateSelectedSubscription(event.target.value);
              }}
              defaultValue={
                defaultSelectedSubscription == undefined
                  ? ""
                  : defaultSelectedSubscription.contract_id
              }
              value={selectedSubscription}
            >
              <option value="" disabled>
                Select an option
              </option>
              {uaSubscriptionsData.map((subscription) => {
                if (subscription.id == defaultSelectedSubscription?.id) {
                  return (
                    <option
                      value={subscription.contract_id}
                      key={subscription.contract_id}
                      selected
                    >
                      {subscription.product_name}
                    </option>
                  );
                } else {
                  return (
                    <option
                      value={subscription.contract_id}
                      key={subscription.contract_id}
                    >
                      {subscription.product_name}
                    </option>
                  );
                }
              })}
            </select>
          </div>
        </div>
      </div>
      <Row className="u-align--right">
        <Col size={3} className="col-start-large-10">
          <Button
            onClick={() => {
              setCodeStatus(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={submitAttachRequest}>Submit</Button>
        </Col>
      </Row>
    </form>
  );
};
export default MagicAttachDropdown;
