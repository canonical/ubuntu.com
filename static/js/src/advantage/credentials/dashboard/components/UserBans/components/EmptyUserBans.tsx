import React from "react";
import { Button, EmptyState, Strip } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

const EmptyUserBans: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/users/ensure-ban");
  };

  return (
    <Strip deep>
      <EmptyState image={""} title="No banned users found">
        <p>
          There are no banned users for CUE at this moment. Banning a user will
          prevent them from accessing CUE. Click the button below to create a
          ban.
        </p>
        <Button onClick={handleClick} appearance="positive">
          Create New
        </Button>
      </EmptyState>
    </Strip>
  );
};

export default EmptyUserBans;
