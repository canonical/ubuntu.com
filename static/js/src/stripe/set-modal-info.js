function getCardImgFilename(brand) {
  switch (brand) {
    case "visa":
      return "832cf121-visa.png";
    case "mastercard":
      return "83a09dbe-mastercard.png";
    case "amex":
      return "91e62c4f-amex.png";
    default:
      return false;
  }
}

function getProductName(slug) {
  switch (slug) {
    case "uai-essential-desktop":
      return "Desktop Essential";
    case "uai-standard-desktop":
      return "Desktop Standard";
    case "uai-advanced-desktop":
      return "Desktop Advanced";
    case "uai-essential-physical-server":
      return "Physical Essential";
    case "uai-standard-physical-server":
      return "Physical Standard";
    case "uai-advanced-physical-server":
      return "Physical Advanced";
    case "uai-essential-virtual-server":
      return "Virtual Server Essential";
    case "uai-standard-virtual-server":
      return "Virtual Server Standard";
    case "uai-advanced-virtual-server":
      return "Virtual Server Advanced";
    default:
      return false;
  }
}

function getProductsString(productsString) {
  const productSlugs = eval(productsString);
  let productNames = [];
  let formattedString = "";

  if (productSlugs instanceof Array) {
    productSlugs.forEach((slug) => {
      productNames.push(getProductName(slug));
    });

    formattedString = productNames.join(", ");
  }

  return formattedString;
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
  const cardExpiry = `Expires: ${cardInfo.exp_month}/${cardInfo.exp_year}`;
  const cardImage = getCardImgFilename(cardInfo.brand);

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

  const formattedUnitPrice = parseFloat(data.unitPrice / 100).toLocaleString(
    "en",
    {
      style: "currency",
      currency: data.currency,
    }
  );

  const formattedTotal = parseFloat(data.total / 100).toLocaleString("en", {
    style: "currency",
    currency: data.currency,
  });

  contractNameElement.innerHTML = `Renew "${data.name}"`;
  endElement.innerHTML = renewalEndDate.toDateString();
  productNameElement.innerHTML = products;
  quantityElement.innerHTML = `${data.quantity} x ${formattedUnitPrice}/year`;
  startElement.innerHTML = renewalStartDate.toDateString();
  totalElement.innerHTML = formattedTotal;
}
