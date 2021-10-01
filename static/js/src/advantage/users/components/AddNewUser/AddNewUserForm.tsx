import React, { useState } from "react";
import {
  Button,
  ActionButton,
  Input,
  Select,
} from "@canonical/react-components";
import { Formik, Form, Field } from "formik";
import * as Sentry from "@sentry/react";

import { HandleNewUserSubmit, NewUserValues } from "../../types";
import { userRoleOptions } from "../../constants";
import {
  getErrorMessage,
  validateEmail,
  validateRequired,
  SubmissionErrorMessage,
  errorMessages,
} from "../../utils";

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
  const initialValues: NewUserValues = {
    name: "",
    email: "",
    role: "admin",
  };

  const onSubmit = async (values: NewUserValues) => {
    try {
      await handleSubmit(values);
      handleClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (errorMessage === errorMessages.unknown) {
        Sentry.captureException(error);
      }
      setFormSubmissionError(errorMessage);
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
              aria-describedby="add-new-user-roles-roles-description"
              options={userRoleOptions}
            />
            <section id="add-new-user-roles-roles-description">
              <p className="p-form-help-text">
                <strong>Billing</strong> users cannot manage users, see tokens
                or support portal.
              </p>
              <p className="p-form-help-text">
                <strong>Technical</strong> users can access the support portal
                and see tokens, but not manage users.
              </p>
              <p className="p-form-help-text">
                <strong>Admin</strong> users can perform all actions.
              </p>
            </section>
            <div className="p-modal__footer">
              <Button
                type="button"
                className="u-no-margin--bottom"
                onClick={handleClose}
              >
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
