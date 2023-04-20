import { MainTable } from "@canonical/react-components";
import { getFilteredWebhookResponses } from "advantage/credentials/api/trueability";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

type Webhook = {
  ability_screen_id: string;
  on_transition_to: string;
};
type WebhookResponse = {
  id: string;
  created_at: Date;
  sent_at: Date;
  webhook: Webhook;
};
type Props = {
  API_KEY: string;
};

const CredWebhookResponses = ({ API_KEY }: Props) => {
  const { data } = useQuery(["WebhookResponses"], async () => {
    console.log("UseQuery");
    return getFilteredWebhookResponses(API_KEY, "4190");
  });
  const [tableData, changeTableData] = useState<WebhookResponse[]>(data);
  useEffect(() => {
    changeTableData(data);
    console.log(data);
  }, [data]);
  useEffect(() => {}, []);
  return (
    <MainTable
      headers={[
        { content: "Created At", sortKey: "created_at" },
        { content: "Id", sortKey: "id" },
        { content: "Sent At", sortKey: "sent_at" },
        { content: "Ability Screen Id", sortKey: "ability_screen_id" },
        { content: "Transition", sortKey: "on_transition_to" },
      ]}
      rows={
        tableData &&
        tableData.map((keyitem: WebhookResponse) => {
          return {
            columns: [
              {
                content: keyitem.created_at.toString(),
              },
              {
                content: keyitem.id,
              },
              {
                content: keyitem.sent_at.toString(),
              },
              {
                content: keyitem.webhook.ability_screen_id,
              },
              {
                content: keyitem.webhook.on_transition_to,
              },
            ],
          };
        })
      }
      paginate={10}
      sortable
      responsive
    />
  );
};
export default CredWebhookResponses;
