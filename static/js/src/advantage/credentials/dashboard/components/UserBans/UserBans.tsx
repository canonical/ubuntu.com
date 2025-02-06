import { useMemo } from "react";
import { Spinner, Row, Col, Button } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { getUserBans } from "../../api/queryFns";
import { UserBan } from "../../utils/types";
import { getUserBansKey } from "../../api/queryKeys";
import { ModularTable } from "@canonical/react-components";
import { getFormattedDate } from "../../utils/common";
import ActionsMenu from "./components/ActionsMenu";
import { Link } from "react-router-dom";

type APIResponse = {
  banned_users: UserBan[];
  error?: string;
};

const UserBans = () => {
  const { data, isLoading, isFetching } = useQuery<APIResponse>({
    queryKey: getUserBansKey(),
    queryFn: getUserBans,
  });

  const columns: any = useMemo(() => {
    const COLS: any[] = [
      {
        Header: "Email",
        accessor: "email",
        sortType: "basic",
      },
      {
        Header: "Banned By",
        accessor: "bannedBy",
        sortType: "basic",
      },
      {
        Header: "Expiration Date",
        accessor: "expiresAt",
        sortType: "basic",
        Cell: (props: any) => {
          if (!props.value) {
            return <small>Never</small>;
          }
          const date = getFormattedDate(props.value);
          return <small>{date}</small>;
        },
      },
      {
        Header: "Blocked Date",
        accessor: "timestamp",
        sortType: "basic",
        Cell: (props: any) => {
          const date = getFormattedDate(props.value);
          return <small>{date}</small>;
        },
      },
      {
        Header: "Reason",
        accessor: "reason",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: (props: any) => {
          return <ActionsMenu userBan={props.row.original} />;
        },
      },
    ];
    return COLS;
  }, []);

  return (
    <>
      {(isLoading || isFetching) && <Spinner text="Loading..." />}
      <Row>
        <Col size={10} />
        <Col size={2}>
          <Link to="/users/ensure-ban">
            <Button appearance="positive">Create New</Button>
          </Link>
        </Col>
      </Row>
      {data?.banned_users && data?.banned_users?.length > 0 && (
        <>
          <ModularTable data={data?.banned_users} columns={columns} sortable />
        </>
      )}
    </>
  );
};

export default UserBans;
