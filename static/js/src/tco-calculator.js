function initTCOCalculator(calculator) {
  attachRangeEvents(calculator);
}

function attachRangeEvents(calculator) {
  const inputContainers = calculator.querySelectorAll(
    ".js-tco-calculator__range"
  );

  inputContainers.forEach(container => {
    let input = container.querySelector("input[type='number']");
    let range = container.querySelector("input[type='range']");

    input.addEventListener("input", e => {
      range.value = e.target.value;
    });

    range.addEventListener("input", e => {
      input.value = e.target.value;
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const calculator = document.querySelector(".js-tco-calculator");

  if (calculator) {
    initTCOCalculator(calculator);
  }
});
