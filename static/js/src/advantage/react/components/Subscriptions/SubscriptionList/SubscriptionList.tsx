import type { PersonalAccount } from "advantage/api/types";
import { usePersonalAccount } from "advantage/react/hooks";
import { selectFreeContract } from "advantage/react/hooks/usePersonalAccount";
import { getFeaturesDisplay } from "advantage/react/utils";
import React from "react";
import { SelectedToken } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";

type Props = {
  selectedToken?: SelectedToken;
  onSetActive: (token: SelectedToken) => void;
};

/**
 * Get the data to display in the card for the free token.
 */
const getFreeContractData = (
  freeContract?: PersonalAccount["contracts"][0] | null
) => {
  if (!freeContract) {
    return null;
  }
  const { contractInfo } = freeContract;
  const machines =
    contractInfo.items?.find(({ metric }) => metric === "units")?.value || 0;
  return {
    created: contractInfo.createdAt,
    expires: null,
    features: getFeaturesDisplay(contractInfo),
    machines,
  };
};

const SubscriptionList = ({ selectedToken, onSetActive }: Props) => {
  const { data: freeContractData } = usePersonalAccount({
    select: selectFreeContract,
  });
  const freeContract = getFreeContractData(freeContractData);
  const uaSubscriptions = [...Array(20)].map((_, i) => (
    <ListCard
      created="2021-07-09T07:14:56Z"
      expires="2021-07-09T07:14:56Z"
      features={["ESM Infra", "livepatch", "24/5 support"]}
      isSelected={selectedToken === `ua-sub-${i}`}
      key={i}
      label="Annual"
      machines={10}
      onClick={() => {
        onSetActive(`ua-sub-${i}`);
      }}
      title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    />
  ));
  return (
    <div className="p-subscriptions__list">
      <div className="p-subscriptions__list-scroll">
        <ListGroup title="Ubuntu Advantage">{uaSubscriptions}</ListGroup>
        {freeContract ? (
          <ListGroup title="Free personal token">
            <ListCard
              created={freeContract.created}
              data-test="free-token"
              expires={freeContract.expires}
              features={freeContract.features.included}
              isSelected={selectedToken === freeContractData?.token}
              label="Free"
              machines={freeContract.machines}
              onClick={() => {
                if (freeContractData?.token) {
                  onSetActive(freeContractData.token);
                }
              }}
              title="Free Personal Token"
            />
          </ListGroup>
        ) : null}
      </div>
    </div>
  );
};

export default SubscriptionList;
