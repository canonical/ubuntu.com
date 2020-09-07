import { add, format } from "date-fns";

const CARD_BRAND_IMAGES = {
  visa: "832cf121-visa.png",
  mastercard: "83a09dbe-mastercard.png",
  amex: "91e62c4f-amex.png",
};

const DATE_FORMAT = "dd MMMM yyyy";

const PRODUCT_NAMES = {
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

function buildInfoRow(item) {
  return `<div class="row u-no-padding u-sv1">
    <div class="col-3 u-text-light">${item.label}</div>
    <div class="col-9">${item.value}</div>
  </div>`;
}

function buildQuantityString(quantity, unitPrice, currency) {
  return `${quantity} &#215; ${formattedCurrency(
    unitPrice,
    currency,
    "en-CA"
  )}/year`;
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
      if (slug in PRODUCT_NAMES) {
        products.push(PRODUCT_NAMES[slug]);
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

    if (summaryObject.items.length > 1) {
      infoContainer.innerHTML += "<span class='u-sv2'></span>";
    }
  });

  infoContainer.innerHTML += buildInfoRow({
    label: "Subtotal: ",
    value: summaryObject.subtotal,
  });

  infoContainer.classList.remove("u-hide");
}

export function getOrderInformation(listings) {
  const items = [];
  const currency = "USD";
  const startDate = new Date();
  const endDate = add(new Date(), { months: 12 });
  let subtotal = 0;

  listings.forEach((listing, i) => {
    subtotal = subtotal + listing.quantity * listing.product.price.value;

    items.push({
      plan: {
        label: `Plan ${i + 1}:`,
        value: listing.product.name,
      },
      start: {
        label: "Starts:",
        value: format(startDate, DATE_FORMAT),
      },
      end: {
        label: "Ends:",
        value: format(endDate, DATE_FORMAT),
      },
      quantity: {
        label: "Machines:",
        value: buildQuantityString(
          listing.quantity,
          listing.product.price.value,
          currency
        ),
      },
    });
  });

  return {
    items: items,
    subtotal: formattedCurrency(subtotal, currency, "en-US"),
  };
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
    cardImage: CARD_BRAND_IMAGES[cardInfo.brand] || null,
    email: billingInfo.email,
    name: billingInfo.name,
  };
}

export function getRenewalInformation(data) {
  const startDate = add(new Date(data.contractEnd), { days: 1 });
  const endDate = add(new Date(data.contractEnd), {
    months: parseInt(data.months),
  });

  return {
    items: [
      {
        plan: {
          label: "Plan type:",
          value: getProductsString(data.products),
        },
        start: {
          label: "Will continue from:",
          value: format(startDate, DATE_FORMAT),
        },
        end: {
          label: "Ends:",
          value: format(endDate, DATE_FORMAT),
        },
        quantity: {
          label: "Machines:",
          value: buildQuantityString(
            data.quantity,
            data.unitPrice,
            data.currency
          ),
        },
      },
    ],
    subtotal: formattedCurrency(data.total, data.currency, "en-US"),
    total: formattedCurrency(data.total, data.currency, "en-US"),
    vat: formattedCurrency(0, data.currency, "en-US"),
  };
}

export function setOrderInformation(listings, modal) {
  const orderSummary = getOrderInformation(listings);

  setModalTitle("Complete purchase", modal);
  setSummaryInfo(orderSummary, modal);
}

export function setOrderTotal(taxAmount, totalAmount, modal) {
  const currency = "USD";
  const totalsContainer = modal.querySelector("#order-totals");
  // TODO: get VAT in local currency
  const vatCurrency = "USD";

  totalsContainer.innerHTML = "";

  totalsContainer.innerHTML += buildInfoRow({
    label: "VAT: ",
    value: formattedCurrency(taxAmount, vatCurrency, "en-US"),
  });

  totalsContainer.innerHTML += buildInfoRow({
    label: "Total: ",
    value: formattedCurrency(totalAmount, currency, "en-US"),
  });

  totalsContainer.classList.remove("u-hide");
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
  const renewalSummary = getRenewalInformation(data);

  setModalTitle(`Renew &ldquo;${data.name}&rdquo;`, modal);
  setSummaryInfo(renewalSummary, modal);
}
