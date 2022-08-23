import React, { ChangeEvent, useState } from "react";
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

const MagicAttachDropdown = () => {
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions();

  const queryParams = new URLSearchParams(window.location.search);
  const selectedId = queryParams.get("subscription");

  const { data: defaultSelectedSubscription } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });
  // const uaSubscriptionsOptions = uaSubscriptionsData.map((subscription) => {
  //   return {
  //     label: subscription.product_name,
  //     value: subscription.contract_id,
  //   };
  // });
  const magicAttachCode = window.localStorage.getItem("magicAttachCode");

  const [selectedSubscription, updateSelectedSubscription] = useState(
    defaultSelectedSubscription?.contract_id
  );

  console.log(defaultSelectedSubscription);
  console.log(selectedSubscription);

  const [submitStatus, updateSubmitStatus] = useState({
    error: "",
    status: "0",
  });
  // 0 for not yet submitted
  // 1 for has submitted, pending response
  // 200 to 500 standard HTTP request codes

  const submitAttachRequest = async () => {
    console.log(selectedSubscription);
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
              defaultValue={defaultSelectedSubscription.contract_id}
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
              window.localStorage.removeItem("magicAttachCode");
              window.location.reload();
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
