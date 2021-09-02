import { format, parseJSON } from "date-fns";

const DATE_FORMAT = "dd.MM.yyyy";

export const formatDate = (date: Date, dateFormat = DATE_FORMAT) => {
  try {
    return format(parseJSON(date), dateFormat);
  } catch (error) {
    return date;
  }
};
