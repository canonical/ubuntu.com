import React, { useState } from "react";
import {
  Button,
  Modal,
  Input,
  CheckboxInput,
  Select,
} from "@canonical/react-components";

import { userRoleOptions } from "../../constants";

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
      {isModalOpen ? (
        <Modal
          close={() => setIsModalOpen(false)}
          title="Add a new user to this organisation"
          buttonRow={
            <>
              <Button
                className="u-no-margin--bottom"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="u-no-margin--bottom"
                appearance="positive"
                onClick={() => setIsModalOpen(false)}
              >
                Add new user
              </Button>
            </>
          }
        >
          <Input id="user-email" type="text" label="Users’ email address" />
          <Select
            id="user-role"
            label="Role"
            defaultValue="admin"
            name="user-role"
            options={userRoleOptions}
          />
          <CheckboxInput label="Send invite email" />
        </Modal>
      ) : null}
    </>
  );
};

export default AddNewUser;
