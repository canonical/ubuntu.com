(function () {
  const content = document.querySelector(".page-content");
  const container = document.querySelector("#table-of-contents");
  const headings = content.querySelectorAll("h2, h3, h4");
  const urlHash = window.location.hash;
  // Do not render if there is no content or container for the table of contents
  if (!content || !container) {
    return;
  }

  const list = document.createElement("ul");
  list.classList.add("p-table-of-contents__list");

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    const id = idFromTitle(heading.innerText);
    heading.id = id;
    if (id === urlHash) {
      // Scroll to the heading if it is the current URL hash
      heading.scrollIntoView();
    }
    const listItem = document.createElement("li");
    listItem.classList.add(`p-table-of-contents__item`);
    listItem.style.marginLeft = `${(level - 2) * 1}rem`;
    const anchor = document.createElement("a");
    anchor.classList.add("p-table-of-contents__link");
    anchor.href = `#${id}`;
    anchor.innerText = heading.innerText;
    listItem.appendChild(anchor);
    list.appendChild(listItem);
  });

  container.prepend(list);

  function idFromTitle(headingText) {
    let id = headingText.replace(/\s+/g, "-").toLowerCase();
    id = id.replace(",", "");
    id = id.replace(".", "");
    return id;
  }
})();
