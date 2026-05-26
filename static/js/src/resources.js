/**
 * Fetches and renders resources from Discourse.
 * You can see all possible tags and resource types by visiting https://ubuntu.com/engage
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
 * https://github.com/canonical/vanilla-framework/issues/5771
 */
const fetchAndRenderResources = (
  tag = "",
  resource = "",
  language = "",
  customTemplateID,
) => {
  tag = tag.replaceAll(" ", "+");
  resource = resource.replaceAll(" ", "+");
  let template = "";
  const FALLBACK_META_IMAGE =
    "https://assets.ubuntu.com/v1/c797f1d7-og_%20canonical.png";

  if (customTemplateID) {
    template = document.getElementById(customTemplateID) || null;
  }

  if (!template) {
    template = document.createElement("template");
    template.innerHTML = `
      <div class="p-section--shallow">
        <div class="grid-row">
          <div class="grid-col-2 grid-col-medium-2">
            <div class="p-image-container--16-9 is-cover" data-key="meta_image_container">
              <img class="p-image-container__image" data-key="meta_image" src="${FALLBACK_META_IMAGE}" alt="" />
            </div>
          </div>
          <div class="grid-col-4 grid-col-medium-2">
            <p><strong><a data-key="path_name"></a></strong></p>
            <p data-key="subtitle"></p>
          </div>
        </div>
      </div>
    `;
  }

  fetch(`/engage/resources.json?tag=${tag}&resource=${resource}`)
    .then((r) => r.json())
    .then((resources) => {
      if (!resources || !resources.length) return;
      const list = document.getElementById("engage-resources__list");

      resources.forEach((resource) => {
        if (!resource.topic_name || !resource.path) return;
        const card = template.content.cloneNode(true);

        const link = card.querySelector("[data-key='path_name']");
        link.href = resource.path;
        link.textContent = resource.topic_name;

        card.querySelector("[data-key='subtitle']").textContent =
          resource.subtitle || "";

        if (resource.meta_image) {
          card.querySelector("[data-key='meta_image']").src =
            resource.meta_image;
        }

        // Some custom templates accommodate resource type
        const cardType = card.querySelector("[data-key='resource_type']");
        if (cardType) {
          cardType.textContent = resource.type || "";
        }

        // Add divider after each card except the last one
        if (list.hasChildNodes()) {
          const hr = document.createElement("hr");
          hr.classList.add("p-rule--muted");
          list.appendChild(hr);
        }

        list.appendChild(card);
      });

      document.getElementById("engage-resources").classList.remove("u-hide");
    })
    .catch(() => {
      // Silently fail
    });
};
