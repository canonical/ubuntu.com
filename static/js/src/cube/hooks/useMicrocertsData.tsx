import { useState } from "react";
import { useQuery } from "react-query";
import { Module } from "../types";

const useMicrocertsData = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [studyLabs, setStudyLabs] = useState<Record<string, unknown>>({});

  const { isLoading, isError, isSuccess, error } = useQuery(
    "microcerts",
    async () => {
      const queryString = window.location.search;
      const res = await fetch(`/cube/microcerts.json${queryString}`);
      const data = await res.json();

      if (data.errors) {
        throw new Error(data.errors);
      }

      const {
        account_id: accountId,
        stripe_publishable_key: stripePublishableKey,
        study_labs_listing: studyLabs,
      } = data;

      const modules: Module[] = data["modules"].map(
        (module: Record<string, unknown>) => ({
          name: module["name"],
          badgeURL: module["badge-url"],
          topics: module["topics"],
          studyLabURL: module["study_lab_url"],
          takeURL: module["take_url"],
          status: module["status"],
          productListingId: module["product_listing_id"],
        })
      );

      window.accountId = accountId;
      window.stripePublishableKey = stripePublishableKey;
      setModules(modules);
      setStudyLabs(studyLabs);
    }
  );

  return { isLoading, isSuccess, isError, modules, studyLabs, error };
};

export default useMicrocertsData;
