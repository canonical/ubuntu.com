import React, { useContext } from "react";
import { Col, RadioInput, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { ProductUsers } from "advantage/subscribe/react/utils/utils";

const ProductUser = () => {
  const { productUser, setProductUser } = useContext(FormContext);

  const handleProductUserChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductUser(event.target.value as ProductUsers);
    localStorage.setItem(
      "pro-selector-productUser",
      JSON.stringify(event.target.value as ProductUsers)
    );
  };

  return (
    <>
      <Row>
        <Col size={12}>
          <RadioInput
            label="My organisation"
            name="user"
            value={ProductUsers.organisation}
            onChange={handleProductUserChange}
            checked={productUser === ProductUsers.organisation}
          />
        </Col>
        <Col size={12} style={{ marginLeft: "35px" }}>
          <p>Enterprise subscriptions for commercial use</p>
        </Col>
        <Col size={12}>
          <RadioInput
            label="Myself"
            name="user"
            value={ProductUsers.myself}
            onChange={handleProductUserChange}
            checked={productUser === ProductUsers.myself}
          />
        </Col>
        <Col size={12} style={{ marginLeft: "35px" }}>
          <p>
            Free, personal subscription for 5 machines for you or any business
            you own, or 50 machines for active{" "}
            <a href="/community/membership">Ubuntu Community members</a>. If you
            need phone support or need to cover more than 5 machines, please
            select &quot;My organisation&quot;
          </p>
        </Col>
      </Row>
    </>
  );
};

export default ProductUser;
