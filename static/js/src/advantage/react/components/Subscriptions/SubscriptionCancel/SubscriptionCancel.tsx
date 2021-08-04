import {
  Button,
  ButtonAppearance,
  Col,
  Input,
  Modal,
  Row,
} from "@canonical/react-components";
import type { ModalProps } from "@canonical/react-components";
import React from "react";

type Props = {
  onClose: ModalProps["close"];
};

const SubscriptionCancel = ({ onClose }: Props) => {
  return (
    <div className="p-subscriptions__sticky-footer-modal">
      <Modal
        buttonRow={
          <Button
            appearance={ButtonAppearance.NEGATIVE}
            className="u-no-margin--bottom"
          >
            Yes, cancel subscription
          </Button>
        }
        close={onClose}
        title="Cancel subscription UA Infra (Virtual)"
      >
        <p>If you cancel this subscription:</p>
        <ul>
          <li>No additional charge will be incurred.</li>
          <li>
            The <strong>10 machines</strong> will stop receiving updates and
            services at the end of the billing period.
          </li>
        </ul>
        <p>
          Want help or advice? <a href="/contact-us">Chat with us</a>.
        </p>
        <Row className="u-no-padding--left">
          <Col size={8}>
            <Input
              label={
                <>
                  Please type <strong>cancel</strong> to confirm.
                </>
              }
              placeholder="cancel"
              type="text"
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default SubscriptionCancel;
