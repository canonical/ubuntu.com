import React from "react";
import { Col, Notification, Spinner } from "@canonical/react-components";

type ModalBody = {
  error?: React.ReactNode;
  children: React.ReactChild;
  isLoading: boolean;
};

const ModalBody = ({ error, children, isLoading }: ModalBody) => {
  return (
    <div id="modal-description" className="p-modal__body">
      {isLoading ? (
        <Col
          size={12}
          className="u-align--center"
          style={{ padding: "10rem 0" }}
        >
          <Spinner />
        </Col>
      ) : (
        <>
          {error && (
            <Notification severity="negative" title="Error:" inline>
              {error}
            </Notification>
          )}
          {children}
        </>
      )}
    </div>
  );
};

export default ModalBody;
