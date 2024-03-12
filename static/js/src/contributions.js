/**
 * Select an equivalent item for a certain contribution amount
 */
function chooseEquivalentItem(totalAmount) {
  const items = [
    {
      imageFile: "76474def-skull.png?w=78",
      price: 0,
      description: "nothing. Use Ubuntu for free.",
    },
    {
      imageFile: "5ed9443e-ace-of-spades.png?w=78",
      price: 1,
      description: "the Ace of Spades download",
    },
    {
      imageFile: "9541c073-mocca.png?w=78",
      price: 2,
      description: "a grande extra shot mocha latte chino",
    },
    {
      imageFile: "2077e905-pint-of-ale.png?w=78",
      price: 5,
      description: "a pint of Micro-brew Nevada Pale Ale",
    },
    {
      imageFile: "915166a2-happy-meal.png?w=78",
      price: 7,
      description: "a Royale with Cheese ",
    },
    {
      imageFile: "174302ef-cinema-ticket.png?w=78",
      price: 10,
      description: "a night at the movies. By yourself.",
    },
    {
      imageFile: "a1188f35-king-kong.png?w=78",
      price: 15,
      description: "a King Kong versus Godzilla on DVD",
    },
    {
      imageFile: "691d844b-t-shirt.png?w=78",
      price: 20,
      description: "a Peace, Love and Linux t-shirt (shirt not included)",
    },
    {
      imageFile: "20ff74f6-frying-pan.png?w=78",
      price: 30,
      description: "a stainless steel copper-bottom frying pan",
    },
    {
      imageFile: "57efdbf6-sega-controller.png?w=78",
      price: 50,
      description: "a vintage SNES game bundle",
    },
    {
      imageFile: "6f306318-levi-501.png?w=78",
      price: 60,
      description: "a pair of vintage acid wash Levi 501s",
    },
    {
      imageFile: "6568bb40-drum-kit.png?w=78",
      price: 100,
      description: "a pair of LP Matador bongo drums",
    },
    {
      imageFile: "d68d7f92-emu-chicks.png?w=78",
      price: 200,
      description: "a pair of sexed Emu chicks",
    },
    {
      imageFile: "bf4a2dd8-ldn-nyc-flight.png?w=78",
      price: 500,
      description: "a flight from New York to London (one way)",
    },
    {
      imageFile: "8a0db30e-camel.png?w=78",
      price: 1000,
      description: "an eight year-old dromedary camel",
    },
  ];
  const lastItem = items[items.length - 1];
  let matchingItem = false;

  items.forEach((item, itemIndex) => {
    if (
      item["price"] == totalAmount ||
      (item["price"] > totalAmount &&
        items[itemIndex - 1]["price"] < totalAmount)
    ) {
      matchingItem = items[itemIndex];
    }
  });

  if (!matchingItem && totalAmount > lastItem["price"]) {
    matchingItem = lastItem;
  }

  return matchingItem;
}

function updateEquivalentItem(item) {
  const image = document.querySelector(".js-equivalent-image");
  const description = document.querySelector(".js-equivalent-description");

  image.src = "https://assets.ubuntu.com/v1/" + item["imageFile"];
  image.alt = item["description"];
  description.innerText = item["description"];
}

function toggleSubmit(total) {
  const submitButton = document.querySelector(".js-contribute-submit");

  if (total <= 0) {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

function updateSummary() {
  // Get the total amount of all the contribution items selected
  const inputs = document.querySelectorAll(".p-slider__input");
  let total = 0;

  inputs.forEach((valueElement) => {
    total += parseInt(valueElement.value || 0);
  });

  const item = chooseEquivalentItem(total);

  document.querySelector(".js-total-amount").innerText = total;
  updateEquivalentItem(item);
  toggleSubmit(total);
}

/**
 * Send form values to Google Analytics
 * Also send which header has been shown
 */
function sendContributionFormAnalytics() {
  // preparing GA submission. step 1 _addTrans
  const inputs = document.querySelectorAll(".p-slider__input");
  const total = document.querySelector(".js-total-amount").innerText;

  // add the individual items
  inputs.forEach((amountElement) => {
    const name = amountElement.parentNode.parentNode.id;
    let value = amountElement.value || 0;

    if (value > 0) {
      dataLayer.push({
        event: "GAEvent",
        eventCategory: "Contributions",
        eventAction: "Item",
        eventLabel: name,
        eventValue: value,
      });
    }
  });

  dataLayer.push({
    event: "GAEvent",
    eventCategory: "Contributions",
    eventAction: "Paid",
    eventLabel: "Total",
    eventValue: total,
  });
}

function detectBrowser() {
  let browser;

  /Edge/i.test(navigator.userAgent)
    ? (browser = "Edge")
    : /Chrome/i.test(navigator.userAgent)
    ? (browser = "Chrome")
    : /Safari/i.test(navigator.userAgent)
    ? (browser = "Safari")
    : /NET/i.test(navigator.userAgent)
    ? (browser = "IE")
    : (browser = "Other");

  return browser;
}

function equaliseValues(receive, give) {
  receive.value = give.value;
  give.value = receive.value;
}

// Fix for Chrome and Safari as they don't support CSS slider progress
function renderSlider(slider, progressColour, emptyColour, browser) {
  if (browser === "Chrome" || browser === "Safari") {
    const value = (slider.value - slider.min) / (slider.max - slider.min);

    slider.style.backgroundImage =
      "-webkit-gradient(linear, left top, right top, color-stop(" +
      value +
      ", " +
      progressColour +
      "), color-stop(" +
      value +
      ", " +
      emptyColour +
      "))";
  }
}

function initContributionSummary(optionsArea) {
  const form = document.querySelector("#contributions-form");
  const inputs = document.querySelectorAll(".p-slider__input");

  // Submit analytics before submitting form
  form.addEventListener("submit", sendContributionFormAnalytics);

  /**
   * Reset fields back to 0, if missing values
   */
  inputs.forEach((valueElement) => {
    valueElement.addEventListener("blur", function () {
      if (isNaN(parseInt(valueElement.value))) {
        valueElement.value = 0;
      }
    });
  });

  optionsArea.addEventListener("change", updateSummary);
  optionsArea.addEventListener("input", updateSummary);
  updateSummary();
}

function initSliders(sliders) {
  const browser = detectBrowser();
  const progressColour = "#0066CC";
  const emptyColour = "#D9D9D9";

  sliders.forEach((slider) => {
    let input = document.getElementById(slider.id + "-input");
    renderSlider(slider, progressColour, emptyColour, browser);

    if (input) {
      equaliseValues(input, slider);

      input.oninput = () => {
        if (!input.value) input.value = 0;
        equaliseValues(slider, input);
        renderSlider(slider, progressColour, emptyColour, browser);
      };
    }

    // Fix for IE as it doesn't support 'oninput'
    if (browser === "IE") {
      slider.onchange = () => {
        if (input) equaliseValues(input, slider);
      };
    } else {
      slider.oninput = () => {
        if (input) equaliseValues(input, slider);
        renderSlider(slider, progressColour, emptyColour, browser);
      };
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const optionsArea = document.querySelector(".contribute__options");
  const sliders = document.querySelectorAll(".p-slider");

  if (optionsArea) {
    initContributionSummary(optionsArea);
  }

  if (sliders) {
    initSliders(sliders);
  }
});
