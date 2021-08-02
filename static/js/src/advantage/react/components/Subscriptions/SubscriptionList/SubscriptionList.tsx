import React from "react";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";

const SubscriptionList = () => (
  <div className="p-subscriptions__list">
    <div className="p-subscriptions__list-scroll">
      <ListGroup title="Ubuntu Advantage">
        <ListCard
          created="12.02.2021"
          expires="23.04.2022"
          features={["ESM Infra", "livepatch", "24/5 support"]}
          machines={10}
          period="Annual"
          title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        />
      </ListGroup>
      <ListGroup title="free personal token">
        <ListCard
          created="12.02.2021"
          expires="Never"
          features={["ESM Infra", "livepatch"]}
          machines={3}
          period="Free"
          title="Free Personal Token"
        />
      </ListGroup>
    </div>
  </div>
);

export default SubscriptionList;
