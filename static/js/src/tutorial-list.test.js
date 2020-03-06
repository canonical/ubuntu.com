import { handleFilter } from "./tutorial-list.js";

describe("handleFilter", () => {
  // Setup DOM elements
  const topicFilter = `
    <select name="tutorials-topic" id="tutorials-topic" class="u-no-margin--bottom">
      <option value="">Any</option>
      <option value="cloud">Cloud</option>
    </select>
  `;

  it("sets the option value to supplied key", () => {
    document.body.innerHTML = topicFilter;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost?topic=cloud");
    handleFilter("topic", topicEl, url);
    expect(topicEl.value).toBe("cloud");
  });

  it("removes the page parameter from the URL", () => {
    document.body.innerHTML = topicFilter;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost?page=1");
    handleFilter("topic", topicEl, url);
    topicEl.dispatchEvent(new Event("change"));
    expect(url.toString()).toEqual("http://localhost/");
  });

  it("adds filter query param to URL", () => {
    document.body.innerHTML = topicFilter;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost");
    handleFilter("topic", topicEl, url);
    topicEl.value = "cloud";
    topicEl.dispatchEvent(new Event("change"));
    expect(url.toString()).toEqual("http://localhost/?topic=cloud");
  });

  it("removes all query params from URL", () => {
    document.body.innerHTML = topicFilter;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost?page=1&topic=cloud");
    handleFilter("topic", topicEl, url);
    topicEl.value = null;
    topicEl.dispatchEvent(new Event("change"));
    expect(url.toString()).toEqual("http://localhost/");
  });
});
