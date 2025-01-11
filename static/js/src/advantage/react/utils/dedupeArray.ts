export const dedupeArray = <I>(items: I[]): I[] =>
  items.reduce<I[]>((collection, item) => {
    if (!collection.includes(item)) {
      collection.push(item);
    }
    return collection;
  }, []);
