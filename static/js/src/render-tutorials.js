const renderTutorials = (topic) => {
  const targetURL = `/tutorials.json?topic=${topic}`;

  fetch(targetURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.length) {
        const tutorials = data;
        const tutorialStrip = document.querySelector("#tutorial-strip");
        const tutorialContainer = document.querySelector(
          "#tutorials-container"
        );
        const tutorialTemplate = document.querySelector("#tutorial-template");

        for (let i = 0; i < tutorials.length; i++) {
          const tutorialCard = tutorialTemplate.content
            .cloneNode(true)
            .querySelector("div");

          const linkEle = tutorialCard.querySelector("a");

          linkEle.innerHTML = tutorials[i].title;
          linkEle.href = tutorials[i].link;

          tutorialContainer.prepend(tutorialCard);
        }

        // Add p-divider__block to the appropriate tutorials
        const tutorialNodes = tutorialContainer.children;
        for (let i = 0; i < tutorialNodes.length; i++) {
          if (i % 3 === 0) tutorialNodes[i].className = "col-4";
        }

        tutorialStrip.style.display = "block";
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
