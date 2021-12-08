import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  SearchAndFilter,
  Select,
} from "@canonical/react-components";
import {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";

import { useQuery } from "react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  courses: string[];
};

const addDay = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const groupByDay = (enrollments) => {
  return enrollments.reduce((combined, current) => {
    if (!combined.length) return [current];

    const lastDate = new Date(combined.at(-1)["date"]);
    const currentDate = new Date(current["date"]);
    const oneDay = 86400000; // milliseconds in a day
    const difference = (currentDate - lastDate) / oneDay;
    const emptyDates = [];

    // Fill in missing dates with empty data
    for (let i = 1; i < difference; i++) {
      const emptyDate = addDay(lastDate, i);
      const emptyDateString = `${emptyDate.getFullYear()}-${
        emptyDate.getMonth() + 1
      }-${emptyDate.getDate()}`;
      emptyDates.push({ date: emptyDateString });
    }

    return [...combined, ...emptyDates, current];
  }, []);
};

const addCounts = (counts1, counts2) => {
  const result = {};
  for (const key in counts1) {
    if (key === "date") continue;
    if (key in counts2) {
      result[key] = counts1[key] + counts2[key];
    } else {
      result[key] = counts1[key];
    }
  }

  for (const key in counts2) {
    if (key === "date") continue;
    if (!(key in counts1)) {
      result[key] = counts2[key];
    }
  }

  const dateString = counts1["date"];
  result["date"] = dateString.substring(0, 7);

  return result;
};

const groupByMonth = (enrollments) => {
  return enrollments.reduce((combined, current) => {
    if (!combined.length) return [current];

    const previousDate = new Date(combined.at(-1)["date"]);
    const currentDate = new Date(current["date"]);

    if (
      previousDate.getFullYear() === currentDate.getFullYear() &&
      previousDate.getMonth() === currentDate.getMonth()
    ) {
      const previous = combined.pop();
      const merged = addCounts(previous, current);
      return [...combined, merged];
    }

    return [...combined, current];
  }, []);
};

const colors = [
  "#D32F2F",
  "#C2185B",
  "#7B1FA2",
  "#512DA8",
  "#303F9F",
  "#1976D2",
  "#0288D1",
  "#0097A7",
  "#00796B",
  "#388E3C",
  "#689F38",
  "#AFB42B",
  "#FBC02D",
  "#FFA000",
  "#F57C00",
  "#E64A19",
  "#5D4037",
  "#616161",
  "#455A64",
];

const EnrollmentsChart = ({ courses }: Props) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState("daily");

  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";
  const encodedCoursesParam = courses
    .map((course) => encodeURIComponent(course))
    .join(",");

  const { isLoading, isError, data: enrollments } = useQuery(
    "dailyEnrollments",
    async () => {
      const response = await fetch(
        encodeURI(
          `/cube/daily-enrollments.json?course_id=${encodedCoursesParam}` +
            (testBackend ? "&test_backend=true" : "")
        )
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      return responseData;
    },
    { enabled: courses && courses.length > 0 }
  );

  console.log("!!! enrollments: ", enrollments);

  let filteredData = enrollments
    ? enrollments.map((enrollment) => {
        const filters = selectedFilters.length ? selectedFilters : courses;
        const counts = Object.keys(enrollment)
          .filter((key) => filters.includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: enrollment[key] }), {});
        const date = enrollment["date"];
        return { date, ...counts };
      })
    : [];

  switch (selectedGrouping) {
    case "daily":
      filteredData = groupByDay(filteredData);
      break;
    case "monthly":
      filteredData = groupByMonth(filteredData);
      break;
  }

  const onSelectGrouping = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrouping(event.target.value);
  };

  console.log("!!! filteredData: ", filteredData);

  const searchAndFilterChips: SearchAndFilterChip[] = courses.map((course) => ({
    value: course,
  }));
  console.log("!!! courses: ", courses);

  const updateFilter = (selectedChips: SearchAndFilterChip[]) => {
    const sortedNewFilters = selectedChips.map((chip) => chip.value).sort();
    const sortedOldFilters = selectedFilters.sort();
    const isFilterUnchanged =
      sortedNewFilters.length === sortedOldFilters.length &&
      sortedNewFilters.every(
        (value, index) => value === sortedOldFilters[index]
      );

    if (!isFilterUnchanged) {
      const filters = selectedChips.map((chip) => chip.value);
      setSelectedFilters(filters);
    }
  };

  return (
    <Card title="Enrollments">
      <Row>
        <Row>
          <Col size={6}>
            <SearchAndFilter
              filterPanelData={[{ id: 0, chips: searchAndFilterChips }]}
              returnSearchData={updateFilter}
            />
          </Col>
          <Col size={6}>
            <Select
              options={[
                {
                  label: "Daily",
                  value: "daily",
                },
                {
                  label: "Monthly",
                  value: "monthly",
                },
              ]}
              onChange={onSelectGrouping}
            />
          </Col>
        </Row>
        <Col size={12}>
          {isLoading ? (
            <i className="p-icon--spinner u-animation--spin"></i>
          ) : isError ? (
            <i>An error occurred while fetching the data</i>
          ) : (
            <ResponsiveContainer minHeight={600}>
              <BarChart
                data={filteredData}
                margin={{
                  top: 20,
                  bottom: 65,
                  left: 0,
                  right: 50,
                }}
              >
                <CartesianGrid stroke={"#E4E4E4"} />
                <XAxis dataKey="date" angle={60} textAnchor="start" />
                <YAxis />
                {courses &&
                  courses.map((course, i) => (
                    <Bar
                      key={course}
                      dataKey={course}
                      stackId="a"
                      fill={colors[i]}
                    />
                  ))}
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default EnrollmentsChart;
