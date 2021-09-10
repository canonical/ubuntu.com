import React from "react";
import {
  Button,
  ActionButton,
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const AddNewUserForm = ({
  handleClose,
  handleSubmit,
}: {
  handleClose: () => void;
  handleSubmit: (string: string) => Promise<any>;
}) => {
  const initialValues: Values = {
    email: "",
    role: "admin",
    shouldSendInvite: false,
  };

  const onSubmit = async (values: Values, actions: FormikHelpers<Values>) => {
    await sleep(500);
    try {
      await handleSubmit(JSON.stringify(values));
      handleClose();
    } catch (error) {
      actions.setErrors({ email: "An unknown error has occurred." });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ submitForm, isSubmitting, touched, errors }) => (
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
              onClick={submitForm}
            >
              Add new user
            </ActionButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddNewUserForm;
