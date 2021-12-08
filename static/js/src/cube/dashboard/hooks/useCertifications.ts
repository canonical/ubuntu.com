import { useState } from "react";
import { useQuery } from "react-query";

type Props = {
  usernames: string[];
};

const useCertifications = ({ usernames }: Props) => {
  const [certifications, setCertifications] = useState();

  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";

  const { isLoading, isSuccess, isError, error } = useQuery(
    "certifications" + usernames.join(","),
    async () => {
      console.log("!!! fetch certifications");
      const response = await fetch(
        `/cube/certifications.json?username=${usernames.join(",")}` +
          (testBackend ? "&test_backend=true" : "")
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      const certifications = responseData;
      console.log("!!! certifications: ", certifications);
      setCertifications(certifications);
    },
    { enabled: usernames && usernames.length > 0 }
  );

  return {
    certifications,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export default useCertifications;
