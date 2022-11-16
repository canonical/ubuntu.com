import { Row } from "@canonical/react-components";
import React from "react";

const queryParams = new URLSearchParams(window.location.search);
const activationKey = queryParams.get("code");

const CredRedeem = () => {
    return (
        <div>
            <Row>
                {activationKey}
            </Row>
        </div>);
}
export default CredRedeem;