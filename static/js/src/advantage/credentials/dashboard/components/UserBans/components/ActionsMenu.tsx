import { useMemo, Fragment } from "react";
import { ContextualMenu } from "@canonical/react-components";
import { UserBan } from "advantage/credentials/dashboard/utils/types";
import { useNavigate } from "react-router-dom";

type Props = {
  userBan: UserBan;
};

const ActionsMenu = (props: Props) => {
  const navigate = useNavigate();
  const { userBan } = props;

  const links = useMemo(
    () => [
      {
        children: (
          <Fragment>
            <span>Unban</span>
          </Fragment>
        ),
        onClick: () =>
          navigate("/users/ensure-ban", {
            state: { ...userBan, blocked: false },
          }),
        hasIcon: true,
      },
      {
        children: (
          <Fragment>
            <span>Modify</span>
          </Fragment>
        ),
        onClick: () => navigate("/users/ensure-ban", { state: userBan }),
        hasIcon: true,
      },
    ],
    [],
  );

  return (
    <>
      <ContextualMenu
        toggleProps={{
          className: "u-no-margin--bottom",
          dense: true,
        }}
        hasToggleIcon
        links={links}
        position="right"
        toggleLabel="Actions"
      />
    </>
  );
};

export default ActionsMenu;
