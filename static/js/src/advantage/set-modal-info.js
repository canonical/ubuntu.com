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

function setSummaryInfo(summaryObject, modal) {
  const infoContainer = modal.querySelector("#order-info");
  const totalsContainer = modal.querySelector("#order-totals");

  // clear anything that was there previously
  infoContainer.innerHTML = "";
  totalsContainer.innerHTML = "";

  summaryObject.items.forEach((itemObject) => {
    const itemValues = Object.values(itemObject);

    itemValues.forEach((item) => {
      infoContainer.innerHTML += buildInfoRow(item);
    });
  });

  infoContainer.innerHTML += buildInfoRow({
    label: "Subtotal: ",
    value: summaryObject.subtotal,
  });

  totalsContainer.innerHTML += buildInfoRow({
    label: "VAT: ",
    value: summaryObject.vat,
  });

  totalsContainer.innerHTML += buildInfoRow({
    label: "Total: ",
    value: summaryObject.total,
  });

  infoContainer.classList.remove("u-hide");
  totalsContainer.classList.remove("u-hide");
}

function buildInfoRow(item) {
  return `<div class="row u-no-padding u-sv1">
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
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const startDate = new Date(
    contractEndDate.setDate(contractEndDate.getDate() + 1)
  );
  const endDate = new Date(
    contractEndDate.setMonth(contractEndDate.getMonth() + parseInt(data.months))
  );
  const quantityString = `${data.quantity} &#215; ${formattedCurrency(
    data.unitPrice,
    data.currency,
    "en-CA"
  )}/year`;

  return {
    endDate: endDate.toLocaleString("en-GB", dateOptions),
    name: `Renew &ldquo;${data.name}&rdquo;`,
    products: getProductsString(data.products),
    quantity: quantityString,
    startDate: startDate.toLocaleString("en-GB", dateOptions),
    subtotal: formattedCurrency(data.total, data.currency, "en-US"),
    total: formattedCurrency(data.total, data.currency, "en-US"),
    vat: formattedCurrency(0, data.currency, "en-US"),
  };
}

export function setOrderInformation(products, modal) {
  setModalTitle("Complete purchase", modal);
  setSummaryInfo(products, modal);
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
  const renewalSummary = {
    items: [
      {
        plan: {
          label: "Plan type:",
          value: renewalInfo.products,
        },
        start: {
          label: "Will continue from:",
          value: renewalInfo.startDate,
        },
        end: {
          label: "Ends:",
          value: renewalInfo.endDate,
        },
        quantity: {
          label: "Machines:",
          value: renewalInfo.quantity,
        },
      },
    ],
    subtotal: renewalInfo.subtotal,
    vat: renewalInfo.vat,
    total: renewalInfo.total,
  };

  setModalTitle(renewalInfo.name, modal);
  setSummaryInfo(renewalSummary, modal);
}
