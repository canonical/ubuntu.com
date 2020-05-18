import lightbox from './lightbox';

function initLightbox() {
  const lightboxElements = Array.from(document.getElementsByClassName("js-lightbox-item"));

  let images = lightboxElements.map(function(element) {
    return element.href;
  })

  let lightboxClosure = function(event, currentElement, images) {
    event.preventDefault();
    lightbox.openLightbox(
      currentElement.href,
      images
    );
  };

  lightboxElements.forEach((lightboxElement) => {
    lightboxElement.addEventListener("click", (function (currentElement, images) {
      return function (e) {
          lightboxClosure(e, currentElement, images);
      };
    })(lightboxElement, images), false);
  });
}

document.addEventListener("DOMContentLoaded", function(){
  initLightbox();
});
