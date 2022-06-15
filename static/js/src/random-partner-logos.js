const partners_logos = [
  {
    url: "https://assets.ubuntu.com/v1/6079d02b-amd-logo.png",
    alt: "AMD",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/cd765ccc-nvidia-logo.png",
    alt: "Nvidia",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/3cf238fd-Qualcomm-Logo.svg",
    alt: "QUALCOMM",
    width: "158",
    height: "35",
  },
  {
    url: "https://assets.ubuntu.com/v1/0176f106-rigado-logo.png",
    alt: "Rigado",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/0f4ef2b8-adlink-logo.png",
    alt: "ADLINK",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/6d820b6d-avnet-logo.png",
    alt: "Avnet",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/987acdaa-dell-logo.png",
    alt: "Dell",
    height: "288",
    width: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/5e075792-rexroth-logo.png",
    alt: "rexroth",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/e796fb76-abb-logo.png",
    alt: "ABB",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/2234031b-Siemens-logo.svg.png",
    alt: "Siemens",
    width: "128",
    height: "30",
  },
  {
    url: "https://assets.ubuntu.com/v1/3ba27c02-osram-logo.svg",
    alt: "osram",
    width: "128",
    height: "30",
  },
  {
    url: "https://assets.ubuntu.com/v1/008d22ff-dfi-logo.png",
    alt: "DFI",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/711be910-arm-logo.png",
    alt: "ARM",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/5f2124c1-xilinx-logo.png",
    alt: "Xilink",
    width: "288",
    height: "288",
  },
  {
    url: "https://assets.ubuntu.com/v1/0ebb345c-MediaTek_logo.svg",
    alt: "MediaTek",
    width: "200",
    height: "80",
  },
];

const logo_section_items = document.querySelector(".p-logo-section__items");
let randomIndexArray = [];

for (let i = 1; i <= 5; i += 1) {
  const randomNum = Math.floor(Math.random() * partners_logos.length);
  const logo = partners_logos[randomNum];

  if (randomIndexArray.indexOf(randomNum) === -1) {
    randomIndexArray.push(randomNum);
    let element = `<div class="p-logo-section__item">
    <img src=${logo.url} alt=${logo.alt} width=${logo.width} height=${logo.height} loading="lazy" /> </div>`;
    logo_section_items.insertAdjacentHTML("beforeend", element);
  } else {
    i--;
  }
}
