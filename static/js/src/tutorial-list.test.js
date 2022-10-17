import { handleFilter, setUpSearch } from "./tutorial-list.js";

describe("handleFilter", () => {
  // Setup DOM elements
  const Filters = `
    <form class="p-search-box u-no-margin--bottom" id="tutorials-search" action="">
      <input type="search" class="p-search-box__input" id="tutorials-search-input" name="search" placeholder="Search" required="" autocomplete="on">
      <button type="reset" class="p-search-box__reset"><i class="p-icon--close">Close</i></button>
      <button type="submit" class="p-search-box__button"><i class="p-icon--search">Submit</i></button>
    </form>
    <select name="tutorials-topic" id="tutorials-topic" class="u-no-margin--bottom">
      <option value="">Any</option>
      <option value="cloud">Cloud</option>
    </select>
  `;

  it("sets the option value to supplied key", () => {
    document.body.innerHTML = Filters;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost?topic=cloud");
    handleFilter("topic", topicEl, url);
    expect(topicEl.value).toBe("cloud");
  });

  it("removes the page parameter from the URL", () => {
    document.body.innerHTML = Filters;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost?page=1");
    handleFilter("topic", topicEl, url);
    topicEl.dispatchEvent(new Event("change"));
    expect(url.toString()).toEqual("http://localhost/");
  });

  it("adds filter query param to URL", () => {
    document.body.innerHTML = Filters;
    const topicEl = document.querySelector("#tutorials-topic");
    const url = new URL("http://localhost");
    handleFilter("topic", topicEl, url);
    topicEl.value = "cloud";
    topicEl.dispatchEvent(new Event("change"));
    expect(url.toString()).toEqual("http://localhost/?topic=cloud");
  });

  it("adds the search parameter to the url", () => {
    document.body.innerHTML = Filters;
    const searchForm = document.querySelector("#tutorials-search");
    const searchInput = document.querySelector("#tutorials-search-input");
    const url = new URL("http://localhost");
    setUpSearch(searchForm, searchInput, url);
    expect(searchInput.value).toBe("");
    searchInput.value = "windows";
    searchForm.dispatchEvent(new Event("submit"));
    expect(url.toString()).toEqual("http://localhost/?q=windows");
  });

  it("populates the field if the query param is set", () => {
    document.body.innerHTML = Filters;
    const searchForm = document.querySelector("#tutorials-search");
    const searchInput = document.querySelector("#tutorials-search-input");
    const url = new URL("http://localhost/?q=windows");
    setUpSearch(searchForm, searchInput, url);
    expect(searchInput.value).toBe("windows");
  });

  it("populates the field if the query param is set", () => {
    document.body.innerHTML = Filters;
    const searchForm = document.querySelector("#tutorials-search");
    const searchInput = document.querySelector("#tutorials-search-input");
    const url = new URL("http://localhost/?q=windows");
    setUpSearch(searchForm, searchInput, url);
    searchForm.dispatchEvent(new Event("reset"));
    expect(url.toString()).toEqual("http://localhost/");
  });
});
