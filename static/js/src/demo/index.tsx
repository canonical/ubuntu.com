import React from "react";
import ReactDOM from "react-dom";
import { Col, Row, Strip } from "@canonical/react-components";
import { OverlayProvider } from "@react-aria/overlays";
import Modal from "./components/Modal";

ReactDOM.render(
  <OverlayProvider>
    <Strip>
      <Row>
        <Col size={12}>
          <Modal />
        </Col>
      </Row>
    </Strip>
  </OverlayProvider>,
  document.getElementById("demo-app")
);
