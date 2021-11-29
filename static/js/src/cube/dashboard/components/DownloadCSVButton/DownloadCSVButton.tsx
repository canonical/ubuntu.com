import React from "react";
import { Button } from "@canonical/react-components";
import generateCSV from "../../../utils/generateCSV";

type Props = {
  data: Record<string, unknown>[];
};

const DownloadCSVButton = ({ data }: Props) => {
  const onClick = () => {
    const csv = generateCSV(data);
    const encodedCSV = encodeURI(csv);
    window.open(encodedCSV);
  };

  return <Button onClick={onClick}>Download CSV</Button>;
};

export default DownloadCSVButton;
