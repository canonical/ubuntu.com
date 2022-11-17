import { Row, Spinner } from "@canonical/react-components";
import { activateKey } from "advantage/credentialling/api/keys";
import React from "react";
import { useQuery } from "react-query";

const queryParams = new URLSearchParams(window.location.search);
const activationKey = queryParams.get("code");

const CredRedeem = () => {
    const { isActivating: isLoading, activationData: data } = useQuery(["ActivateKeys"], () => { activateKey(activationKey); });
    return (
        <div>
            <Row>
                {isActivating ? <Spinner /> : null}
            </Row>
        </div>);
}
export default CredRedeem;