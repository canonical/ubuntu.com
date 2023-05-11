import { Col, Row } from "@canonical/react-components";
import React from "react";

const ExamSummary = () => {
    return (<>
        <section className="p-strip--light is-shallow p-shop-cart u-hide--small">
            <Row className="u-sv3">
                <Col size={6} className="p-text--small-caps">
                    Your Order
                </Col>
            </Row>
        </section>
    </>);
};
export default ExamSummary;
