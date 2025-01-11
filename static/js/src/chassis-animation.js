import { debounce } from "./utils/debounce.js";

var element = document.querySelector(".js-chassis-animation");
var elementHeight = element.clientHeight;

document.addEventListener("scroll", debounce(animate, 50));

function inView() {
  var windowHeight = window.innerHeight;
  var scrollY = window.scrollY || window.pageYOffset;

  var scrollPosition = scrollY + windowHeight;
  var elementPosition =
    element.getBoundingClientRect().top + scrollY + elementHeight;

  if (scrollPosition > elementPosition) {
    return true;
  }

  return false;
}

function animate() {
  if (inView()) {
    element.classList.add("is-playing");
  }
}
