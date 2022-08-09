import React, { ChangeEvent, useState } from "react";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import { Button, Select, Spinner } from "@canonical/react-components";
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

  console.log(selectedId);
  console.log(defaultSelectedSubscription);
  console.log(magicAttachCode);
  const [selectedSubscription, updateSelectedSubscription] = useState(
    defaultSelectedSubscription?.contract_id
  );

  const submitAttachRequest = async () => {
    await confirmMagicAttach(magicAttachCode, selectedSubscription);
  };
  if (isLoadingUA) {
    return <Spinner />;
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
      <Button onClick={submitAttachRequest}>Submit</Button>
    </>
  );
};
export default MagicAttachDropdown;
