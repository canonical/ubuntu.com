const generateCSV = (records: Record<string, unknown>[]) => {
  if (!records.length) {
    return "data:text/csv;charset=utf-8,";
  }

  const headers = Object.keys(records[0]);

  const rows: string[] = records.map((record) => {
    const fields = headers.map((header) => String(record[header]));
    return fields.join(",");
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\n" + rows.join("\n");
  return csvContent;
};

export default generateCSV;
