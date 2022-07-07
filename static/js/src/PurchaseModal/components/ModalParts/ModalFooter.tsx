import React from "react";
import { Row, ActionButton } from "@canonical/react-components";

type ModalFooter = {
  children: React.ReactNode;
  closeModal: () => void;
};

const ModalFooter = ({ children, closeModal }: ModalFooter) => {
  return (
    <footer className="p-modal__footer">
      <Row className="u-no-padding">
        <ActionButton
          className="col-small-2 col-medium-2 col-start-medium-3 col-start-large-7 col-3 u-no-margin"
          appearance="neutral"
          aria-controls="purchase-modal"
          style={{ textAlign: "center" }}
          onClick={closeModal}
        >
          Cancel
        </ActionButton>
        {children}
      </Row>
    </footer>
  );
};

export default ModalFooter;
