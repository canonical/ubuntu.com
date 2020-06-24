const productNames = {
  "uai-essential-desktop": "UA Infra Essential Desktop",
  "uai-standard-desktop": "UA Infra Standard Desktop",
  "uai-advanced-desktop": "UA Infra Advanced Desktop",
  "uai-essential-physical-server": "UA Infra Essential Physical Server",
  "uai-standard-physical-server": "UA Infra Standar Physical Server",
  "uai-advanced-physical-server": "UA Infra Advance Physical Server",
  "uai-essential-virtual-server": "UA Infra Essential Virtual Server",
  "uai-standard-virtual-server": "UA Infra Standard Virtual Server",
  "uai-advanced-virtual-server": "UA Infra Advanced Virtual Server",
};

const cardBrandImages = {
  visa: "832cf121-visa.png",
  mastercard: "83a09dbe-mastercard.png",
  amex: "91e62c4f-amex.png",
};

function setModalTitle(title, modal) {
  const modalTitleEl = modal.querySelector("#modal-title");

  modalTitleEl.innerHTML = title;
}

function setSummaryInfo(infoArray, modal) {
  const infoContainer = modal.querySelector("#order-info");

  // clear anything that was there previously
  infoContainer.innerHTML = "";

  infoArray.forEach((item) => {
    const isLastItem = item === infoArray[infoArray.length - 1];
    const infoRow = buildInfoRow(item, isLastItem);

    infoContainer.innerHTML += infoRow;
  });

  infoContainer.classList.remove("u-hide");
}

function buildInfoRow(item, isLastItem) {
  return `<div class="row u-no-padding ${isLastItem ? "" : "u-sv1"}">
    <div class="col-3 u-text-light">${item.label}</div>
    <div class="col-9">${item.value}</div>
  </div>`;
}

function getProductsString(productsArrayString) {
  const arrayRegex = /[[\]']+/g;
  const isArray = arrayRegex.test(productsArrayString);
  let formattedString = "";

  if (isArray) {
    const productSlugs = productsArrayString
      .replace(arrayRegex, "")
      .split(", ");
    let products = [];

    productSlugs.forEach((slug) => {
      if (slug in productNames) {
        products.push(productNames[slug]);
      }
    });

    formattedString = products.join(", ");
  }

  return formattedString;
}

function formattedCurrency(amount, currency, locale) {
  const currencyString = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  }).format(parseFloat(amount / 100));

  return currencyString.replace(".00", "");
}

export function getPaymentInformation(paymentMethod) {
  const billingInfo = paymentMethod.billing_details;
  const cardInfo = paymentMethod.card;

  const formattedExpiryMonth = cardInfo.exp_month.toString().padStart(2, "0");
  const formattedExpiryYear = cardInfo.exp_year.toString().slice(-2);

  const cardBrandFormatted =
    cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);

  return {
    cardText: `${cardBrandFormatted} ending ${cardInfo.last4}`,
    cardExpiry: `${formattedExpiryMonth}/${formattedExpiryYear}`,
    cardImage: cardBrandImages[cardInfo.brand] || null,
    email: billingInfo.email,
    name: billingInfo.name,
  };
}

export function getRenewalInformation(data) {
  const contractEndDate = new Date(data.contractEnd);
  const startDate = new Date(
    contractEndDate.setDate(contractEndDate.getDate() + 1)
  );

  const endDate = new Date(
    contractEndDate.setMonth(contractEndDate.getMonth() + parseInt(data.months))
  );

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };

  return {
    endDate: endDate.toLocaleString("en-GB", dateOptions),
    name: `Renew &ldquo;${data.name}&rdquo;`,
    products: getProductsString(data.products),
    quantity: `${data.quantity} &#215; ${formattedCurrency(
      data.unitPrice,
      data.currency,
      "en-CA"
    )}/year`,
    startDate: startDate.toLocaleString("en-GB", dateOptions),
    total: formattedCurrency(data.total, data.currency, "en-US"),
  };
}

export function setPaymentInformation(paymentMethod, modal) {
  const paymentInfo = getPaymentInformation(paymentMethod);

  const cardExpiryEl = modal.querySelector(".js-customer-card-expiry");
  const cardImgEl = modal.querySelector(".js-customer-card-brand");
  const cardTextEl = modal.querySelector(".js-customer-card");
  const customerEmailEl = modal.querySelector(".js-customer-email");
  const customerNameEl = modal.querySelector(".js-customer-name");

  if (paymentInfo.cardImage) {
    cardImgEl.innerHTML = `<img src="https://assets.ubuntu.com/v1/${paymentInfo.cardImage}" />`;
    cardImgEl.classList.remove("u-hide");
  } else {
    cardImgEl.classList.add("u-hide");
  }

  cardTextEl.innerHTML = paymentInfo.cardText;
  cardExpiryEl.innerHTML = paymentInfo.cardExpiry;
  customerNameEl.innerHTML = paymentInfo.name;
  customerEmailEl.innerHTML = paymentInfo.email;
}

export function setRenewalInformation(data, modal) {
  const renewalInfo = getRenewalInformation(data);
  const renewalInfoArray = [
    {
      label: "Plan type:",
      value: renewalInfo.products,
    },
    {
      label: "Will continue from:",
      value: renewalInfo.startDate,
    },
    {
      label: "Ends:",
      value: renewalInfo.endDate,
    },
    {
      label: "Machines:",
      value: renewalInfo.quantity,
    },
    {
      label: "Subtotal:",
      value: renewalInfo.total,
    },
  ];

  setModalTitle(renewalInfo.name, modal);
  setSummaryInfo(renewalInfoArray, modal);
}
