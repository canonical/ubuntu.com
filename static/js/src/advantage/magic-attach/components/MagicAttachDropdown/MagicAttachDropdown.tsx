import React from "react";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectUASubscriptions } from "advantage/react/hooks/useUserSubscriptions";
import { Form, Select, Spinner } from "@canonical/react-components";

type Props = {
  selectedId: string | null;
};
const MagicAttachDropdown = ({ selectedId }: Props) => {
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions({
    select: selectUASubscriptions,
  });

  const uaSubscriptionsOptions = uaSubscriptionsData.map((subscription) => ({
    label: subscription.product_name,
    value: subscription.subscription_id,
  }));
  if (isLoadingUA) {
    return <Spinner />;
  }

  return (
    <Form>
      <Select
        defaultValue=""
        id="exampleSelect2"
        label="Ubuntu releases"
        name="exampleSelect"
        options={uaSubscriptionsOptions}
      />
    </Form>
  );
};
export default MagicAttachDropdown;
