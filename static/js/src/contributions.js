/**
 * Select an equivalent item for a certain contribution amount
 */
function chooseEquivalentItem(totalAmount) {
  const items = [
    {
      imageFile: "86981cf1-skull.png?w=78",
      price: 0,
      description: "Nothing. Use Ubuntu for free.",
    },
    {
      imageFile: "0617b159-ace-of-spades.png?w=78",
      price: 1,
      description: "the Ace of Spades download",
    },
    {
      imageFile: "b52102d9-mocca.png?w=78",
      price: 2,
      description: "grande extra shot mocha latta chino",
    },
    {
      imageFile: "0ca1e249-pint-of-ale.png?w=78",
      price: 5,
      description: "pint of Micro-brew Nevada Pale Ale",
    },
    {
      imageFile: "bd982caa-happy-meal.png?w=78",
      price: 7,
      description: "A Royale with Cheese ",
    },
    {
      imageFile: "e474c36d-cinema-ticket.png?w=78",
      price: 10,
      description: "a night at the movies. By yourself.",
    },
    {
      imageFile: "274c40d3-king-kong.png?w=78",
      price: 15,
      description: "King Kong versus Godzilla on DVD",
    },
    {
      imageFile: "b26d26e5-t-shirt.png?w=78",
      price: 20,
      description: "Peace, Love and Linux t-shirt (shirt not included)",
    },
    {
      imageFile: "86f3bcab-frying-pan.png?w=78",
      price: 30,
      description: "stainless steel copper-bottom frying pan",
    },
    {
      imageFile: "733a3650-sega-controller.png?w=78",
      price: 50,
      description: "vintage SNES game bundle",
    },
    {
      imageFile: "d6d7d638-levi-501.png?w=78",
      price: 60,
      description: "pair of vintage acid wash Levi 501s",
    },
    {
      imageFile: "76f933b2-drum-kit.png?w=78",
      price: 100,
      description: "pair of LP Matador bongo drums",
    },
    {
      imageFile: "ae1705f2-emu-chicks.png?w=78",
      price: 200,
      description: "pair of sexed Emu chicks",
    },
    {
      imageFile: "4cbbd365-ldn-nyc-flight.png?w=78",
      price: 500,
      description: "flight from New York to London (one way)",
    },
    {
      imageFile: "7a47693f-camel.png?w=78",
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
  const submit = document.querySelector(".js-contribute-submit");

  if (total == 0) {
    submit.disabled.disabled = true;
  } else {
    submit.classList.disabled = false;
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
  const progressColour = "#E95420";
  const emptyColour = "#fff";

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
