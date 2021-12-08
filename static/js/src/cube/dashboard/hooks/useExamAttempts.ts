import { useState } from "react";
import { useQuery } from "react-query";

type Props = {
  courses: string[];
};

const useExamAttempts = ({ courses }: Props) => {
  const [examAttempts, setExamAttempts] = useState();

  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";

  const { isLoading, isSuccess, isError, error } = useQuery(
    "examAttempts" + courses.join(","),
    async () => {
      console.log("!!! fetch exam attempts");
      const response = await fetch(
        `/cube/exam-attempts.json?course_id=${courses.join(",")}` +
          (testBackend ? "&test_backend=true" : "")
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      const examAttempts = responseData;
      console.log("!!! examAttempts: ", examAttempts);
      setExamAttempts(examAttempts);
    },
    { enabled: courses && courses.length > 0 }
  );

  if (examAttempts) {
  }

  return {
    examAttempts,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export default useExamAttempts;
