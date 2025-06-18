import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { SortDirection } from "@canonical/react-components/dist/types/index";

export const sortFunction = (
  a: MainTableRow,
  b: MainTableRow,
  currentSortDirection: SortDirection,
  currentSortKey: string | null | undefined,
): 0 | 1 | -1 => {
  if (!currentSortKey) {
    return 0;
  }
  const aSortData = a.sortData ? a.sortData[currentSortKey] : a.key;
  const bSortData = b.sortData ? b.sortData[currentSortKey] : b.key;
  if (aSortData === bSortData) {
    return 0;
  }

  const formatOutput = (value: number) => {
    if (value < 0) {
      return -1;
    }
    if (value > 0) {
      return 1;
    }
    return 0;
  };

  if (typeof aSortData === "string" && typeof bSortData === "string") {
    if (currentSortDirection === "ascending") {
      return formatOutput(aSortData.localeCompare(bSortData));
    }
    return formatOutput(bSortData.localeCompare(aSortData));
  } else if (typeof aSortData === "number" && typeof bSortData === "number") {
    if (currentSortDirection === "ascending") {
      return formatOutput(aSortData - bSortData);
    }
    return formatOutput(bSortData - aSortData);
  } else if (aSortData instanceof Date && bSortData instanceof Date) {
    if (currentSortDirection === "ascending") {
      return formatOutput(aSortData.getTime() - bSortData.getTime());
    }
    return formatOutput(bSortData.getTime() - aSortData.getTime());
  }
  return 0;
};
