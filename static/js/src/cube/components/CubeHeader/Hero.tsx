import React from "react";
import { Col, Row } from "@canonical/react-components";
import { Module } from "../../types";

type Props = {
  modules: Module[];
  isLoading: boolean;
  certifiedBadge: null | Record<string, string>;
  hasEnrollments: boolean;
};

const Hero = ({
  modules,
  isLoading,
  certifiedBadge,
  hasEnrollments,
}: Props) => {
  const passedCourses = modules.reduce(
    (passedCount, module) => passedCount + (module.status === "passed" ? 1 : 0),
    0
  );

  let heading;
  let description;

  if (isLoading) {
    heading = "";
    description = "";
  } else if (certifiedBadge) {
    heading = "CUBE 2020 complete";
    description =
      `You have completed all ${modules.length} microcerts, ` +
      `proving your Ubuntu expertise. You are now a Certified Ubuntu Engineer.`;
  } else if (hasEnrollments) {
    heading = "Your road to CUBE";
    description =
      passedCourses > 0
        ? `You have completed ${passedCourses} microcerts.\nComplete ${
            modules.length - passedCourses
          } more microcerts to attain CUBE.`
        : `Complete ${modules.length} microcerts to attain CUBE.`;
  } else {
    heading = "The road to CUBE";
    description =
      `The path to certification is clear and convenient. ` +
      `Complete ${modules.length} microcerts to attain CUBE.`;
  }

  const renderProgression = (name: string, module: Module, modifier = "") => (
    <div
      className={`p-cube-progression is-${name} ${
        module && module.status === "passed"
          ? ""
          : `is-faded${modifier ? "--" + modifier : ""}`
      }`}
    ></div>
  );

  return (
    <section className="p-strip p-strip--square-suru p-cube-hero has-cube is-dark is-slanted--bottom-left">
      <Row
        className="u-equal-height u-vertically-center"
        style={{ position: "relative" }}
      >
        {isLoading && (
          <i
            className="p-icon--spinner u-animation--spin is-light"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
            }}
          ></i>
        )}
        <Col className="p-cube-hero--content" size={6}>
          <h1>{heading} </h1>
          <p className="p-heading--4">
            {description.split("\n").map((value, index) => (
              <span key={index}>
                {value}
                <br />
              </span>
            ))}
          </p>
        </Col>
        <Col
          className="p-cube-progression u-hide--medium u-hide--small"
          size={6}
        >
          {renderProgression("architecture", modules[0])}
          {renderProgression("bash", modules[4], "right")}
          {renderProgression("devices", modules[3], "left")}
          {renderProgression("packages", modules[1])}
          {renderProgression("services", modules[6], "right")}
          {renderProgression("admin", modules[5], "left")}
          {renderProgression("commands", modules[2])}
          {renderProgression("security", modules[8], "right")}
          {renderProgression("networking", modules[7], "left")}
          {renderProgression("kernel", modules[9])}
          {renderProgression("microk8s", modules[12], "right")}
          {renderProgression("virtualisation", modules[11], "left")}
          {renderProgression("storage", modules[10])}
          {renderProgression("juju", modules[14], "right")}
          {renderProgression("maas", modules[13], "left")}
        </Col>
      </Row>
    </section>
  );
};

export default Hero;
