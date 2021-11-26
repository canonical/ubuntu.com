import React from "react";
import { Col, Row } from "@canonical/react-components";

type Props = {
  certifiedBadge: Record<string, string>;
};

const Certified = ({ certifiedBadge }: Props) => {
  return (
    <section className="p-strip--light is-slanted--top-right">
      <Row>
        <Col className="col-start-large-2 u-hide--small" size={3}>
          <img
            src="https://assets.ubuntu.com/v1/17541ecf-CUBE+certified+-+132x190_3.svg"
            alt="CUBE certified"
            width="175"
            height="252"
          />
        </Col>
        <Col size={7}>
          <h2>Badge of honor</h2>
          <p style={{ marginBottom: "0.5rem" }}>
            Share your certification with your network
          </p>
          <ul className="p-inline-list-icons u-no-padding--left u-no-margin--left u-no-padding--top">
            <li className="p-inline-list__item">
              <a
                title="Share on Twitter"
                href={
                  `https://twitter.com/share?text=I am officially a Certified Ubuntu Engineer. ` +
                  `My CUBE 2020 from @Canonical means that I’m a proven @Ubuntu professional. ` +
                  `Learn more about CUBE 2020 at https://www.ubuntu.com/cube&amp;` +
                  `url=${certifiedBadge.image}&amp;hashtags=CUBE2020`
                }
              >
                <img
                  src="https://assets.ubuntu.com/v1/6d51a38d-Twitter.png"
                  alt=""
                  width="61"
                  height="20"
                />
              </a>
            </li>
            <li className="p-inline-list__item">
              <a
                title="Share on LinkedIn"
                href={`https://www.linkedin.com/shareArticle?url=${certifiedBadge.image}&title=CUBE 2020`}
              >
                <img
                  src="https://assets.ubuntu.com/v1/72040dde-LindedIn.png"
                  alt=""
                  width="60"
                  height="20"
                />
              </a>
            </li>
          </ul>
          <p>
            You can{" "}
            <a
              href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=CUBE 2020&organizationName=Canonical&certUrl=${certifiedBadge.image}`}
            >
              add this badge
            </a>{" "}
            to the Certification section of your LinkedIn profile.
          </p>
          <p className="u-no-padding--top">
            <small>{certifiedBadge.image}</small>
          </p>
        </Col>
      </Row>
    </section>
  );
};

export default Certified;
