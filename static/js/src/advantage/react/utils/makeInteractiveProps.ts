export const makeInteractiveProps = <E = HTMLDivElement>(
  onInteraction: (...args: unknown[]) => unknown
) => {
  return {
    onClick: onInteraction,
    onKeyPress: (evt: React.KeyboardEvent<E>) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        onInteraction(evt);
      }
    },
    role: "button",
    tabIndex: 0,
  };
};
