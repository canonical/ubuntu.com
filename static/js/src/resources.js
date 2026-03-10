/**
 * Fetches and renders resources from Discourse.
 * @param {string} tag - The tag to filter resources by.
 * @param {string} resource - The resource type to filter by.
 * @returns {void}
 *
 * Requires the following HTML structure. I will populate `engage-resources__list`:
 *  <div id="engage-resources" class="u-hide">
 *    <div id="engage-resources__list" class="u-fixed-width"></div>
 *  </div>
 * 
 * XXX: This is a hack until we have an individual resource component pattern.
 */
const fetchAndRenderResources = (tag = "", resource = "") => {
  tag = tag.replaceAll(" ", "+");
  resource = resource.replaceAll(" ", "+");

  const template = document.createElement("template");
  template.innerHTML = `
    <div class="p-section--shallow">
      <div class="grid-row">
        <div class="grid-col-2 grid-col-medium-2">
          <div class="p-image-container--16-9 is-cover" data-key="meta_image_container">
            <img class="p-image-container__image" data-key="meta_image" src="" alt="" />
          </div>
        </div>
        <div class="grid-col-4 grid-col-medium-2">
          <p><strong><a data-key="path_name"></a></strong></p>
          <p data-key="subtitle"></p>
        </div>
      </div>
    </div>
  `;

  fetch(`/engage/resources.json?tag=${tag}&resource=${resource}`)
    .then((r) => r.json())
    .then((resources) => {
      if (!resources || !resources.length) return;
      const list = document.getElementById("engage-resources__list");

      resources.forEach((resource) => {
        if (!resource.topic_name || !resource.path) return;

        const card = template.content.cloneNode(true);

        if (resource.meta_image) {
          card.querySelector("[data-key='meta_image']").src = resource.meta_image;
        } else {
          card.querySelector("[data-key='meta_image_container']").remove();
        }

        const link = card.querySelector("[data-key='path_name']");
        link.href = resource.path;
        link.textContent = resource.topic_name;

        card.querySelector("[data-key='subtitle']").textContent = resource.subtitle || "";
        list.appendChild(card);
      });

      document.getElementById("engage-resources").classList.remove("u-hide");
    })
    .catch(() => {
      // Silently fail
    });
};
