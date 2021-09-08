import React, { useState, useEffect } from "react";
import { createFocusTrap, FocusTrap } from "focus-trap";
import Button from "@canonical/react-components/dist/components/Button";
import Modal from "@canonical/react-components/dist/components/Modal";

const AccessibleModal = ({ setIsModalOpen }) => {
  const modalRef = React.useRef(null);
  const focusTrap = React.useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      focusTrap.current = createFocusTrap(modalRef.current);
      focusTrap.current.activate();
    }
    return () => {
      focusTrap.current?.deactivate();
    };
  }, [modalRef]);

  return (
    <div ref={modalRef}>
      <Modal close={() => setIsModalOpen(false)} title="Add new user">
        <p>Add new user</p>
      </Modal>
    </div>
  );
};

const AddNewUser: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        hasIcon
        onClick={() => setIsModalOpen(true)}
        aria-label="Add new user..."
      >
        <i className="p-icon--plus"></i>
        <span>Add new user</span>
      </Button>
      {isModalOpen ? <AccessibleModal setIsModalOpen={setIsModalOpen} /> : null}
    </>
  );
};

export default AddNewUser;
