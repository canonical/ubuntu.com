type Falsy = false | 0 | "" | null | undefined;

export const removeFalsy = <I>(items: I[]): Exclude<I, Falsy>[] =>
  items.filter<Exclude<I, Falsy>>(
    (item: I): item is Exclude<I, Falsy> => !!item
  );
