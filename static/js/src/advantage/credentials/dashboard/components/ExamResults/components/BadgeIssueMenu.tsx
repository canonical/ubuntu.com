import { useMemo, Fragment, useState } from "react";
import { ContextualMenu, Spinner } from "@canonical/react-components";
import { ExamResultsTA } from "advantage/credentials/dashboard/utils/types";
import { CREDLY_BADGE_TEMPLATES } from "../../../constants";
import {
  useQuery,
  useQueryClient,
  useMutation,
  useIsMutating,
} from "@tanstack/react-query";
import {
  getBulkBadgesCredly,
  postIssueCredlyBadge,
} from "advantage/credentials/dashboard/api/queryKeys";
import { CredlyBadge } from "advantage/credentials/dashboard/utils/types";
import { issueCredlyBadge } from "advantage/credentials/dashboard/api/queryFns";
import { CredlyBadgeIssueBody } from "advantage/credentials/dashboard/utils/types";

type Props = {
  exam: ExamResultsTA;
  setNotificationState: (state: undefined | "negative" | "positive") => void;
};

const BadgeIssueMenu = (props: Props) => {
  const { exam, setNotificationState } = props;
  const qClient = useQueryClient();
  const isMutating = Boolean(
    useIsMutating({
      mutationKey: postIssueCredlyBadge(),
    }),
  );
  const [loading, setLoading] = useState(false);

  const { data } = useQuery<{
    data: CredlyBadge[];
  }>({
    queryKey: getBulkBadgesCredly(),
  });

  const mutation = useMutation({
    mutationKey: postIssueCredlyBadge(),
    mutationFn: (badgeData: CredlyBadgeIssueBody) => {
      return issueCredlyBadge(badgeData);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setNotificationState("positive");
      qClient.invalidateQueries({
        queryKey: getBulkBadgesCredly(),
      });
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
      setNotificationState("negative");
    },
  });

  const userBadges = useMemo(() => {
    const badges = data?.data || [];
    return badges.filter((badge) => badge.recipient_email === exam.user_email);
  }, [data, exam]);

  const hasSomeBadge = useMemo(
    () =>
      userBadges.some((b) =>
        CREDLY_BADGE_TEMPLATES.some(
          (c) => c.templateId === b.badge_template.id,
        ),
      ),
    [userBadges],
  );

  const handleIssueBadge = (templateId: string, issued: boolean) => {
    if (issued || isMutating) return;
    const badgeData: CredlyBadgeIssueBody = {
      recipient_email: exam.user_email,
      issued_to_first_name: exam.user.first_name,
      issued_to_last_name: exam.user.last_name,
      badge_template_id: templateId,
    };
    mutation.mutate(badgeData);
  };

  const links = useMemo(
    () =>
      CREDLY_BADGE_TEMPLATES.map((badge) => {
        const hasBadge = userBadges.some(
          (b) => b.badge_template.id === badge.templateId,
        );
        return {
          children: (
            <Fragment>
              {hasBadge && <i className="p-icon--success" />}
              <span>{badge.shortTitle}</span>
            </Fragment>
          ),
          onClick: () => handleIssueBadge(badge.templateId, hasBadge),
          hasIcon: true,
          disabled: hasBadge || isMutating,
        };
      }),
    [handleIssueBadge, userBadges, isMutating, data],
  );

  if (loading) return <Spinner />;

  return (
    <ContextualMenu
      toggleProps={{
        className: "u-no-margin--bottom",
        dense: true,
        style: {
          opacity: hasSomeBadge ? 0.5 : 1,
        },
      }}
      hasToggleIcon
      links={links}
      position="right"
      toggleLabel="Issue Badge"
      disabled={isMutating}
    />
  );
};

export default BadgeIssueMenu;
