export const upperCaseFirstChar = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getFormattedDate = (date: string) => {
  const formatted = new Date(date).toLocaleString(navigator.language, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return formatted;
};

export const formatDatetimeForDatePicker = (datetime: string) => {
  const date = new Date(datetime);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const convertPickerToDatetime = (datetimeLocal: string) => {
  const localDate = new Date(datetimeLocal);
  return localDate.toISOString();
};
