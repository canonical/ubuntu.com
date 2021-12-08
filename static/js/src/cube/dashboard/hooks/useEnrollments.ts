import { useState } from "react";
import { useQuery } from "react-query";

type Props = {
  courses: string[];
};

const useEnrollments = ({ courses }: Props) => {
  const [enrollments, setEnrollments] = useState();

  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";
  const encodedCoursesParam = courses
    .map((course) => encodeURIComponent(course))
    .join(",");

  const { isLoading, isSuccess, isError, error } = useQuery(
    "enrollments" + courses.join(","),
    async () => {
      console.log("!!! fetch enrollments");
      const response = await fetch(
        encodeURI(
          `/cube/enrollments.json?course_id=${encodedCoursesParam}` +
            (testBackend ? "&test_backend=true" : "")
        )
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      const enrollments = responseData;
      console.log("!!! enrollments: ", enrollments);
      setEnrollments(enrollments);
    },
    { enabled: courses && courses.length > 0 }
  );

  return {
    enrollments,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export default useEnrollments;
