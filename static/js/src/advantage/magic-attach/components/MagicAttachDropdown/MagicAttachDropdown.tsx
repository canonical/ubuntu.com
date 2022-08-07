import React from "react";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import { Form, Select, Spinner } from "@canonical/react-components";

type Props = {
  selectedId: string;
};
const MagicAttachDropdown = ({ selectedId }: Props) => {
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions();
  const { data: selectedSubscription } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });

  const uaSubscriptionsOptions = uaSubscriptionsData.map((subscription) => {
    return {
      label: subscription.product_name,
      value: subscription.subscription_id,
    };
  });
  if (isLoadingUA) {
    return <Spinner />;
  }

  return (
    <Form>
      <Select
        defaultValue={
          selectedSubscription ? selectedSubscription.product_name : ""
        }
        id="selectSubscription"
        label="Choose a subscription to attach"
        name="selectSusbcription"
        options={uaSubscriptionsOptions}
        stacked
      />
    </Form>
  );
};
export default MagicAttachDropdown;
