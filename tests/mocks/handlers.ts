import { rest } from "msw";

const cubeMicrocerts = {
  modules: [
    {
      name: "Module 1",
      topics: ["Topic 1a", "Topic 1b", "Topic 1c"],
      "badge-url":
        "https://assets.ubuntu.com/v1/7697e127-products-generic-small.svg",
      study_lab: "https://qa.cube.ubuntu.com/",
      take_url: "https://qa.cube.ubuntu.com/",
      status: "enrolled",
    },
    {
      name: "Module 2",
      topics: ["Topic 2a", "Topic 2b", "Topic 2c"],
      "badge-url":
        "https://assets.ubuntu.com/v1/7697e127-products-generic-small.svg",
      study_lab: "https://qa.cube.ubuntu.com/",
      take_url: "https://qa.cube.ubuntu.com/",
      status: "not-enrolled",
    },
    {
      name: "Module 3",
      topics: ["Topic 3a", "Topic 3b", "Topic 3c"],
      "badge-url":
        "https://assets.ubuntu.com/v1/7697e127-products-generic-small.svg",
      study_lab: "https://qa.cube.ubuntu.com/",
      take_url: "https://qa.cube.ubuntu.com/",
      status: "passed",
    },
    {
      name: "Module 4",
      topics: ["Topic 4a", "Topic 4b", "Topic 4c"],
      "badge-url":
        "https://assets.ubuntu.com/v1/7697e127-products-generic-small.svg",
      study_lab: "https://qa.cube.ubuntu.com/",
      take_url: "https://qa.cube.ubuntu.com/",
      status: "failed",
    },
    {
      name: "Module 5",
      topics: ["Topic 5a", "Topic 5b", "Topic 5c"],
      "badge-url":
        "https://assets.ubuntu.com/v1/7697e127-products-generic-small.svg",
      study_lab: "https://qa.cube.ubuntu.com/",
      take_url: "https://qa.cube.ubuntu.com/",
      status: "in-progress",
    },
  ],
};

export const handlers = [
  rest.get("/cube/microcerts.json", (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(cubeMicrocerts));
  }),
];
