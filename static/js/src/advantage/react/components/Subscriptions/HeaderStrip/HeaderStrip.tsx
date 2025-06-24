import { Col, ContextualMenu, Row } from "@canonical/react-components";

const HeaderStrip = () => {
  const isTechnical = localStorage.getItem("isTechnical") === "true";
  const isInMaintenance = localStorage.getItem("isInMaintenance") === "true";
  return (
    <section className="p-strip--suru-topped u-no-padding--bottom">
      <Row className="u-equal-height u-sv3">
        <Col size={5} className="u-vertically-center">
          <h1 className="p-subscriptions__header-title">Your subscriptions</h1>
        </Col>
        {!isTechnical && (
          <Col size={7} className="u-vertically-center u-align--right">
            <div>
              {!isInMaintenance && (
                <a className="p-button--positive" href="/pro/subscribe">
                  Buy new subscription
                </a>
              )}
              <ContextualMenu
                hasToggleIcon
                position={"left"}
                toggleLabel="Billing and users"
                links={[
                  {
                    children: "Invoices",
                    onClick: () => {
                      window.location.href = "/account/invoices";
                    }
                  },
                  {
                    children: "Payment methods",
                    onClick: () => {
                      window.location.href = "/account/payment-methods";
                    }
                  },
                  {
                    children: "Users",
                    onClick: () => {
                      window.location.href = "/pro/users";
                    }
                  },
                ]}
              />
            </div>
          </Col>
        )}
      </Row>
    </section>
  );
};
export default HeaderStrip;
