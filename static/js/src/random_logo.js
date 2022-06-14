let partners_logo = [
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
    url: "https://assets.ubuntu.com/v1/e9dabb1f-adlink+logo.png",
    alt: "ADLINK",
    width: "185",
    height: "52",
  },
  {
    url: "https://assets.ubuntu.com/v1/185a14f4-Avnet.png",
    alt: "Avnet",
    width: "150",
    height: "28",
  },
  {
    url: "https://assets.ubuntu.com/v1/97e29c13-Dell.svg",
    alt: "Dell",
    height: "90",
    width: "90",
  },
  {
    url: "https://assets.ubuntu.com/v1/156ddbf8-rexroth_logo.svg",
    alt: "rexroth",
    width: "131",
    height: "53",
  },
  {
    url: "https://assets.ubuntu.com/v1/255a3171-abb-logo.svg",
    alt: "ABB",
    width: "120",
    height: "47",
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
    url: "https://assets.ubuntu.com/v1/5bf6fd2f-svg+%281%29.svg",
    alt: "DFI",
    width: "150",
    height: "100",
  },
  {
    url: "https://assets.ubuntu.com/v1/f6a59799-partner-logo-arm.svg",
    alt: "ARM",
    width: "112",
    height: "34",
  },
  {
    url: "https://assets.ubuntu.com/v1/e4ac6657-xilinx-inc-logo-vector.svg",
    alt: "Xilink",
    width: "150",
    height: "150",
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
for (i = 1; i <= 5; i += 1) {
  randomNum = Math.floor(Math.random() * partners_logo.length);
  const logo = partners_logo[randomNum];
  if (randomIndexArray.indexOf(randomNum) === -1) {
    randomIndexArray.push(randomNum);
    let element = `<div class="p-logo-section__item">
    <img src=${logo.url} alt=${logo.alt} width=${logo.width} height=${logo.height} loading="lazy" /> </div>`;
    logo_section_items.insertAdjacentHTML("beforeend", element);
  } else {
    i--;
  }
}
