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
  let timer = null;

  function tick() {
    const now = new Date();
    el.textContent = formatClock(now);
    el.setAttribute("datetime", now.toISOString());
    // Wake on the next whole minute, so the clock turns over with the system's
    timer = setTimeout(tick, 60000 - (now.getTime() % 60000));
  }

  // Timers stall while a tab sleeps, so catch up as soon as it's shown again
  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      clearTimeout(timer);
      tick();
    }
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  tick();

  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
