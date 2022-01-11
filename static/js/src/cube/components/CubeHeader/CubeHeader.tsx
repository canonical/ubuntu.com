import React from "react";
import { Module } from "../../types";
import Certified from "./Certified";
import Hero from "./Hero";
import Prepare from "./Prepare";

type Props = {
  modules: Module[];
  certifiedBadge: null | Record<string, string>;
  hasEnrollments: boolean;
  isLoading: boolean;
};

const CubeHeader = ({
  modules,
  certifiedBadge,
  hasEnrollments,
  isLoading,
}: Props) => {
  return (
    <>
      <Hero
        modules={modules}
        certifiedBadge={certifiedBadge}
        hasEnrollments={hasEnrollments}
        isLoading={isLoading}
      />
      {isLoading ? (
        <section
          className="p-strip--light is-slanted--top-right u-vertically-center u-align--center"
          style={{ minHeight: "368px" }}
        >
          <i className="p-icon--spinner u-animation--spin u-align--center"></i>
        </section>
      ) : certifiedBadge ? (
        <Certified certifiedBadge={certifiedBadge} />
      ) : (
        hasEnrollments && <Prepare />
      )}
    </>
  );
};

export default CubeHeader;
