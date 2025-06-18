import { useState, useMemo } from "react";
import {
  ActionButton,
  Input,
  Textarea,
  Notification,
  Row,
  Col,
} from "@canonical/react-components";
import { Formik, Form, Field } from "formik";
import { UserBan } from "../../utils/types";
import {
  formatDatetimeForDatePicker,
  convertPickerToDatetime,
} from "../../utils/common";
import { userBanSchema } from "./validation";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getUserBansKey } from "../../api/queryKeys";
import { ensureCUEUserBan } from "../../api/queryFns";

const UserBanForm = () => {
  const qClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: UserBan) => {
      return ensureCUEUserBan(data);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await qClient.refetchQueries({ queryKey: getUserBansKey() });
      navigate("/users/user-bans");
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });

  const userBan = useMemo(() => {
    if (location.state) {
      return location.state as UserBan;
    }
    return null;
  }, [location.state]);

  const defaultInitialValues = {
    email: "",
    expiresAt: "",
    reason: "",
    blocked: true,
  };

  const getInitialValues = (ban: UserBan) => {
    const expiresAt = ban.expiresAt
      ? formatDatetimeForDatePicker(ban.expiresAt)
      : "";
    return {
      email: ban.email,
      expiresAt: expiresAt,
      reason: "",
      blocked: ban.blocked,
    };
  };

  const initialValues = useMemo(() => {
    if (userBan) return getInitialValues(userBan);
    return defaultInitialValues;
  }, [userBan]);

  const validateValues = (values: any) => {
    const now = new Date();
    const expiresAt = new Date(values.expiresAt);
    if (values.expiresAt != "" && expiresAt < now) {
      return "Expiration date must be in the future";
    }
    return "";
  };

  const sanitizeValues = (values: any) => {
    const body: Partial<UserBan> = {
      email: userBan ? userBan.email : values.email.trim(),
      reason: values.reason.trim(),
      blocked: userBan ? userBan.blocked : values.blocked,
    };
    if (values.expiresAt !== "") {
      body.expiresAt = convertPickerToDatetime(values.expiresAt);
    }
    return body as UserBan;
  };

  const handleSubmit = async (values: any) => {
    const validationError = validateValues(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    await mutation.mutateAsync(sanitizeValues(values));
  };

  const showExpiration = useMemo(() => {
    if (!userBan) return true;
    return userBan.blocked;
  }, [userBan]);

  return (
    <>
      {error && (
        <Notification
          severity="negative"
          title={error}
          onDismiss={() => setError(null)}
          timeout={5000}
        />
      )}
      <Row>
        <Col size={6}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={userBanSchema}
          >
            {({ touched, errors, values }) => (
              <Form>
                <Field
                  as={Input}
                  name="email"
                  id="email"
                  type="text"
                  label="Email"
                  required
                  error={touched?.email && errors?.email}
                  disabled={userBan ? true : false}
                />
                <Field
                  as={Textarea}
                  name="reason"
                  id="reason"
                  label="Reason"
                  required
                  error={touched?.reason && errors?.reason}
                />
                {showExpiration && (
                  <Field
                    as={Input}
                    name="expiresAt"
                    id="expiresAt"
                    type="datetime-local"
                    label="Ban Expiration"
                    error={touched?.expiresAt && errors?.expiresAt}
                  />
                )}
                <ActionButton
                  disabled={loading}
                  type="submit"
                  appearance={values.blocked ? "negative" : "positive"}
                >
                  {userBan
                    ? values.blocked
                      ? "Update ban"
                      : "Remove ban"
                    : "Create Ban"}
                </ActionButton>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </>
  );
};

export default UserBanForm;
