import React, { useState } from "react";
import {
  Button,
  ActionButton,
  Input,
  Select,
} from "@canonical/react-components";
import { Formik, Form, Field } from "formik";

import { HandleNewUserSubmit, UserRole } from "../../types";
import { userRoleOptions } from "../../constants";
import {
  getErrorMessage,
  validateEmail,
  validateRequired,
  SubmissionErrorMessage,
} from "../../utils";

interface Values {
  email: string;
  role: UserRole;
  name: string;
}

export const AddNewUserForm = ({
  handleClose,
  handleSubmit,
}: {
  handleClose: () => void;
  handleSubmit: HandleNewUserSubmit;
}) => {
  const [
    formSubmissionError,
    setFormSubmissionError,
  ] = useState<SubmissionErrorMessage | null>(null);
  const initialValues: Values = {
    name: "",
    email: "",
    role: "admin",
  };

  const onSubmit = async (values: Values) => {
    try {
      await handleSubmit(JSON.stringify(values));
      handleClose();
    } catch (error) {
      setFormSubmissionError(getErrorMessage((error as any)?.message));
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ isSubmitting, touched, errors }) => (
        <>
          {formSubmissionError ? (
            <div className="p-notification--negative">
              <div className="p-notification__content" aria-atomic="true">
                <h5 className="p-notification__title">Error</h5>
                <p className="p-notification__message" role="alert">
                  {formSubmissionError}
                </p>
              </div>
            </div>
          ) : null}
          <Form>
            <Field
              as={Input}
              name="name"
              id="user-name"
              type="text"
              label="Name"
              validate={validateRequired}
              error={touched?.name && errors?.name}
            />
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
            <div className="p-modal__footer">
              <Button className="u-no-margin--bottom" onClick={handleClose}>
                Cancel
              </Button>
              <ActionButton
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="u-no-margin--bottom"
                appearance="positive"
              >
                Add new user
              </ActionButton>
            </div>
          </Form>
        </>
      )}
    </Formik>
  );
};

export default AddNewUserForm;
