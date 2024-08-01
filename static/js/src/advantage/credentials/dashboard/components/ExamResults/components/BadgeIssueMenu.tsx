import { ContextualMenu } from "@canonical/react-components";
import { ExamResultsTA } from "advantage/credentials/dashboard/utils/types";

type Props = {
  exam: ExamResultsTA;
};

const BadgeIssueMenu = (props: Props) => {
  const { exam } = props;
  console.log(exam);
  return (
    <ContextualMenu
      toggleProps={{
        className: "u-no-margin--bottom",
        dense: true,
      }}
      hasToggleIcon
      links={[
        {
          children: "CUE.01 Linux 24.04",
          onClick: () => {},
        },
        {
          children: "CUE.01 Linux 24.04 Beta",
          onClick: () => {},
        },
        {
          children: "CUE.01 Linux 24.10",
          onClick: () => {},
        },
      ]}
      position="right"
      toggleLabel="Issue Badge"
    />
  );
};

export default BadgeIssueMenu;
