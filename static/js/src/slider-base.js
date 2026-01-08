// This is the JS base required to make the slider component work
// It colours the progress bar and equalizers the values between
// the input and slider elements
// From: https://vanillaframework.io/docs/patterns/slider

var isWebkit =
  /Chrome/i.test(navigator.userAgent) || /Safari/i.test(navigator.userAgent);

var PROGRESS_COLOUR = "#06c";
var EMPTY_COLOUR = "#D9D9D9";

/**
 Renders gradient to fake progress color in webkit browsers.
  @param {HTMLElement} slider Slider element to render background on.
*/
function renderSlider(slider) {
  if (isWebkit) {
    var value = (slider.value - slider.min) / (slider.max - slider.min);
    slider.style.backgroundImage =
      "-webkit-gradient(linear, left top, right top, color-stop(" +
      value +
      ", " +
      PROGRESS_COLOUR +
      "), color-stop(" +
      value +
      ", " +
      EMPTY_COLOUR +
      "))";
  }
}

function equaliseValues(receive, give) {
  receive.value = give.value;
  give.value = receive.value;
}

/**
  Attaches change listener to sliders to update their background color.
  @param {HTMLElement} slider Slider element to render background on.
*/
function initSlider(slider) {
  var input = document.getElementById(slider.id + "-input");
  renderSlider(slider);

  if (input) {
    // Synchronise values of input and slider
    equaliseValues(input, slider);
    input.addEventListener("input", function () {
      if (!input.value) {
        input.value = 0;
      }
      equaliseValues(slider, input);
      renderSlider(slider);
    });
  }

  slider.addEventListener("input", function () {
    if (input) {
      equaliseValues(input, slider);
    }
    renderSlider(slider);
  });
}

// Setup all sliders on the page.
var sliders = document.querySelectorAll("input[type=range]");

for (var i = 0, l = sliders.length; i < l; i++) {
  initSlider(sliders[i]);
}
