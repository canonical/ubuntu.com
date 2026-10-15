// The mock desktop's top bar clock, in the visitor's own timezone and
// language, e.g. "Sat 10 Oct  01:08" in British English
export function formatClock(date, locale) {
  const day = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${day.format(date).replace(/,/g, "")}  ${time.format(date)}`;
}

export function startDesktopClock(el) {
  const now = new Date();
  el.textContent = formatClock(now);
  // Wake on the next whole minute, so the clock turns over with the system's
  setTimeout(() => startDesktopClock(el), 60000 - (now % 60000));
}
