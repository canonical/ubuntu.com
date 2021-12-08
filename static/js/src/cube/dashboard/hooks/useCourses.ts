import { useState } from "react";
import { useQuery } from "react-query";

const useCourses = () => {
  const [courses, setCourses] = useState<string[]>([]);

  const { isLoading, isSuccess, isError, error } = useQuery(
    "courses",
    async () => {
      const response = await fetch("/cube/courses.json");
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      const courses = responseData.map((course) => course["id"]);
      console.log("!!! courses: ", courses);
      setCourses(courses);
    }
  );

  return {
    courses,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export default useCourses;
