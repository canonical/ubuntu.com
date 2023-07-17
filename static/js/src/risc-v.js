// Toggles show board based on selection on small screens

const boards = document.querySelectorAll(`[role=tabpanel]`);
const dropdownSelect = document.getElementById("boardSelect");

dropdownSelect.addEventListener("change", (event) => {
    selectBoard();
})

function selectBoard() {
  boards.forEach(board => {
    if (board.id === dropdownSelect.value) {
      board.classList.remove("u-hide")
      board.focus();
    } else {
      board.classList.add("u-hide");
    }
  })
}