console.log("whooopwhoopp");

function handleChangeClick() {
  const id = this.dataset.id;
  const previewSection = document.getElementById(`view-mode--${id}`);
  const editSection = document.getElementById(`edit-mode--${id}`);

  previewSection.classList.add("u-hide");
  editSection.classList.remove("u-hide");
}

const editButtons = document.querySelectorAll(".js-change-subscription-button");

editButtons.forEach((button) => {
  console.log(button.dataset.id);
  button.addEventListener("click", handleChangeClick);
});
