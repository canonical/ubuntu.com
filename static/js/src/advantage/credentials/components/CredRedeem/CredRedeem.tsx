import { Notification, Row, Spinner } from "@canonical/react-components";
import { activateKey } from "advantage/credentials/api/keys";
import React from "react";
import { useQuery } from "react-query";

const queryParams = new URLSearchParams(window.location.search);
const activationKey = queryParams.get("code");

const CredRedeem = () => {
    const { isLoading: isActivating, data: activationData, isError: activationError } = useQuery(["ActivateKeys"], () => { return activateKey(activationKey); });
    if (isActivating) {
        return (
            <div className="u-fixed-width">
                <Row>
                    <Spinner />
                </Row>
            </div>)
    };
    if ((activationData && "errors" in activationData) || activationError) {
        console.log(activationData);
        return (
            <div className="u-fixed-width">
                <Notification
                    severity="negative"
                    actions={[
                        {
                            label: "Go Back",
                            onClick: () => {
                                window.history.back();
                            }
                        }
                    ]}
                >
                    {activationData["errors"]}
                </Notification>
            </div>
        );
    }
    console.log(activationData);

    return (
        <div className="u-fixed-width">
            <Notification
                actions={[
                    {
                        label: "Schedule an exam",
                        onClick: () => {
                            window.location.assign("/credentials/your-exams");
                        }
                    }
                ]}
                severity="positive"
            >
                You were successfully enrolled!
            </Notification>
        </div>
    )

}
export default CredRedeem;