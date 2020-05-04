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

function getProductsString(productsString) {
  const productSlugs = eval(productsString);
  let products = [];
  let formattedString = "";

  if (productSlugs instanceof Array) {
    productSlugs.forEach((slug) => {
      if (slug in productNames) {
        products.push(productNames[slug]);
      }
    });

    formattedString = products.join(", ");
  }

  return formattedString;
}

function formattedCurrency(amount, currency) {
  const currencyString = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
  }).format(parseFloat(amount / 100));

  return currencyString.replace(".00", "");
}

export function setPaymentInformation(paymentMethod, modal) {
  const cardExpiryEl = modal.querySelector(".js-customer-card-expiry");
  const cardImgEl = modal.querySelector(".js-customer-card-brand");
  const cardTextEl = modal.querySelector(".js-customer-card");
  const customerEmailEl = modal.querySelector(".js-customer-email");
  const customerNameEl = modal.querySelector(".js-customer-name");
  const billingInfo = paymentMethod.billing_details;
  const cardInfo = paymentMethod.card;

  const cardBrandFormatted =
    cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);
  const cardText = `${cardBrandFormatted} ending ${cardInfo.last4}`;
  const cardExpiry = `${cardInfo.exp_month}/${cardInfo.exp_year}`;
  const cardImage = cardBrandImages[cardInfo.brand];

  if (cardImage) {
    cardImgEl.innerHTML = `<img src="https://assets.ubuntu.com/v1/${cardImage}" />`;
    cardImgEl.classList.remove("u-hide");
  } else {
    cardImgEl.classList.add("u-hide");
  }
  cardTextEl.innerHTML = cardText;
  cardExpiryEl.innerHTML = cardExpiry;
  customerNameEl.innerHTML = billingInfo.name;
  customerEmailEl.innerHTML = billingInfo.email;
}

export function setRenewalInformation(data, modal) {
  const contractNameElement = modal.querySelector(".js-contract-name");
  const endElement = modal.querySelector(".js-renewal-end");
  const productNameElement = modal.querySelector(".js-product-name");
  const quantityElement = modal.querySelector(".js-renewal-quantity");
  const startElement = modal.querySelector(".js-renewal-start");
  const totalElement = modal.querySelector(".js-renewal-total");

  const contractEndDate = new Date(data.contractEnd);
  const renewalStartDate = new Date(
    contractEndDate.setDate(contractEndDate.getDate() + 1)
  );

  const renewalEndDate = new Date(
    contractEndDate.setMonth(contractEndDate.getMonth() + parseInt(data.months))
  );

  const products = getProductsString(data.products);

  contractNameElement.innerHTML = `Renew "${data.name}"`;
  endElement.innerHTML = renewalEndDate.toISOString().split("T", 1)[0];
  productNameElement.innerHTML = products;
  quantityElement.innerHTML = `${data.quantity} &#215; ${
    (data.unitPrice, data.currency)
  }/year`;
  startElement.innerHTML = renewalStartDate.toISOString().split("T", 1)[0];
  totalElement.innerHTML = formattedCurrency(data.total, data.currency);
}
