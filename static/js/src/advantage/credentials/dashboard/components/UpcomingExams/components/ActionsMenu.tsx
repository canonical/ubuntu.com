import { useMemo, Fragment, useState } from "react";
import {
  ContextualMenu,
  Spinner,
  ConfirmationModal,
} from "@canonical/react-components";
import { ExamResultsTA } from "advantage/credentials/dashboard/utils/types";
import {
  useQueryClient,
  useMutation,
  useIsMutating,
} from "@tanstack/react-query";
import {
  getUpcomingExamsKey,
  cancelScheduledExamKey,
} from "advantage/credentials/dashboard/api/queryKeys";
import { cancelScheduledExam } from "advantage/credentials/dashboard/api/queryFns";

type Props = {
  exam: ExamResultsTA;
  setNotificationState: (state: undefined | "negative" | "positive") => void;
  setNotificationError: (error: string | null) => void;
};

const ActionsMenu = (props: Props) => {
  const { exam, setNotificationState, setNotificationError } = props;
  const qClient = useQueryClient();
  const isMutating = Boolean(
    useIsMutating({
      mutationKey: cancelScheduledExamKey(exam.uuid),
    }),
  );
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const mutation = useMutation({
    mutationKey: cancelScheduledExamKey(exam.uuid),
    mutationFn: () => {
      return cancelScheduledExam(exam.uuid);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setNotificationError(null);
      setNotificationState("positive");
      qClient.invalidateQueries({
        queryKey: [getUpcomingExamsKey(0)[0]],
      });
      setLoading(false);
    },
    onError: (error) => {
      setNotificationError(error.message);
      setLoading(false);
      setNotificationState("negative");
    },
    onSettled: () => {
      setShowConfirmationModal(false);
      setTimeout(() => {
        setNotificationState(undefined);
        setNotificationError(null);
      }, 3000);
    },
  });
  const isExamCancelled = useMemo(() => exam.state === "Canceled", [exam]);

  const links = useMemo(
    () => [
      {
        children: (
          <Fragment>
            <span>Cancel Exam</span>
          </Fragment>
        ),
        onClick: () => setShowConfirmationModal(true),
        hasIcon: true,
        disabled: isExamCancelled,
      },
    ],
    [isMutating, isExamCancelled],
  );

  const handleConfirm = () => {
    mutation.mutate();
  };

  if (loading) return <Spinner />;

  return (
    <>
      {showConfirmationModal && (
        <ConfirmationModal
          confirmButtonLabel="Confirm"
          cancelButtonLabel="Cancel"
          onConfirm={handleConfirm}
          close={() => setShowConfirmationModal(false)}
          title="Confirm cancel"
        >
          <p>
            This will cancel the exam for <strong>{exam.user.full_name}</strong>{" "}
            with ID <strong>{exam.id}</strong>.
            <br />
            You cannot undo this action.
          </p>
        </ConfirmationModal>
      )}
      <ContextualMenu
        toggleProps={{
          className: "u-no-margin--bottom",
          dense: true,
          style: {
            opacity: isExamCancelled ? 0.5 : 1,
          },
        }}
        hasToggleIcon
        links={links}
        position="right"
        toggleLabel="Actions"
        disabled={isMutating}
      />
    </>
  );
};

export default ActionsMenu;
