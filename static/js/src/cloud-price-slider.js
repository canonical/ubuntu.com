/**
 Renders slider gradient
 https://vanillaframework.io/docs/patterns/slider
*/
function renderSlider(slider) {
  var isWebkit =
    /Chrome/i.test(navigator.userAgent) || /Safari/i.test(navigator.userAgent);
  if (isWebkit) {
    var value = (slider.value - slider.min) / (slider.max - slider.min);
    slider.style.backgroundImage =
      "-webkit-gradient(linear, left top, right top, color-stop(" +
      value +
      ", #06c), color-stop(" +
      value +
      ", #fff))";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  var sliderElm = document.querySelector(".js-cloud-price-slider");

  var publicCapexElm = document.querySelector("#public-capex");
  var publicOpexElm = document.querySelector("#public-opex");
  var publicTcoElm = document.querySelector("#public-tco");

  var privateCapexElm = document.querySelector("#private-capex");
  var privateOpexElm = document.querySelector("#private-opex");
  var privateTcoElm = document.querySelector("#private-tco");

  // Defaults
  var publicCapexValue = 6;
  publicCapexElm.style.transform = "scaleY(" + publicCapexValue / 250 + ")";
  var publicOpexValue = 96;
  publicOpexElm.style.transform = "scaleY(" + publicOpexValue / 250 + ")";
  var publicTcoValue = publicCapexValue + publicOpexValue;
  publicTcoElm.style.transform = "scaleY(" + publicTcoValue / 250 + ")";

  var privateCapexValue = 64;
  privateCapexElm.style.transform = "scaleY(" + privateCapexValue / 250 + ")";
  var privateOpexValue = 21;
  privateOpexElm.style.transform = "scaleY(" + privateOpexValue / 250 + ")";
  var privateTcoValue = privateCapexValue + privateOpexValue;
  privateTcoElm.style.transform = "scaleY(" + privateTcoValue / 250 + ")";

  const destructiveBorderStyle = "2px solid #C7162B";
  const destructiveBackgroundColor = "rgba(199, 22, 43, 0.10)";
  const successBorderStyle = "2px solid #0E8420";
  const successBackgroundColor = "rgba(14, 132, 32, 0.10)";

  privateTcoElm.style.backgroundColor = successBackgroundColor;
  privateTcoElm.style.border = successBorderStyle;

  publicTcoElm.style.backgroundColor = destructiveBackgroundColor;
  publicTcoElm.style.border = destructiveBorderStyle;

  if (sliderElm) {
    var hrsRange = sliderElm.querySelector("#hours__range");
    renderSlider(hrsRange);

    var isIE = /NET/i.test(navigator.userAgent);
    hrsRange.addEventListener(isIE ? "change" : "input", function (e) {
      var vmHours = e.target.value;

      renderSlider(hrsRange);

      publicOpexValue = parseInt(vmHours);
      publicOpexElm.style.transform = "scaleY(" + publicOpexValue / 200 + ")";
      publicTcoValue = publicOpexValue + publicCapexValue;
      publicTcoElm.style.transform = "scaleY(" + publicTcoValue / 200 + ")";

      if (publicTcoValue < privateTcoValue) {
        privateTcoElm.style.backgroundColor = destructiveBackgroundColor;
        privateTcoElm.style.border = destructiveBorderStyle;

        publicTcoElm.style.backgroundColor = successBackgroundColor;
        publicTcoElm.style.border = successBorderStyle;
      } else {
        privateTcoElm.style.backgroundColor = successBackgroundColor;
        privateTcoElm.style.border = successBorderStyle;

        publicTcoElm.style.backgroundColor = destructiveBackgroundColor;
        publicTcoElm.style.border = destructiveBorderStyle;
      }
    });
  }
});
