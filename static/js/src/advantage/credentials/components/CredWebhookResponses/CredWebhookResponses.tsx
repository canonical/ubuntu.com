import { MainTable } from "@canonical/react-components";
import { getFilteredWebhookResponses } from "advantage/credentials/api/trueability";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";

type Webhook = {
  ability_screen_id: string;
  on_transition_to: string;
  created_at: Date;
};
type WebhookResponse = {
  id: string;
  sent_at: Date;
  webhook: Webhook;
  response_status: string;
};

const CredWebhookResponses = () => {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  console.log(page);
  const { data } = useQuery(["WebhookResponses"], async () => {
    return getFilteredWebhookResponses("4190", page);
  });
  const [tableData, changeTableData] = useState<WebhookResponse[]>(data);

  useEffect(() => {
    if (data && data["webhook_responses"]) {
      changeTableData(data["webhook_responses"]);
    }
    console.log(data);
  }, [data]);

  return (
    <section className="u-fixed-width">
      <MainTable
        headers={[
          { content: "Created At", sortKey: "created_at" },
          { content: "Id", sortKey: "id" },
          { content: "Sent At", sortKey: "sent_at" },
          { content: "Ability Screen Id", sortKey: "ability_screen_id" },
          { content: "Response Status", sortKey: "response_status" },
          { content: "Transition", sortKey: "on_transition_to" },
        ]}
        rows={
          tableData &&
          tableData.map((keyitem: WebhookResponse) => {
            return {
              columns: [
                {
                  content: keyitem.webhook.created_at?.toString(),
                },
                {
                  content: keyitem.id,
                },
                {
                  content: keyitem.sent_at?.toString(),
                },
                {
                  content: keyitem.webhook.ability_screen_id,
                },
                {
                  content: keyitem.response_status,
                },
                {
                  content: keyitem.webhook.on_transition_to,
                },
              ],
            };
          })
        }
        sortable
        responsive
      />
      {data && (
        <nav className="p-pagination" aria-label="Pagination">
          <ol className="p-pagination__items">
            <li className="p-pagination__item">
              <a
                className={classNames("p-pagination__link--previous", { "is-disabled": !data["meta"]["prev_page"] })}
                href={
                  data["meta"]["prev_page"]
                    ? `/credentials/shop/webhook_responses?page=${data["meta"]["prev_page"]}`
                    : "#"
                }
                title="Previous page"
              >
                <i className="p-icon--chevron-down"></i>
                <span>Previous page</span>
              </a>
            </li>
            <li className="p-pagination__item">
              <a
                className={classNames("p-pagination__link--next", { "is-disabled": !data["meta"]["next_page"] })}
                href={
                  data["meta"]["next_page"]
                    ? `/credentials/shop/webhook_responses?page=${data["meta"]["next_page"]}`
                    : "#"
                }
                title="Next page"
              >
                <span>Next page</span>
                <i className="p-icon--chevron-down"></i>
              </a>
            </li>
          </ol>
        </nav>
      )
      }
    </section >
  );
};
export default CredWebhookResponses;
