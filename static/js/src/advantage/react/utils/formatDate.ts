import { format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

const DATE_FORMAT = "dd MMM yyyy";

export const formatDate = (date: string | Date, dateFormat = DATE_FORMAT) => {
  try {
    const sanitizedDate = new Date(date);
    const timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcDate = zonedTimeToUtc(sanitizedDate, timeZoneValue);
    return format(utcDate, dateFormat);
  } catch (error) {
    return date;
  }
};
