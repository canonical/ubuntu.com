function toggleTutorialNavigation() {
  const toggleButton = document.querySelector(".l-tutorial__nav-toggle");
  const menu = document.getElementById(
    toggleButton.getAttribute("aria-controls")
  );
  const expanded = toggleButton.getAttribute("aria-expanded") === "true";

  if (menu) {
    toggleButton.setAttribute("aria-expanded", !expanded);
    menu.setAttribute("aria-hidden", expanded);
  }

  toggleButton.classList.toggle("p-icon--menu");
  toggleButton.classList.toggle("p-icon--close");
  menu.classList.toggle("u-hide--small");
}

function setActiveLink(navigationItems, hash) {
  navigationItems.forEach((item) => {
    const link = item.querySelector(".l-tutorial__nav-link");
    if (link.getAttribute("href") === hash) {
      item.classList.add("is-active");
    } else {
      item.classList.remove("is-active");
    }
  });
}

const navigationItems = document.querySelectorAll(".l-tutorial__nav-item");
const toggleButton = document.querySelector(".l-tutorial__nav-toggle");

if (toggleButton) {
  toggleButton.addEventListener("click", toggleTutorialNavigation);
}

setActiveLink(navigationItems, window.location.hash);

navigationItems.forEach((item) => {
  const link = item.querySelector(".l-tutorial__nav-link");
  link.addEventListener("click", toggleTutorialNavigation);
});

window.addEventListener("hashchange", (e) => {
  e.preventDefault();
  setActiveLink(navigationItems, window.location.hash);
});

const sectionIds = [];

const tutorialSections = document.querySelectorAll(
  ".l-tutorial__content section"
);
tutorialSections.forEach((section) => {
  sectionIds.push(section.id);
});

// Navigate to first tutorial step on load if no URL hash
if (!window.location.hash) {
  const firstSectionLink = document.querySelector(".l-tutorial__nav-link");
  if (firstSectionLink) {
    const hash = firstSectionLink.getAttribute("href");
    const url = window.location + hash;

    window.location.replace(url);
  }
} else {
  // Redirect #0, #1 etc. to the correct section
  const match = window.location.hash.match(/^#(\d+)$/);

  if (match) {
    const index = parseInt(match[1]);
    const sectionId = sectionIds[index];
    window.location.hash = "#" + sectionId;
    window.location.reload();
  }
}

const tutorialFeedbackOptions = document.querySelector(
  ".l-tutorial__feedback-options"
);
const tutorialFeedbackIcons = document.querySelectorAll(".js-feedback-icon");
const tutorialFeedbackResult = document.querySelector(
  ".l-tutorial__feedback-result"
);

tutorialFeedbackIcons.forEach((icon) => {
  icon.addEventListener("click", function (e) {
    const feedbackValue = e.target.getAttribute("data-feedback-value");
    dataLayer.push({
      event: "GAEvent",
      eventCategory: "feedback",
      eventAction: feedbackValue,
      eventLabel: feedbackValue,
      eventValue: undefined,
    });

    tutorialFeedbackOptions.classList.add("u-hide");
    tutorialFeedbackResult.classList.remove("u-hide");
  });
});

const polls = document.querySelectorAll(".poll");

polls.forEach((poll) => {
  const answers = poll.querySelectorAll('[type="radio"]');
  const pollId = poll.getAttribute("data-poll-name");

  answers.forEach((answer) => {
    answer.addEventListener("change", (e) => {
      const answerLabel = document.querySelector(
        'label[for="' + e.target.id + '"]'
      );
      const eventLabel = answerLabel.innerText;
      const eventAction = document.getElementById(pollId).innerText;

      dataLayer.push({
        event: "GAEvent",
        eventCategory: "survey",
        eventAction: eventAction,
        eventLabel: eventLabel,
        eventValue: undefined,
      });
    });
  });
});

export { toggleTutorialNavigation, setActiveLink };
