import React, { useState } from "react";
import {
  Button,
  ActionButton,
  Modal,
  Input,
  CheckboxInput,
  Select,
} from "@canonical/react-components";
import { Formik, Form, FormikHelpers, Field } from "formik";

import { UserRole } from "../../types";
import { userRoleOptions } from "../../constants";

interface Values {
  email: string;
  role: UserRole;
  shouldSendInvite: boolean;
}

const validateEmail = (value: string): string | undefined =>
  !value
    ? "This field is required."
    : !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? "Must be a valid email."
    : undefined;

const AddNewUserModal = ({ handleClose }: { handleClose: () => void }) => {
  const initialValues: Values = {
    email: "",
    role: "admin",
    shouldSendInvite: false,
  };

  const handleSubmit = async (
    values: Values,
    actions: FormikHelpers<Values>
  ) => {
    actions.setSubmitting(false);
    handleClose();
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ submitForm, isSubmitting, touched, errors }) => (
        <Modal
          close={handleClose}
          title="Add a new user to this organisation"
          buttonRow={
            <>
              <Button className="u-no-margin--bottom" onClick={handleClose}>
                Cancel
              </Button>
              <ActionButton
                loading={isSubmitting}
                disabled={isSubmitting}
                className="u-no-margin--bottom"
                appearance="positive"
                onClick={submitForm}
              >
                Add new user
              </ActionButton>
            </>
          }
        >
          <Form>
            <Field
              as={Input}
              name="email"
              id="user-email"
              type="text"
              label="Users’ email address"
              validate={validateEmail}
              error={touched?.email && errors?.email}
            />
            <Field
              as={Select}
              name="role"
              id="user-role"
              label="Role"
              options={userRoleOptions}
            />
            <Field
              as={CheckboxInput}
              name="shouldSendInvite"
              label="Send invite email"
            />
          </Form>
        </Modal>
      )}
    </Formik>
  );
};

const AddNewUser = () => {
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
        <AddNewUserModal handleClose={() => setIsModalOpen(false)} />
      ) : null}
    </>
  );
};

export default AddNewUser;
