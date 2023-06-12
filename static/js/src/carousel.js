function initCarousel(carouselSelector, nextCTAselector, previousCTAselector) {
  console.log("here")
  var nextCTA = document.querySelector(nextCTAselector);
  var previousCTA = document.querySelector(previousCTAselector);
  var carousel = new Flickity(carouselSelector, {
    imagesLoaded: true,
    prevNextButtons: false,
    wrapAround: true,
  });

  if (nextCTA) {
    nextCTA.addEventListener("click", function (e) {
      e.preventDefault();
      carousel.next();
    });
  }

  if (previousCTA) {
    previousCTA.addEventListener("click", function (e) {
      e.preventDefault();
      carousel.previous();
    });
  }
}