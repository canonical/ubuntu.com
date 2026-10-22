import countries from "../data/natural-earth-countries.json";

it("keeps the country dataset geometry-only without unused metadata to keep total size down", () => {
  expect(Object.keys(countries).sort()).toEqual(["features", "type"]);

  countries.features.forEach((feature) => {
    expect(Object.keys(feature).sort()).toEqual([
      "geometry",
      "properties",
      "type",
    ]);
    expect(feature.properties).toEqual({});
    expect(Object.keys(feature.geometry).sort()).toEqual([
      "coordinates",
      "type",
    ]);
  });
});
