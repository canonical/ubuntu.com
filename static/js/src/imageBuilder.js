(function() {
  // State management
  class StateArray extends Array {
    push(item) {
      const result = super.push(item);
      render();
      return result;
    }
    pop() {
      const item = super.pop();
      render();
      return item;
    }
    remove(index) {
      const item = this.splice(index, 1);
      render();
      return item;
    }
  }

  class StateManager {
    constructor() {
      this.states = {
        board: new StateArray(),
        os: new StateArray(),
        snaps: new StateArray()
      };
    }

    set(name, items) {
      this.states[name] = new StateArray(...items);
      render();
    }

    get(name) {
      return this.states[name];
    }
  }

  let state = new StateManager();

  // Cached document queries
  const boardSelection = document.querySelectorAll(".js-boards .js-selection");
  const osSelection = document.querySelectorAll(".js-os .js-selection");
  const snapSearch = document.querySelector(".js-snap-search");
  const snapResults = document.querySelector(".js-snap-results");
  const preinstallResults = document.querySelector(
    ".js-preinstalled-snaps-list"
  );
  const buildButton = document.querySelector(".js-build-button");
  const step2 = document.querySelector(".js-step-2");
  const step3 = document.querySelector(".js-step-3");
  const form = document.getElementById("build-form");

  let snapSearchResults;
  selectionListeners(boardSelection, "board");
  selectionListeners(osSelection, "os");
  searchHandler();
  step2.classList.add("u-disable");
  step3.classList.add("u-disable");

  function searchHandler() {
    if (snapSearch) {
      snapSearch.addEventListener("keyup", e => {
        // Only trigger is the key press changes a character
        if ((e.which >= 46 && e.which <= 90) || e.which == 8) {
          e.preventDefault();
          triggerSearch();
        }
      });
      snapSearch.addEventListener("submit", e => {
        e.preventDefault();
        triggerSearch();
      });
      snapSearch.addEventListener("reset", () => {
        clearSearch();
      });
    }
  }

  let triggerSearch = debounce(function() {
    snapResults.innerHTML =
      '<p><i class="p-icon--spinner u-animation--spin"></i></p>';
    const searchInput = snapSearch.querySelector(".p-search-box__input");
    if (searchInput) {
      const searchValue = encodeURI(searchInput.value);
      fetch(`/snaps?q=${searchValue}&size=12`)
        .then(response => {
          return response.json();
        })
        .then(json => {
          snapSearchResults = json["_embedded"]
            ? json["_embedded"]["clickindex:package"]
            : {};
          renderSnapList(snapSearchResults, snapResults, "Add");
          addSnapHandler();
        });
    }
  }, 250);

  function clearSearch() {
    snapResults.innerHTML = "";
  }

  function addSnapHandler() {
    const snapAddButtons = snapResults.querySelectorAll(".js-add-snap");
    snapAddButtons.forEach(addButton => {
      addButton.addEventListener("click", e => {
        e.preventDefault();
        const button = e.target.classList.contains("js-add-snap")
          ? e.target
          : e.target.closest(".js-add-snap");
        if (
          lookup(
            snapSearchResults[button.dataset.index].package_name,
            "package_name",
            state.get("snaps")
          ) === false
        ) {
          const selectedSnapContainer = button.closest(
            ".js-snap-search-container"
          );
          if (selectedSnapContainer) {
            selectedSnapContainer.classList.add("u-disable");
          }
          state.get("snaps").push(snapSearchResults[button.dataset.index]);
          renderSnapList(state.get("snaps"), preinstallResults, "Remove");
          removeSnapHandler();
        }
      });
    });
  }

  function removeSnapHandler() {
    const snapRemoveButtons = preinstallResults.querySelectorAll(
      ".js-remove-snap"
    );
    snapRemoveButtons.forEach(removeButton => {
      removeButton.addEventListener("click", e => {
        e.preventDefault();
        const button = e.target.classList.contains("js-remove-snap")
          ? e.target
          : e.target.closest(".js-remove-snap");
        if (state.get("snaps")[button.dataset.index]) {
          const searchIndex = lookup(
            state.get("snaps")[button.dataset.index].package_name,
            "package_name",
            snapSearchResults
          );
          const revealItem = snapResults.querySelector(
            `[data-container-index="${searchIndex}"]`
          );
          if (revealItem) {
            revealItem.classList.remove("u-disable");
          }
        }
        state.get("snaps").remove(button.dataset.index);
        renderSnapList(state.get("snaps"), preinstallResults, "Remove");
        removeSnapHandler();
      });
    });
  }

  function renderSnapList(responce, results, buttonText) {
    if (results) {
      results.innerHTML = "";
      if (Object.entries(responce).length !== 0) {
        responce.forEach((item, index) => {
          let disable = "";
          if (
            lookup(item.package_name, "package_name", state.get("snaps")) !==
              false &&
            buttonText === "Add"
          ) {
            disable = "u-disable";
          }
          let buttonIcon = buttonText === "Add" ? "plus" : "minus";
          item.icon_url = item.icon_url
            ? item.icon_url
            : "https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
          item.validation_icon =
            item.developer_validation === "verified"
              ? `<span class="p-tooltip p-tooltip--top-center" aria-describedby="${item.package_name}-tooltip">
          <img src="https://assets.ubuntu.com/v1/75654c90-rosette.svg">
          <span class="p-tooltip__message u-align--center" role="tooltip" id="${item.package_name}-tooltip">Verified account</span>
        </span>`
              : "";
          results.insertAdjacentHTML(
            "beforeend",
            `<div class="row js-snap-search-container ${disable}" data-container-index="${index}">
              <div class="col-5 col-medium-5 col-small-3">
                <div class="p-media-object u-no-margin--bottom" data-index="${index}">
                  <img src="${
                    item.icon_url
                  }" alt="" class="p-media-object__image">
                  <div class="p-media-object__details">
                    <h1 class="p-media-object__title" style="line-height: 1.4rem">${
                      item.title
                    }</h1>
                    <p class="p-media-object__content">
                      ${item.publisher} ${item.validation_icon}
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-1 col-medium-1 col-small-1">
                <button class="p-button--base js-${buttonText.toLowerCase()}-snap" data-index="${index}"><i class="p-icon--${buttonIcon}">${buttonText}</i></button>
              </div>
            </div>
            <hr />`
          );
        });
        render();
      } else {
        results.innerHTML =
          buttonText == "Add" ? "<p>No matching snaps</p>" : "<p>None</p>";
      }
    }
  }

  function selectionListeners(collection, stateIndex) {
    collection.forEach(selection => {
      selection.addEventListener("click", function() {
        selectCollection(collection, selection);
        const value = this.querySelector(".js-name").innerText;
        state.set(stateIndex, [value]);
        updateOSs();
      });
    });
  }

  function selectCollection(collection, selected) {
    collection.forEach(item => {
      item.classList.remove("is-selected");
    });
    selected.classList.add("is-selected");
  }

  function updateOSs() {
    osSelection.forEach(selection => {
      const osSupport = selection.dataset.supports;
      const selectedBoard = state
        .get("board")[0]
        .replace(" ", "-")
        .toLowerCase();

      // Check if the currently selected OS supports the this board
      if (osSupport.includes(selectedBoard)) {
        selection.closest(".js-selection-container").classList.remove("u-hide");
      } else {
        selection.closest(".js-selection-container").classList.add("u-hide");

        // If current OS selection is not supported by the board reset OS
        if (selection.classList.contains("is-selected")) {
          state.set("os", [""]);
          selection.classList.remove("is-selected");
        }
      }
    });
  }

  // Render functions
  function render() {
    renderSummary();
    updateForm();
    checkDisabled();
  }

  function renderSummary() {
    if (
      state.get("board") &&
      state.get("board")[0] &&
      state.get("os") &&
      state.get("os")[0]
    ) {
      buildButton.setAttribute("aria-disabled", "false");
      buildButton.disabled = false;
    } else {
      buildButton.setAttribute("aria-disabled", "true");
      buildButton.disabled = true;
    }
  }

  function updateForm() {
    const boardInput = form.querySelector('[name="board"]');
    const systemInput = form.querySelector('[name="system"]');
    const snapsInput = form.querySelector('[name="snaps"]');
    if (state.get("board").length >= 1) {
      boardInput.value = state
        .get("board")[0]
        .toLowerCase()
        .replace(" ", "");
    }
    if (state.get("os").length >= 1) {
      systemInput.value = state
        .get("os")[0]
        .toLowerCase()
        .replace(" ", "")
        .replace("-bit ", "");
    }
    let snapsString = "";
    let comma = "";
    state.get("snaps").forEach(snap => {
      snapsString += `${comma}${snap.package_name}`;
      comma = ",";
    });
    snapsInput.value = snapsString;
  }

  function checkDisabled() {
    step2.classList.add("u-disable");
    step3.classList.add("u-disable");
    if (state.get("board") && state.get("board")[0] != "") {
      step2.classList.remove("u-disable");
    }
    if (state.get("os") && state.get("os")[0] != "") {
      step3.classList.remove("u-disable");
    }
  }

  // Utils functions
  function lookup(name, key, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i][key] === name) {
        return i;
      }
    }
    return false;
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  renderSummary();
})();
