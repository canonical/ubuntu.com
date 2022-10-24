(function () {
  const keys = {
    left: "ArrowLeft",
    right: "ArrowRight",
  };

  const direction = {
    ArrowLeft: -1,
    ArrowRight: 1,
  };

  // IE11 doesn't support event.code, but event.keyCode is
  // deprecated in most modern browsers, so we should support
  // both for the time being.
  const IEKeys = {
    left: 37,
    right: 39,
  };

  const IEDirection = {
    37: direction["ArrowLeft"],
    39: direction["ArrowRight"],
  };

  /**
      Determine which tab to show when an arrow key is pressed
      @param {KeyboardEvent} event
      @param {Array} tabs an array of tabs within a container
    */
  const switchTabOnArrowPress = (event, tabs) => {
    let compatibleKeys = IEKeys;
    let compatibleDirection = IEDirection;
    let pressed = event.keyCode;

    if (event.code) {
      compatibleKeys = keys;
      compatibleDirection = direction;
      pressed = event.code;
    }

    if (compatibleDirection[pressed]) {
      const target = event.target;
      if (target.index !== undefined) {
        if (tabs[target.index + compatibleDirection[pressed]]) {
          tabs[target.index + compatibleDirection[pressed]].focus();
        } else if (pressed === compatibleKeys.left) {
          tabs[tabs.length - 1].focus();
        } else if (pressed === compatibleKeys.right) {
          tabs[0].focus();
        }
      }
    }
  };

  /**
      Attaches a number of events that each trigger
      the reveal of the chosen tab content
      @param {Array} tabs an array of tabs within a container
    */
  const attachEvents = (tabs, persistURLHash) => {
    tabs.forEach(function (tab, index) {
      tab.addEventListener("keyup", function (e) {
        let compatibleKeys = IEKeys;
        let key = e.keyCode;

        if (e.code) {
          compatibleKeys = keys;
          key = e.code;
        }

        if (key === compatibleKeys.left || key === compatibleKeys.right) {
          switchTabOnArrowPress(e, tabs);
        }
      });

      tab.addEventListener("click", (e) => {
        e.preventDefault();

        if (persistURLHash) {
          // if we're adding the ID of the tab to the URL
          // this prevents the page attempting to jump to
          // the section with that ID
          history.pushState({}, "", tab.href);

          // Update the URL again with the same hash, then go back
          history.pushState({}, "", tab.href);
          history.back();
        }

        setActiveTab(tab, tabs);
      });

      tab.addEventListener("focus", () => {
        setActiveTab(tab, tabs);
      });

      tab.index = index;
    });
  };

  /**
      Cycles through an array of tab elements and ensures
      only the target tab and its content are selected
      @param {HTMLElement} tab the tab whose content will be shown
      @param {Array} tabs an array of tabs within a container
    */
  const setActiveTab = (tab, tabs) => {
    tabs.forEach((tabElement) => {
      var tabContent = document.querySelectorAll(
        "#" + tabElement.getAttribute("aria-controls")
      );
      tabContent.forEach((content) => {
        if (tabElement === tab) {
          tabElement.setAttribute("aria-selected", true);
          content.classList.remove("u-hide");
          if (triggerReload) {
            window.dispatchEvent(new Event("resize"));
          }
        } else {
          tabElement.setAttribute("aria-selected", false);
          content.classList.add("u-hide");
        }
      });
    });
  };

  /**
    Attaches events to tab links within a given parent element,
    and sets the active tab if the current hash matches the id
    of an element controlled by a tab link
    @param {String} selector class name of the element
    containing the tabs we want to attach events to
  */
  const initTabs = (selector) => {
    var tabContainers = [].slice.call(document.querySelectorAll(selector));

    tabContainers.forEach((tabContainer) => {
      // if the tab container has this data attribute, the id of the tab
      // is added to the URL, and a particular tab can be directly linked
      var persistURLHash = tabContainer.getAttribute("data-maintain-hash");
      var currentHash = window.location.hash;

      var tabs = [].slice.call(
        tabContainer.querySelectorAll("[aria-controls]")
      );
      attachEvents(tabs, persistURLHash);

      if (persistURLHash && currentHash) {
        var activeTab = document.querySelector(
          ".p-tabs__link[href='" + currentHash + "']"
        );

        if (activeTab) {
          setActiveTab(activeTab, tabs);
        }
      } else {
        setActiveTab(tabs[0], tabs);
      }
    });
  };

  /**
    Check to see if a given script has been loaded on the page.
  
    If a chart is on a tab that isn't visible, it isn't built,
    because its width depends on a parent element's width, which
    is zero when the tab is not visible.
   
    Charts aren't responsive and need to be redrawn if the window
    is resized, so they listen for that event and trigger the redraw
    when it fires.
   
    @param {String} scriptName name of the script to check exists
    on the page
  */
  const isScriptIncluded = (scriptName) => {
    var scripts = document.scripts;

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes(scriptName)) {
        return true;
      }
    }

    return false;
  };
  const targetScript = "release-chart.js";
  const triggerReload = isScriptIncluded(targetScript);

  document.addEventListener("DOMContentLoaded", () => {
    initTabs(".js-tabbed-content");
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-tab")) {
      const tabContainer = e.target.closest(".js-tabs");

      const tabs = [].slice.call(
        tabContainer.querySelectorAll("[aria-controls]")
      );

      if (tabs) {
        setActiveTab(e.target, tabs);
      }
    }
  });
})();
