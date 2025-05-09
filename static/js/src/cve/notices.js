function toggleShowBtn(showSection) {
  const truncated = document.querySelector(`.js-${showSection}-truncated`);
  const all = document.querySelector(`.js-${showSection}-all`);
  const showMoreButton = document.querySelector(`.js-show-more-${showSection}`);
  const showLessButton = document.querySelector(`.js-show-less-${showSection}`);

  showMoreButton?.addEventListener("click", function () {
    truncated.classList.add("u-hide");
    all.classList.remove("u-hide");
    showMoreButton.classList.add("u-hide");
    showLessButton.classList.remove("u-hide");
  });

  showLessButton?.addEventListener("click", function () {
    truncated.classList.remove("u-hide");
    all.classList.add("u-hide");
    showMoreButton.classList.remove("u-hide");
    showLessButton.classList.add("u-hide");
  });
}
toggleShowBtn("description");
toggleShowBtn("details");
toggleShowBtn("references");
toggleShowBtn("notices");

function resetSearch(input, resetBtn) {
  if (input.value.trim() !== "") {
    resetBtn.classList.remove("u-hide");
  } else {
    resetBtn.classList.add("u-hide");
  }
}

function handleSearch(section) {
  const form = document.querySelector(`.js-${section}-form`);
  const input = form?.querySelector('input[type="search"]');
  const resetBtn = form?.querySelector(".p-search-box__reset");

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get(section);

  if (input) {
    // Populate search box with URL search param
    if (queryValue) {
      input.value = queryValue;
      resetBtn?.classList.remove("u-hide");
    }
    if (resetBtn) {
      resetSearch(input, resetBtn);
      input.addEventListener("input", function () {
        resetSearch(input, resetBtn);
      });
    }
  }

  // Add event listener to toggle the reset button visibility
  resetBtn?.addEventListener("click", function () {
    input.value = "";
    resetBtn.classList.add("u-hide");
    input.focus();
  });
}
handleSearch("cve");
handleSearch("usn");

function handleTooltips() {
  const tooltipElements = document.querySelectorAll(".js-tooltip");

  tooltipElements?.forEach(function (tooltip) {
    const tooltipMessage = tooltip.querySelector(".p-tooltip__message");

    tooltip.addEventListener("click", function (e) {
      e.stopPropagation();

      // Hide all tooltips when clicked
      document
        .querySelectorAll(".p-tooltip__message.u-show")
        .forEach(function (otherMessage) {
          if (otherMessage !== tooltipMessage) {
            otherMessage.classList.remove("u-show");
            otherMessage.classList.add("u-hide");
          }
        });

      // Show the toggled tooltip
      const isHidden = tooltipMessage.classList.contains("u-hide");
      if (isHidden) {
        tooltipMessage.classList.remove("u-hide");
        tooltipMessage.classList.add("u-show");
      } else {
        tooltipMessage.classList.remove("u-show");
        tooltipMessage.classList.add("u-hide");
      }
    });
  });

  // Hide all tooltips when clicked elsewhere on screen
  document.addEventListener("click", function () {
    document
      .querySelectorAll(".p-tooltip__message.u-show")
      .forEach(function (msg) {
        msg.classList.remove("u-show");
        msg.classList.add("u-hide");
      });
  });
}
handleTooltips();
